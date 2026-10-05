<script setup>
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import ArticlesPanel from '@/components/resources/ArticlesPanel.vue'
import { useArticles } from '@/composables/useContent'

const { items: articles } = useArticles()
</script>

<template>
  <div>
    <PageHero title="المقالات" eyebrow="الموارد" subtitle="دروس عملية وتجارب من مشاريع حقيقية، تحل كل منها مشكلة واحدة بوضوح.">
      <span><BaseIcon name="article" :size="16" /><b>{{ articles.length }}</b> مقالات</span>
      <span><BaseIcon name="calendar" :size="16" />مقال جديد كل ثلاثاء</span>
    </PageHero>
    <section class="page-body">
      <div class="container"><ArticlesPanel /></div>
    </section>
  </div>
</template>
