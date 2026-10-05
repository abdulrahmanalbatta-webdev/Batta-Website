<script setup>
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import ToolsPanel from '@/components/resources/ToolsPanel.vue'
import { useTools } from '@/composables/useContent'

const { items: tools } = useTools()
</script>

<template>
  <div>
    <PageHero title="أدواتي" eyebrow="الموارد" subtitle="الأدوات التي أعمل بها يومياً، ولماذا اخترت كل واحدة منها.">
      <span><BaseIcon name="code" :size="16" /><b>{{ tools.length }}</b> أداة</span>
      <span><BaseIcon name="check" :size="16" />أستخدمها في مشاريع حقيقية</span>
    </PageHero>
    <section class="page-body">
      <div class="container"><ToolsPanel /></div>
    </section>
  </div>
</template>
