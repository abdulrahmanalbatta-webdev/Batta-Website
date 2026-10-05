<script setup>
// حالة تحميل/خطأ/فراغ موحّدة للقوائم القادمة من لوحة التحكم
defineProps({
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  empty: { type: Boolean, default: false },
  emptyText: { type: String, default: 'لا يوجد شيء هنا بعد.' },
})
defineEmits(['retry'])
</script>

<template>
  <div v-if="loading" class="state" role="status">
    <span class="spinner" aria-hidden="true" />جارٍ التحميل…
  </div>
  <div v-else-if="error" class="state error" role="alert">
    <span>{{ error }}</span>
    <button class="btn btn-ghost" type="button" @click="$emit('retry')">حاول مجدداً</button>
  </div>
  <div v-else-if="empty" class="state">{{ emptyText }}</div>
</template>

<style scoped>
.state {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 48px 16px;
  color: var(--muted);
  text-align: center;
}
.state.error {
  color: var(--text);
}
.spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-inline-end-color: transparent;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
