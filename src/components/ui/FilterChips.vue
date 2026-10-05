<script setup>
const model = defineModel({ type: String, default: 'الكل' })

defineProps({
  options: { type: Array, required: true },
  allLabel: { type: String, default: 'الكل' },
})
</script>

<template>
  <div class="chips" role="group">
    <button
      v-for="option in [allLabel, ...options]"
      :key="option"
      type="button"
      class="chip"
      :aria-pressed="model === option"
      @click="model = option"
    >
      {{ option }}
    </button>
  </div>
</template>

<style scoped>
.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 5px;
  width: fit-content;
  max-width: 100%;
}
.chip {
  border: 0;
  background: transparent;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  color: var(--muted);
}
.chip:hover {
  color: var(--fg);
}
.chip[aria-pressed='true'] {
  background: var(--primary);
  color: var(--on-primary);
}
</style>
