<script setup>
import { computed } from 'vue'
import StarRating from '@/components/ui/StarRating.vue'
import { testimonials } from '@/data/site'
import { texts } from '@/data/texts'
import { useStatsNumbers } from '@/composables/useContent'

// الآراء على لوحة داكنة: العنوان ومتوسط التقييم على جهة، وعلى الجهة الأخرى عمودان يتحرّكان باتجاهين متعاكسين.
// كل عمود يحمل بطاقاته مرتين ليدور بلا انقطاع، ويتوقف عند المرور عليه
const numbers = useStatsNumbers()

// the first column holds every testimonial (the only one on phones); the second repeats them starting midway,
// so the two never show the same card side by side
const columns = computed(() => {
  const middle = Math.ceil(testimonials.length / 2)
  return [testimonials, [...testimonials.slice(middle), ...testimonials.slice(0, middle)]]
})
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="ink-panel panel">
        <header class="summary">
          <span class="eyebrow">{{ texts.home.testimonials.eyebrow }}</span>
          <h2>{{ texts.home.testimonials.title }}</h2>
          <p v-if="texts.home.testimonials.text">{{ texts.home.testimonials.text }}</p>
          <div v-if="numbers.reviews" class="score">
            <b>{{ numbers.rating }}</b>
            <div>
              <StarRating :size="16" />
              <small>من {{ numbers.reviews.toLocaleString('en-US') }} تقييماً من طلاب الدورات</small>
            </div>
          </div>
        </header>

        <div v-if="testimonials.length" class="columns">
          <div v-for="(column, c) in columns" :key="c" class="column" :class="{ down: c === 1 }">
            <template v-for="copy in 2" :key="copy">
              <figure v-for="t in column" :key="`${copy}-${t.name}`" class="quote" :aria-hidden="copy === 2 || c === 1 ? 'true' : undefined">
                <StarRating :size="15" />
                <blockquote>{{ t.text }}</blockquote>
                <figcaption>
                  <span class="avatar">{{ t.initial }}</span>
                  <div>
                    <b>{{ t.name }}</b>
                    <span>{{ t.role }}</span>
                  </div>
                </figcaption>
              </figure>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr);
  gap: 40px;
  align-items: center;
  padding: 48px;
}
.summary {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #7fb0ff;
  font-size: 14px;
  font-weight: 700;
}
.eyebrow::before {
  content: '';
  width: 22px;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
}
.summary h2 {
  font-size: clamp(26px, 3.4vw, 36px);
  line-height: 1.4;
  text-wrap: balance;
}
.summary p {
  font-size: 16.5px;
  max-width: 42ch;
}
.score {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 6px;
  padding: 14px 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
}
.score b {
  color: #fff;
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.score small {
  display: block;
  margin-top: 4px;
  font-size: 13px;
}

/* the moving columns, faded at the top and bottom */
.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 480px;
  overflow: hidden;
  mask-image: linear-gradient(transparent, #000 14%, #000 86%, transparent);
}
.column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: rise 38s linear infinite;
}
.column.down {
  animation-name: fall;
  animation-duration: 44s;
}
.columns:hover .column {
  animation-play-state: paused;
}
@keyframes rise {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(-50% - 8px));
  }
}
@keyframes fall {
  from {
    transform: translateY(calc(-50% - 8px));
  }
  to {
    transform: translateY(0);
  }
}
.quote {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
}
blockquote {
  margin: 0;
  color: #dfe4ec;
  font-size: 15px;
  line-height: 1.9;
}
figcaption {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #fff;
  background: var(--primary);
}
.quote:nth-child(3n + 2) .avatar {
  background: var(--green);
}
.quote:nth-child(3n) .avatar {
  background: #2a3342;
}
figcaption b {
  display: block;
  color: #fff;
  font-size: 15px;
}
figcaption span {
  font-size: 13px;
}

@media (max-width: 900px) {
  .panel {
    grid-template-columns: minmax(0, 1fr);
    padding: 32px 20px;
  }
  .columns {
    grid-template-columns: minmax(0, 1fr);
    height: 420px;
  }
  .column.down {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .column {
    animation: none;
  }
  .columns {
    overflow-y: auto;
    mask-image: none;
  }
}
</style>
