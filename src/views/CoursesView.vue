<script setup>
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import CoursesPanel from '@/components/academy/CoursesPanel.vue'
import { useCourses } from '@/composables/useContent'
import { texts } from '@/data/texts'

const { items: courses } = useCourses()
</script>

<template>
  <div>
    <PageHero :title="texts.ui.pages.courses" :eyebrow="texts.ui.pages.academy" :subtitle="texts.learning.courses.text">
      <span><BaseIcon name="play" :size="16" /><b>{{ courses.length }}</b> دورات</span>
      <span v-if="texts.learning.courses.badge"><BaseIcon name="award" :size="16" />{{ texts.learning.courses.badge }}</span>
    </PageHero>
    <section class="page-body">
      <div class="container"><CoursesPanel /></div>
    </section>
  </div>
</template>
