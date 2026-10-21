// صور إشعارات التحويل تُصغَّر في المتصفح قبل رفعها: لقطات شاشة الجوال كثيراً ما تتجاوز حدّ الخادم للرفع
// (فيرفض الطلب كله)، والرفع من اتصال بطيء يصبح أسرع. تصير JPEG على خلفية بيضاء بأطول ضلع 1600px.
const LIMIT = 1024 * 1024

export async function shrinkImage(file, maxSide = 1600) {
  if (!/^image\/(jpeg|png|webp)$/.test(file?.type)) return file
  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }
  const longest = Math.max(bitmap.width, bitmap.height)
  if (longest <= maxSide && file.size <= LIMIT) {
    bitmap.close()
    return file
  }
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  let best = null
  // smaller sides and lower qualities until it fits
  for (const side of [maxSide, Math.round(maxSide * 0.75), Math.round(maxSide * 0.55)]) {
    const scale = Math.min(1, side / longest)
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    for (const quality of [0.85, 0.72, 0.6]) {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
      if (blob && (!best || blob.size < best.size)) best = blob
      if (best && best.size <= LIMIT) break
    }
    if (best && best.size <= LIMIT) break
  }
  bitmap.close()
  if (!best || best.size >= file.size) return file
  return new File([best], `${file.name.replace(/\.\w+$/, '')}.jpg`, { type: 'image/jpeg' })
}

// what a single upload may weigh once images are shrunk (the server accepts 2 MB by default)
export const UPLOAD_LIMIT = 1.9 * 1024 * 1024
