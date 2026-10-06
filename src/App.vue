<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AnnouncementBar from '@/components/layout/AnnouncementBar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import FloatingContact from '@/components/layout/FloatingContact.vue'
import FinalCta from '@/components/home/FinalCta.vue'
import ToastHost from '@/components/ui/ToastHost.vue'
import BrandLogo from '@/components/ui/BrandLogo.vue'
import { useSettings } from '@/composables/useSettings'
import { texts } from '@/data/texts'

const route = useRoute()
// صفحات الدخول والتسجيل تعرض بدون الهيدر والفوتر (meta.bare في الراوتر)
const bare = computed(() => route.meta.bare === true)

// "وضع الصيانة" من إعدادات لوحة التحكم يخفي الموقع مؤقتاً
const { settings } = useSettings()
const maintenance = computed(() => settings.value?.maintenance_mode === true)
</script>

<template>
  <main v-if="maintenance" class="maintenance">
    <BrandLogo />
    <h1>{{ texts.general.maintenance.title }}</h1>
    <p>{{ texts.general.maintenance.text }}</p>
    <a v-if="settings.contact_email" class="btn btn-ghost" :href="`mailto:${settings.contact_email}`" dir="ltr">{{ settings.contact_email }}</a>
  </main>
  <template v-else>
  <template v-if="!bare">
    <AnnouncementBar />
    <AppHeader />
  </template>
  <main>
    <RouterView v-slot="{ Component, route: r }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="r.path" />
      </Transition>
    </RouterView>
  </main>
  <template v-if="!bare">
    <!-- the contact page already is the call to action -->
    <FinalCta v-if="route.name !== 'contact'" />
    <AppFooter />
    <FloatingContact />
  </template>
  </template>
  <ToastHost />
</template>

<style scoped>
.maintenance {
  min-height: 100vh;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 14px;
  padding: 24px 16px;
  text-align: center;
}
.maintenance h1 {
  font-size: 34px;
}
.maintenance p {
  color: var(--muted);
}
</style>
