<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AnnouncementBar from '@/components/layout/AnnouncementBar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import FloatingContact from '@/components/layout/FloatingContact.vue'
import FinalCta from '@/components/home/FinalCta.vue'
import ToastHost from '@/components/ui/ToastHost.vue'

const route = useRoute()
// صفحات الدخول والتسجيل تعرض بدون الهيدر والفوتر (meta.bare في الراوتر)
const bare = computed(() => route.meta.bare === true)
</script>

<template>
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
    <FinalCta />
    <AppFooter />
    <FloatingContact />
  </template>
  <ToastHost />
</template>
