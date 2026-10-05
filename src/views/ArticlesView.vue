<script setup>
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import ArticlesPanel from '@/components/resources/ArticlesPanel.vue'
import { useArticles } from '@/composables/useContent'
import { texts } from '@/data/texts'

const { items: articles } = useArticles()
</script>

<template>
  <div>
    <PageHero title="المقالات" eyebrow="الموارد" :subtitle="texts.learning.articles.text">
      <span><BaseIcon name="article" :size="16" /><b>{{ articles.length }}</b> مقالات</span>
      <span v-if="texts.learning.articles.badge"><BaseIcon name="calendar" :size="16" />{{ texts.learning.articles.badge }}</span>
    </PageHero>
    <section class="page-body">
      <div class="container"><ArticlesPanel /></div>
    </section>
  </div>
</template>
