<script setup>
import BaseIcon from '@/components/ui/BaseIcon.vue'

defineProps({
  blocks: { type: Array, required: true },
})

// ids for h2 headings, used by the table of contents
const headingId = (blocks, index) => `section-${blocks.slice(0, index + 1).filter((b) => b.type === 'h2').length}`
</script>

<template>
  <div class="prose">
    <template v-for="(block, i) in blocks" :key="i">
      <h2 v-if="block.type === 'h2'" :id="headingId(blocks, i)">{{ block.text }}</h2>
      <p v-else-if="block.type === 'p'">{{ block.text }}</p>
      <ul v-else-if="block.type === 'list'">
        <li v-for="item in block.items" :key="item">{{ item }}</li>
      </ul>
      <figure v-else-if="block.type === 'code'" class="code">
        <figcaption class="mono">{{ block.lang }}</figcaption>
        <pre><code>{{ block.code }}</code></pre>
      </figure>
      <aside v-else-if="block.type === 'tip'" class="tip">
        <BaseIcon name="bulb" :size="22" />
        <p>{{ block.text }}</p>
      </aside>
    </template>
  </div>
</template>

<style scoped>
.prose {
  font-size: 17.5px;
  line-height: 2;
  color: var(--text);
}
.prose > * + * {
  margin-top: 18px;
}
h2 {
  font-size: 26px;
  margin-top: 44px !important;
  padding-top: 4px;
}
ul {
  padding-inline-start: 22px;
  margin-bottom: 0;
}
li + li {
  margin-top: 6px;
}
li::marker {
  color: var(--primary);
}
.code {
  margin-inline: 0;
  margin-bottom: 0;
  border-radius: var(--r);
  overflow: hidden;
  background: var(--ink-panel);
  border: 1px solid #1f2633;
}
.code figcaption {
  font-size: 12px;
  color: #7d8796;
  padding: 8px 16px;
  border-bottom: 1px solid #1f2633;
  text-align: left;
}
pre {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  padding: 18px 20px;
  overflow-x: auto;
  direction: ltr;
  text-align: left;
}
pre code {
  font-family: var(--mono);
  color: #c9d4e3;
}
.tip {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: var(--primary-soft);
  border-inline-start: 4px solid var(--primary);
  border-radius: 10px;
  padding: 16px 18px;
  color: var(--primary-600);
}
.tip p {
  color: var(--fg);
  font-weight: 600;
  font-size: 16px;
  line-height: 1.8;
}
</style>
