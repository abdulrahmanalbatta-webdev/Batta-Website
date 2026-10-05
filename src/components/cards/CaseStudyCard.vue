<script setup>
defineProps({
  study: { type: Object, required: true },
})
</script>

<template>
  <article class="card case">
    <div class="body">
      <span class="pill">{{ study.tag }}</span>
      <h3>{{ study.title }}</h3>
      <dl>
        <div><dt>المشكلة</dt><dd>{{ study.problem }}</dd></div>
        <div><dt>الحل</dt><dd>{{ study.solution }}</dd></div>
      </dl>
      <div class="tech">
        <span v-for="t in study.tech" :key="t" class="pill line mono">{{ t }}</span>
      </div>
    </div>
    <div class="kpis">
      <div v-for="[value, label] in study.kpis" :key="label" class="kpi">
        <b>{{ value }}</b>
        <span>{{ label }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.case {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 32px;
  padding: 28px;
}
.body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}
h3 {
  font-size: 22px;
}
dl {
  margin: 0;
  display: grid;
  gap: 10px;
}
dt {
  font-weight: 800;
  color: var(--fg);
  font-size: 14px;
}
dd {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
}
.tech {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.kpis {
  display: grid;
  gap: 12px;
  align-content: start;
}
.kpi {
  background: var(--tint-2);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px 16px;
}
.kpi b {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: var(--primary-600);
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
}
.kpi span {
  font-size: 13.5px;
  color: var(--muted);
}
@media (max-width: 820px) {
  .case {
    grid-template-columns: 1fr;
  }
  .kpis {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
