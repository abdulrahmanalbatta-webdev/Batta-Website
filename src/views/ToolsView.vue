<script setup>
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import ToolsPanel from '@/components/resources/ToolsPanel.vue'
import { useTools } from '@/composables/useContent'
import { texts } from '@/data/texts'

const { items: tools } = useTools()
</script>

<template>
  <div>
    <PageHero :title="texts.ui.pages.tools" :eyebrow="texts.ui.pages.resources" :subtitle="texts.learning.tools.text">
      <span><BaseIcon name="code" :size="16" /><b>{{ tools.length }}</b> أداة</span>
      <span v-if="texts.learning.tools.badge"><BaseIcon name="check" :size="16" />{{ texts.learning.tools.badge }}</span>
    </PageHero>
    <section class="page-body">
      <div class="container"><ToolsPanel /></div>
    </section>
  </div>
</template>
