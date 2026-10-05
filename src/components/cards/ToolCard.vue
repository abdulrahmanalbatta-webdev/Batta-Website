<script setup>
import { api } from '@/lib/api'

const props = defineProps({
  tool: { type: Object, required: true },
})

// counts the visit in the dashboard's "clicks" column; never blocks the link
const countClick = () => api.post(`tools/${props.tool.id}/click`).catch(() => {})
</script>

<template>
  <component
    :is="tool.url ? 'a' : 'article'"
    class="card hover tool"
    v-bind="tool.url ? { href: tool.url, target: '_blank', rel: tool.affiliate ? 'sponsored noopener' : 'noopener' } : {}"
    @click="tool.url && countClick()"
  >
    <span class="logo">{{ tool.short }}</span>
    <div class="body">
      <div class="name">
        <h3>{{ tool.name }}</h3>
        <span v-if="tool.affiliate" class="pill">إحالة</span>
      </div>
      <p>{{ tool.why }}</p>
      <div class="meta">
        <span class="pill line">{{ tool.category }}</span>
        <span class="mono since">since {{ tool.since }}</span>
      </div>
    </div>
  </component>
</template>

<style scoped>
.tool {
  color: inherit;
  text-decoration: none;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
}
.logo {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  flex: none;
  font-family: var(--mono);
  font-size: 16px;
  font-weight: 600;
  direction: ltr;
  background: var(--tint-2);
  color: var(--fg);
  border: 1px solid var(--line);
}
.body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
}
.name {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.name h3 {
  font-size: 17px;
}
.since {
  font-size: 12px;
}
</style>
