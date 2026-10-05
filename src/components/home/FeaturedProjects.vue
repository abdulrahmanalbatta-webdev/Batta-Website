<script setup>
import BaseIcon from '@/components/ui/BaseIcon.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import { caseStudies } from '@/data/site'
</script>

<template>
  <section class="section tinted">
    <div class="container">
      <SectionHeading eyebrow="مشاريع مميزة" title="نتائج حقيقية بأرقام واضحة" subtitle="أمثلة من مشاريع سلّمتها، وما الذي تغيّر بعدها." />

      <div class="grid g3">
        <RouterLink v-for="p in caseStudies" :key="p.id" to="/work" class="project">
          <div class="top">
            <span class="sector">{{ p.sector }}</span>
            <span class="tag">{{ p.tag }}</span>
          </div>
          <h3>{{ p.title }}</h3>
          <p>{{ p.solution }}</p>
          <div class="result">
            <span class="r-label">النتيجة</span>
            <div class="kpis">
              <div v-for="[value, label] in p.kpis" :key="label">
                <b>{{ value }}</b><span>{{ label }}</span>
              </div>
            </div>
          </div>
          <div class="tech">
            <span v-for="t in p.tech" :key="t" class="mono">{{ t }}</span>
          </div>
        </RouterLink>
      </div>

      <div class="center-row">
        <RouterLink class="btn btn-ghost btn-lg" to="/work">ملف الأعمال كاملاً <BaseIcon name="arrow" :size="18" /></RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.project {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}
.project:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow);
  border-color: var(--line-2);
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.sector {
  font-size: 13px;
  font-weight: 700;
  color: var(--muted);
}
.tag {
  font-size: 12.5px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 99px;
  background: var(--fg);
  color: #fff;
}
h3 {
  font-size: 20px;
  transition: color 0.2s;
}
.project:hover h3 {
  color: var(--primary-600);
}
p {
  color: var(--muted);
  font-size: 15px;
}
.result {
  background: var(--tint-2);
  border-radius: 14px;
  padding: 14px 16px;
  margin-top: auto;
}
.r-label {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--muted);
}
.kpis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 4px;
}
.kpis b {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: var(--primary-600);
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
}
.kpis span {
  font-size: 13px;
  color: var(--muted);
}
.tech {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tech span {
  font-size: 12px;
  padding: 2px 8px;
  border: 1px solid var(--line);
  border-radius: 99px;
  color: var(--muted);
}
</style>
