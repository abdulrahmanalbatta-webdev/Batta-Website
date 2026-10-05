<script setup>
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import CoursesPanel from '@/components/academy/CoursesPanel.vue'
import { courses } from '@/data/courses'

const totalHours = courses.reduce((sum, c) => sum + c.hours, 0)
</script>

<template>
  <div>
    <PageHero title="الدورات" eyebrow="الأكاديمية" subtitle="كل دورة تنتهي بمشروع حقيقي تنشره على الإنترنت وتضيفه لملف أعمالك.">
      <span><BaseIcon name="play" :size="16" /><b>{{ courses.length }}</b> دورات</span>
      <span><BaseIcon name="clock" :size="16" /><b>{{ totalHours }}</b> ساعة محتوى</span>
      <span><BaseIcon name="award" :size="16" />شهادة إتمام لكل دورة</span>
    </PageHero>
    <section class="page-body">
      <div class="container"><CoursesPanel /></div>
    </section>
  </div>
</template>
