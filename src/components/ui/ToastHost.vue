<script setup>
import { useToast } from '@/composables/useToast'

const { message, visible } = useToast()
</script>

<template>
  <div class="toast" :class="{ show: visible }" role="status" aria-live="polite">{{ message }}</div>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  inset-inline-start: 50%;
  transform: translate(50%, 10px);
  background: var(--fg);
  color: var(--bg);
  padding: 11px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 70;
  box-shadow: var(--shadow-lg);
  max-width: calc(100% - 32px);
}
.toast.show {
  opacity: 1;
  transform: translate(50%, 0);
}
</style>
