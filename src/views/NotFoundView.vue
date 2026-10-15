<script setup>
import { onMounted, onUnmounted } from 'vue'
import { texts } from '@/data/texts'

// unknown addresses answer 200 (one page app), so tell search engines not to index them
let robots
onMounted(() => {
  robots = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex' })
  document.head.append(robots)
})
onUnmounted(() => robots?.remove())

// the same design as public/404.html (what Vercel answers for a missing file)
const shortcuts = [
  { label: 'الخدمات', to: '/services' },
  { label: 'الدورات', to: '/courses' },
  { label: 'الورش', to: '/workshops' },
  { label: 'المقالات', to: '/articles' },
  { label: 'تواصل معي', to: '/contact' },
]
</script>

<template>
  <section class="not-found">
    <div class="container inner">
      <div class="code" aria-hidden="true">404</div>
      <h1>الصفحة غير موجودة</h1>
      <p>{{ texts.ui.not_found.text }}</p>
      <div class="actions">
        <RouterLink class="btn btn-primary btn-lg" to="/">{{ texts.ui.not_found.button }}</RouterLink>
        <RouterLink class="btn btn-ghost btn-lg" to="/contact">أبلغني عن الرابط</RouterLink>
      </div>
      <nav class="shortcuts" aria-label="صفحات قد تبحث عنها">
        <span>أو جرّب:</span>
        <RouterLink v-for="s in shortcuts" :key="s.to" :to="s.to">{{ s.label }}</RouterLink>
      </nav>
    </div>
  </section>
</template>

<style scoped>
.not-found {
  padding-block: 96px 120px;
  background: radial-gradient(ellipse at 50% 0%, var(--primary-soft) 0%, transparent 65%);
}
.inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}
.code {
  font-size: clamp(110px, 22vw, 180px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -4px;
  background: linear-gradient(135deg, var(--fg) 30%, var(--primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: rise 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
h1 {
  font-size: clamp(24px, 4vw, 32px);
}
p {
  max-width: 460px;
  color: var(--muted);
  font-size: 18px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}
.shortcuts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 28px;
  font-size: 14px;
  color: var(--muted);
}
.shortcuts a {
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--text);
  font-weight: 600;
  transition: border-color 0.15s, color 0.15s;
}
.shortcuts a:hover {
  border-color: var(--primary);
  color: var(--primary-600);
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .code {
    animation: none;
  }
}
</style>
