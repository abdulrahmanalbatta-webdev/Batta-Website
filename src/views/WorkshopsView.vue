<script setup>
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import WorkshopsPanel from '@/components/academy/WorkshopsPanel.vue'
import { workshops } from '@/data/site'
</script>

<template>
  <div>
    <PageHero title="الورش" eyebrow="الأكاديمية" subtitle="جلسات مباشرة من ساعتين إلى يوم كامل، تطبّق فيها مع مدرّب وتخرج بمشروع.">
      <span><BaseIcon name="calendar" :size="16" /><b>{{ workshops.length }}</b> ورش قادمة</span>
      <span><BaseIcon name="monitor" :size="16" />أونلاين وحضورياً</span>
      <span><BaseIcon name="users" :size="16" />ورش خاصة للفرق والجامعات</span>
    </PageHero>
    <section class="page-body">
      <div class="container"><WorkshopsPanel /></div>
    </section>
  </div>
</template>
