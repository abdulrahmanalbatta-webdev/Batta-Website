<script setup>
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import WorkshopsPanel from '@/components/academy/WorkshopsPanel.vue'
import { useWorkshops } from '@/composables/useContent'
import { texts } from '@/data/texts'

const { items: workshops } = useWorkshops()
</script>

<template>
  <div>
    <PageHero :title="texts.ui.pages.workshops" :eyebrow="texts.ui.pages.academy" :subtitle="texts.learning.workshops.text">
      <span><BaseIcon name="calendar" :size="16" /><b>{{ workshops.length }}</b> ورش قادمة</span>
      <span v-for="(badge, i) in texts.learning.workshops.badges" :key="badge"><BaseIcon :name="['monitor', 'users', 'check'][i]" :size="16" />{{ badge }}</span>
    </PageHero>
    <section class="page-body">
      <div class="container"><WorkshopsPanel /></div>
    </section>
  </div>
</template>
