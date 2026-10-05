<script setup>
import { computed } from 'vue'
import { siWhatsapp } from 'simple-icons'
import { profile } from '@/data/profile'
import { useContact } from '@/composables/useSettings'

defineProps({
  dark: { type: Boolean, default: false },
})

const MAIL = 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.2-8 5-8-5V6l8 5 8-5z'
const { email, whatsappUrl } = useContact()
// الحسابات من profile.js، وواتساب والبريد من إعدادات اللوحة
const links = computed(() => [
  ...profile.socials,
  ...(whatsappUrl.value ? [{ name: 'WhatsApp', url: whatsappUrl.value, path: siWhatsapp.path }] : []),
  ...(email.value ? [{ name: 'البريد', url: `mailto:${email.value}`, path: MAIL }] : []),
])
</script>

<template>
  <ul class="socials" :class="{ dark }">
    <li v-for="s in links" :key="s.name">
      <a :href="s.url" target="_blank" rel="noopener noreferrer" :aria-label="s.name" :title="s.name">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="s.path" /></svg>
      </a>
    </li>
  </ul>
</template>

<style scoped>
.socials {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
a {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--fg);
  transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s;
}
a:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
  transform: translateY(-2px);
}
svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
}
.dark a {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: #d5dbe5;
}
.dark a:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
</style>
