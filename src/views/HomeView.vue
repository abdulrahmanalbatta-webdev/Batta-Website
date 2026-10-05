<script setup>
import HeroSection from '@/components/home/HeroSection.vue'
import TechMarquee from '@/components/home/TechMarquee.vue'
import AboutSection from '@/components/home/AboutSection.vue'
import ServicesDark from '@/components/home/ServicesDark.vue'
import WhySection from '@/components/home/WhySection.vue'
import FeaturedProjects from '@/components/home/FeaturedProjects.vue'
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

const { items: courses } = useCourses()
const { items: articles } = useArticles()
const { items: workshops } = useWorkshops()
const latestArticles = computed(() => articles.value.slice(0, 3))
</script>

<template>
  <div>
    <HeroSection />
    <TechMarquee />
    <AboutSection />
    <ServicesDark />
    <WhySection />

    <section class="section">
      <div class="container">
        <SectionHeading eyebrow="الأكاديمية" title="تعلّم بالتطبيق، لا بالتلقين" subtitle="دورات تنتهي بمشروع حقيقي تنشره وتضيفه لملف أعمالك." />
        <div class="grid g3">
          <CourseCard v-for="c in courses.slice(0, 3)" :key="c.id" :course="c" />
        </div>
        <div class="center-row">
          <RouterLink class="btn btn-ghost btn-lg" to="/courses">كل الدورات <BaseIcon name="arrow" :size="18" /></RouterLink>
        </div>
      </div>
    </section>

    <FeaturedProjects />

    <section class="section">
      <div class="container">
        <SectionHeading eyebrow="المقالات" title="آخر ما كتبت" subtitle="دروس قصيرة ومركزة تحل مشكلة واحدة بوضوح." />
        <div class="grid g3">
          <ArticleCard v-for="a in latestArticles" :key="a.id" :article="a" />
        </div>
        <div class="center-row">
          <RouterLink class="btn btn-ghost btn-lg" to="/articles">كل المقالات <BaseIcon name="arrow" :size="18" /></RouterLink>
        </div>
      </div>
    </section>

    <section v-if="workshops.length" class="section tinted">
      <div class="container">
        <SectionHeading eyebrow="الورشة القادمة" title="احجز مقعدك قبل اكتمال العدد" />
        <WorkshopCard :workshop="workshops[0]" />
      </div>
    </section>

    <TestimonialsSection />
    <FaqSection class="tinted" />
    <NewsletterCta />
  </div>
</template>
