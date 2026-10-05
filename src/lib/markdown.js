// محتوى المقال يُكتب في لوحة التحكم بصيغة Markdown بسيطة:
//   ## عنوان   - عنصر قائمة   > نصيحة   ```lang … ```   **عريض**  _مائل_  [رابط](url)
// نحوّله إلى الكتل التي يعرضها ArticleBody (h2 | p | list | code | tip)، كنص فقط (بدون HTML).

// الصيغ داخل السطر تُزال ويبقى النص
const plain = (text) =>
  text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|\W)_([^_]+)_(?=\W|$)/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .trim()

export function markdownToBlocks(source = '') {
  const blocks = []
  const lines = String(source).replace(/\r\n?/g, '\n').split('\n')
  let paragraph = []

  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'p', text: plain(paragraph.join(' ')) })
    paragraph = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      flush()
      const lang = trimmed.slice(3).trim()
      const code = []
      while (++i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i])
      blocks.push({ type: 'code', lang, code: code.join('\n') })
    } else if (/^#{1,6}\s/.test(trimmed)) {
      flush()
      blocks.push({ type: 'h2', text: plain(trimmed.replace(/^#+\s*/, '')) })
    } else if (/^([-*]|\d+[.)])\s/.test(trimmed)) {
      flush()
      const items = []
      while (i < lines.length && /^([-*]|\d+[.)])\s/.test(lines[i].trim())) items.push(plain(lines[i++].trim().replace(/^([-*]|\d+[.)])\s+/, '')))
      i--
      blocks.push({ type: 'list', items })
    } else if (trimmed.startsWith('>')) {
      flush()
      const tip = []
      while (i < lines.length && lines[i].trim().startsWith('>')) tip.push(lines[i++].trim().replace(/^>\s?/, ''))
      i--
      blocks.push({ type: 'tip', text: plain(tip.join(' ')) })
    } else if (!trimmed) {
      flush()
    } else {
      paragraph.push(trimmed)
    }
  }
  flush()

  return blocks.filter((b) => b.type === 'code' || b.type === 'list' || b.text)
}
