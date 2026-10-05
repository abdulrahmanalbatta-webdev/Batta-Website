<script setup>
import PageHero from '@/components/ui/PageHero.vue'
import CaseStudyCard from '@/components/cards/CaseStudyCard.vue'
import { caseStudies } from '@/data/site'
</script>

<template>
  <div>
    <PageHero title="الأعمال" subtitle="دراسات حالة: المشكلة، ما بنيته، والنتيجة بالأرقام." />

    <section class="page-body">
      <div class="container">
        <CaseStudyCard v-for="s in caseStudies" :key="s.id" :study="s" />

        <div class="ink-panel cta">
          <div>
            <h2>عندك مشروع مشابه؟</h2>
            <p>احكِ لي عنه، وأرسل لك خطة وسعراً واضحاً خلال يومين.</p>
          </div>
          <RouterLink class="btn btn-primary btn-lg" :to="{ path: '/services', hash: '#contact' }">ابدأ مشروعك</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.cta h2 {
  font-size: 22px;
}
</style>
