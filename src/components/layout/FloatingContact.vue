<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useContact } from '@/composables/useSettings'

const { whatsappUrl } = useContact()

const showTop = ref(false)
const onScroll = () => (showTop.value = window.scrollY > 700)
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<template>
  <div class="floating">
    <a v-if="whatsappUrl" class="chat" :href="whatsappUrl" target="_blank" rel="noopener" aria-label="تواصل معي على واتساب">
      <BaseIcon name="chat" :size="22" />
      <span class="tip">واتساب</span>
    </a>
    <RouterLink v-else class="chat" :to="{ path: '/services', hash: '#contact' }" aria-label="تواصل معي">
      <BaseIcon name="chat" :size="22" />
      <span class="tip">تواصل معي</span>
    </RouterLink>
    <Transition name="fade">
      <button v-if="showTop" class="top" type="button" aria-label="العودة للأعلى" @click="toTop">
        <BaseIcon name="up" :size="20" />
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.floating {
  position: fixed;
  inset-inline-start: 20px;
  bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  z-index: 35;
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
}
.chat,
.top {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 0;
  cursor: pointer;
  position: relative;
}
.chat {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 12px 28px -8px rgba(0, 102, 255, 0.6);
}
.chat::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--primary);
  animation: ring 2.4s ease-out infinite;
}
@keyframes ring {
  from { transform: scale(1); opacity: 0.6; }
  to { transform: scale(1.5); opacity: 0; }
}
.tip {
  position: absolute;
  inset-inline-start: 64px;
  white-space: nowrap;
  background: var(--fg);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 99px;
  opacity: 0;
  transform: translateX(6px);
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
}
.chat:hover .tip {
  opacity: 1;
  transform: none;
}
.top {
  width: 46px;
  height: 46px;
  margin-inline: 4px;
  background: var(--surface);
  color: var(--fg);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
