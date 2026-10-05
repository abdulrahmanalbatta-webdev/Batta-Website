<script setup>
defineProps({
  tool: { type: Object, required: true },
})
</script>

<template>
  <article class="card hover tool">
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
  </article>
</template>

<style scoped>
.tool {
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
