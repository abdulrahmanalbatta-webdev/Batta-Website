<script setup>
import { computed, ref } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { announcement } from '@/data/site'

// the text comes from the dashboard (محتوى الموقع ← شريط الإعلان); closing hides this text only, a new one shows again
const STORAGE_KEY = 'announcement-dismissed'
const dismissedText = ref('')
try {
  dismissedText.value = sessionStorage.getItem(STORAGE_KEY) ?? ''
} catch {
  /* storage unavailable */
}
const visible = computed(() => announcement.enabled && !!announcement.text && dismissedText.value !== announcement.text)

function close() {
  dismissedText.value = announcement.text
  try {
    sessionStorage.setItem(STORAGE_KEY, announcement.text)
  } catch {
    /* ignore */
  }
}
</script>

<template>
  <div v-if="visible" class="bar">
    <div class="container inner">
      <span class="dot" />
      <p>{{ announcement.text }}</p>
      <RouterLink :to="announcement.link" class="link">{{ announcement.linkLabel }} <BaseIcon name="arrow" :size="14" /></RouterLink>
      <button type="button" class="close" aria-label="إغلاق الإعلان" @click="close"><BaseIcon name="close" :size="16" /></button>
    </div>
  </div>
</template>

<style scoped>
.bar {
  background: var(--ink-panel);
  color: #d5dbe5;
  font-size: 14px;
}
.inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 42px;
  position: relative;
  padding-inline-end: 44px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.25);
  flex: none;
}
p {
  text-align: center;
}
.link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-weight: 700;
  white-space: nowrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}
.close {
  position: absolute;
  inset-inline-end: 12px;
  border: 0;
  background: none;
  color: #7d8796;
  cursor: pointer;
  display: grid;
  padding: 4px;
}
.close:hover {
  color: #fff;
}
@media (max-width: 620px) {
  .inner {
    font-size: 13px;
    justify-content: flex-start;
    padding-block: 8px;
  }
  .dot {
    display: none;
  }
}
</style>
