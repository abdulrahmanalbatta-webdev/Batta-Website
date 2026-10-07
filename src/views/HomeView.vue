<script setup>
import HeroSection from '@/components/home/HeroSection.vue'
import AboutSection from '@/components/home/AboutSection.vue'
import ServicesDark from '@/components/home/ServicesDark.vue'
import WhySection from '@/components/home/WhySection.vue'
import TestimonialsSection from '@/components/home/TestimonialsSection.vue'
import FaqSection from '@/components/home/FaqSection.vue'
import NewsletterCta from '@/components/home/NewsletterCta.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import CourseCard from '@/components/cards/CourseCard.vue'
import ArticleCard from '@/components/cards/ArticleCard.vue'
import WorkshopCard from '@/components/cards/WorkshopCard.vue'
import { computed } from 'vue'
import { useArticles, useCourses, useWorkshops } from '@/composables/useContent'
import { texts } from '@/data/texts'

const { items: courses } = useCourses()
const { items: articles } = useArticles()
const { items: workshops } = useWorkshops()
const latestArticles = computed(() => articles.value.slice(0, 3))
</script>

<template>
  <div>
    <HeroSection />
    <AboutSection />
    <ServicesDark />
    <WhySection />

    <section class="section">
      <div class="container">
        <SectionHeading :eyebrow="texts.home.courses.eyebrow" :title="texts.home.courses.title" :subtitle="texts.home.courses.text" />
        <div class="grid g3">
          <CourseCard v-for="c in courses.slice(0, 3)" :key="c.id" :course="c" />
        </div>
        <div class="center-row">
          <RouterLink class="btn btn-ghost btn-lg" to="/courses">{{ texts.ui.buttons.all_courses }} <BaseIcon name="arrow" :size="18" /></RouterLink>
        </div>
      </div>
    </section>


    <section class="section">
      <div class="container">
        <SectionHeading :eyebrow="texts.home.articles.eyebrow" :title="texts.home.articles.title" :subtitle="texts.home.articles.text" />
        <div class="grid g3">
          <ArticleCard v-for="a in latestArticles" :key="a.id" :article="a" />
        </div>
        <div class="center-row">
          <RouterLink class="btn btn-ghost btn-lg" to="/articles">{{ texts.ui.buttons.all_articles }} <BaseIcon name="arrow" :size="18" /></RouterLink>
        </div>
      </div>
    </section>

    <section v-if="workshops.length" class="section tinted">
      <div class="container">
        <SectionHeading :eyebrow="texts.home.workshop.eyebrow" :title="texts.home.workshop.title" />
        <WorkshopCard :workshop="workshops[0]" />
      </div>
    </section>

    <TestimonialsSection />
    <FaqSection class="tinted" />
    <NewsletterCta />
  </div>
</template>
