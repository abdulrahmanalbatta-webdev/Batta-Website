<script setup>
import { computed } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import BrandLogo from '@/components/ui/BrandLogo.vue'
import StarRating from '@/components/ui/StarRating.vue'
import { caseStudies } from '@/data/site'
import { useCourses, useStatsNumbers } from '@/composables/useContent'
import { useAuth } from '@/composables/useAuth'
import { useSettings } from '@/composables/useSettings'

// a preview of the student area, drawn from the real platform: your courses, their lessons and hours,
// the numbers from the dashboard, the latest case study, and the visitor's own name when signed in
const numbers = useStatsNumbers()
const { items: courses } = useCourses()
const { student } = useAuth()
const { settings } = useSettings()

const host = computed(() => {
  try {
    return new URL(settings.value?.site_url).host
  } catch {
    return 'batta.dev'
  }
})
const firstName = computed(() => student.value?.name?.trim().split(/\s+/)[0] ?? '')
const count = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—')
const lessons = computed(() => (courses.value.length ? courses.value.reduce((sum, c) => sum + (c.lessons || 0), 0) : null))
const course = computed(() => courses.value[0])
const project = computed(() => caseStudies[0])

// content hours per course (up to 7), as the mini chart
const series = computed(() => courses.value.slice(0, 7).map((c) => ({ label: c.glyph || c.title.slice(0, 6), hours: Number(c.hours) || 0 })))
const W = 300
const H = 92
const chart = computed(() => {
  const list = series.value.length === 1 ? [series.value[0], series.value[0]] : series.value
  if (!list.length) return null
  const max = Math.max(...list.map((p) => p.hours), 1) * 1.15
  // RTL: the first course on the right
  const pts = list.map((p, i) => [W - (i / (list.length - 1)) * W, H - (p.hours / max) * H])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  return { line, area: `${line} L0 ${H} L${W} ${H} Z`, last: pts.at(-1) }
})
const totalHours = computed(() => series.value.reduce((sum, p) => sum + p.hours, 0))
</script>

<template>
  <div class="showcase" aria-hidden="true">
    <!-- code editor (behind) -->
    <div class="editor">
      <div class="ed-bar">
        <span class="dots"><i /><i /><i /></span>
        <span class="tab active">CourseCard.vue</span>
        <span class="tab">api.js</span>
      </div>
      <pre class="code"><span class="ln">1</span><span class="k">&lt;script</span> <span class="a">setup</span><span class="k">&gt;</span>
<span class="ln">2</span><span class="k">const</span> progress = <span class="f">computed</span>(() =&gt;
<span class="ln">3</span>  done.value / total * <span class="n">100</span>
<span class="ln">4</span>)
<span class="ln">5</span><span class="k">&lt;/script&gt;</span></pre>
    </div>

    <!-- browser with student dashboard -->
    <div class="browser">
      <div class="br-bar">
        <span class="dots"><i /><i /><i /></span>
        <span class="url"><BaseIcon name="lock" :size="12" /> {{ host }}/my-courses</span>
      </div>

      <div class="app">
        <aside class="rail">
          <BrandLogo :size="24" :with-name="false" />
          <span class="r-btn active"><BaseIcon name="monitor" :size="16" /></span>
          <span class="r-btn"><BaseIcon name="play" :size="16" /></span>
          <span class="r-btn"><BaseIcon name="calendar" :size="16" /></span>
          <span class="r-btn"><BaseIcon name="award" :size="16" /></span>
        </aside>

        <div class="main">
          <div class="greet">
            <div>
              <b>{{ firstName ? `مرحباً، ${firstName}` : 'مرحباً بك' }}</b>
              <span>واصل من حيث توقفت</span>
            </div>
            <span class="avatar">{{ firstName ? [...firstName][0] : '' }}<BaseIcon v-if="!firstName" name="user" :size="16" /></span>
          </div>

          <div class="kpis">
            <div class="kpi"><span>الدورات</span><b>{{ count(numbers.courses) }}</b></div>
            <div class="kpi"><span>الدروس</span><b>{{ count(lessons) }}</b></div>
            <div class="kpi"><span>الطلاب</span><b>{{ count(numbers.students) }}</b></div>
          </div>

          <div v-if="chart" class="chart-card">
            <div class="chart-head">
              <span>ساعات المحتوى في كل دورة</span>
              <b>{{ count(totalHours) }} ساعة</b>
            </div>
            <svg class="chart" :viewBox="`-4 -8 ${W + 8} ${H + 12}`" preserveAspectRatio="none">
              <defs>
                <linearGradient id="hero-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#0066ff" stop-opacity="0.28" />
                  <stop offset="100%" stop-color="#0066ff" stop-opacity="0" />
                </linearGradient>
              </defs>
              <line v-for="g in 3" :key="g" x1="0" :x2="W" :y1="(H / 3) * g - H / 3" :y2="(H / 3) * g - H / 3" class="grid" />
              <path :d="chart.area" fill="url(#hero-area)" />
              <path :d="chart.line" class="stroke" />
              <circle :cx="chart.last[0]" :cy="chart.last[1]" r="4.5" class="dot" />
            </svg>
            <div class="days"><span v-for="(p, i) in series" :key="i">{{ p.label }}</span></div>
          </div>

          <div v-if="course" class="next">
            <span class="play"><BaseIcon name="play" :size="16" /></span>
            <div>
              <b>{{ course.title }}</b>
              <span>{{ course.lessons }} درساً · {{ course.level }}</span>
            </div>
            <span class="dur">{{ course.hours }} س</span>
          </div>
        </div>
      </div>
    </div>

    <!-- floating notifications -->
    <div v-if="project" class="toast deploy">
      <span class="ok"><BaseIcon name="check" :size="16" /></span>
      <div>
        <b>مشروع منجز: {{ project.title }}</b>
        <span>{{ project.tag }} · {{ project.sector }}</span>
      </div>
    </div>

    <div v-if="numbers.reviews" class="toast rating">
      <StarRating :size="13" />
      <b>{{ numbers.rating }}</b>
      <span>تقييم الطلاب</span>
    </div>
  </div>
</template>

<style scoped>
.showcase {
  position: relative;
  padding: 56px 0 48px 36px;
  min-width: 0;
}

.dots {
  display: inline-flex;
  gap: 6px;
}
.dots i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff5f57;
}
.dots i:nth-child(2) { background: #febc2e; }
.dots i:nth-child(3) { background: #28c840; }

/* ---------- editor ---------- */
.editor {
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  width: 62%;
  background: #0d1117;
  border: 1px solid #1f2633;
  border-radius: 16px;
  box-shadow: 0 30px 60px -20px rgba(11, 13, 18, 0.45);
  overflow: hidden;
  direction: ltr;
  transform: rotate(-3deg);
  transform-origin: top left;
}
.ed-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid #1f2633;
  background: #0b0f14;
}
.tab {
  font-family: var(--mono);
  font-size: 11px;
  color: #6b7686;
}
.tab.active {
  color: #c9d4e3;
}
.code {
  margin: 0;
  padding: 14px 16px 64px;
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.85;
  color: #c9d4e3;
  white-space: pre;
  text-align: left;
}
.ln {
  display: inline-block;
  width: 20px;
  color: #3d4654;
}
.k { color: #ff7b72; }
.a { color: #79c0ff; }
.f { color: #d2a8ff; }
.n { color: #79c0ff; }

/* ---------- browser ---------- */
.browser {
  position: relative;
  z-index: 1;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 40px 80px -24px rgba(0, 82, 204, 0.28), 0 8px 20px -8px rgba(11, 13, 18, 0.12);
  overflow: hidden;
}
.br-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  background: var(--tint-2);
  border-bottom: 1px solid var(--line);
  direction: ltr;
}
.url {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 99px;
  padding: 3px 12px;
  max-width: 260px;
  margin-inline: auto;
}
.app {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  min-height: 330px;
}
.rail {
  border-inline-end: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 14px 0;
  background: var(--bg);
}
.rail :deep(.brand) {
  margin-bottom: 6px;
}
.r-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: var(--muted);
}
.r-btn.active {
  background: var(--primary);
  color: #fff;
}
.main {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.greet {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.greet b {
  display: block;
  color: var(--fg);
  font-size: 15px;
  line-height: 1.4;
}
.greet span {
  font-size: 12px;
  color: var(--muted);
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--fg);
  color: #fff !important;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 13px !important;
}
.kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.kpi {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 8px 10px;
  line-height: 1.4;
}
.kpi span {
  font-size: 11px;
  color: var(--muted);
}
.kpi b {
  display: block;
  font-size: 18px;
  color: var(--fg);
  font-variant-numeric: tabular-nums;
}
.kpi:first-child b {
  color: var(--primary);
}
.kpi small {
  font-size: 11px;
  color: var(--muted);
  font-weight: 600;
}
.chart-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px 8px;
}
.chart-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 11.5px;
  color: var(--muted);
}
.chart-head b {
  color: var(--fg);
  font-size: 13px;
}
.chart {
  width: 100%;
  height: 78px;
  display: block;
  margin-top: 6px;
  direction: ltr;
}
.grid {
  stroke: var(--line);
  stroke-width: 1;
  stroke-dasharray: 3 4;
}
.stroke {
  fill: none;
  stroke: #0066ff;
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}
.dot {
  fill: #fff;
  stroke: #0066ff;
  stroke-width: 2.5;
  vector-effect: non-scaling-stroke;
}
.days {
  display: flex;
  justify-content: space-between;
  font-size: 9.5px;
  color: var(--muted);
  margin-top: 4px;
  direction: ltr;
  flex-direction: row-reverse;
}
.next {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--tint-2);
  border-radius: 12px;
  padding: 9px 10px;
}
.next .play {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: grid;
  place-items: center;
  flex: none;
}
.next div {
  flex: 1;
  min-width: 0;
  line-height: 1.4;
}
.next b {
  display: block;
  font-size: 12.5px;
  color: var(--fg);
}
.next div span {
  font-size: 11px;
  color: var(--muted);
}
.dur {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary-600);
  background: var(--primary-soft);
  padding: 1px 8px;
  border-radius: 99px;
}

/* ---------- floating toasts ---------- */
.toast {
  position: absolute;
  z-index: 2;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 10px;
  line-height: 1.4;
}
.deploy {
  bottom: 0;
  inset-inline-end: 0;
  padding: 12px 16px;
  animation: float 6s ease-in-out infinite;
}
.deploy .ok {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--green);
  color: #fff;
  display: grid;
  place-items: center;
  flex: none;
}
.deploy b {
  display: block;
  font-size: 13.5px;
  color: var(--fg);
}
.deploy span {
  font-size: 11.5px;
  color: var(--muted);
}
.rating {
  top: 4px;
  inset-inline-start: 24px;
  padding: 10px 14px;
  font-size: 12px;
  color: var(--muted);
  animation: float 7s ease-in-out infinite reverse;
}
.rating b {
  color: var(--fg);
  font-size: 14px;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@media (max-width: 980px) {
  .showcase {
    max-width: 560px;
    margin-inline: auto;
    width: 100%;
  }
}
@media (max-width: 560px) {
  .showcase {
    padding: 24px 0 56px;
  }
  .editor,
  .rating {
    display: none;
  }
  .app {
    grid-template-columns: 44px minmax(0, 1fr);
    min-height: 0;
  }
  .main {
    padding: 12px;
  }
  .deploy {
    inset-inline-end: 8px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .toast {
    animation: none;
  }
}
/* real course and project titles can be long */
.next > div,
.toast.deploy > div {
  min-width: 0;
}
.next b,
.toast.deploy b {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toast.deploy {
  max-width: 280px;
}
.days span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 48px;
}
</style>
