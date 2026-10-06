<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import StarRating from '@/components/ui/StarRating.vue'
import { profile } from '@/data/profile'
import { useCourses, useStatsNumbers } from '@/composables/useContent'

// صورتك بدون خلفية وأنت تعرض بكفّك المفتوح: البطاقات تخرج من يدك وتطفو فوقها بأرقام حقيقية من لوحة التحكم
// (التقييم، الطلاب، المشاريع)، وآخر دورة تحت يدك. كل بطاقة تختفي إن لم يكن لها رقم بعد، والطبقات تميل قليلاً مع الماوس.
// الصورة: من لوحة التحكم (محتوى الموقع ← عنك ← صورتك بدون خلفية) وإلا src/assets/images/profile-cutout.(png|webp).
// أماكن البطاقات مضبوطة على وضعية هذه الصورة: الكفّ عند 88% من العرض و50% من الارتفاع.
const bundled = Object.values(import.meta.glob('@/assets/images/profile-cutout.{png,webp}', { eager: true, import: 'default' }))[0] ?? null
const cutout = computed(() => profile.cutout || bundled)
const numbers = useStatsNumbers()
const { items: courses } = useCourses()
const course = computed(() => courses.value[0])
const count = (n) => n.toLocaleString('en-US')

// a slight depth effect: the cards follow the pointer a little more than the photo does
const stage = ref(null)
const tilt = ref({ x: 0, y: 0 })
let frame = 0
function follow(event) {
  const box = stage.value?.getBoundingClientRect()
  if (!box) {
    return
  }
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    tilt.value = {
      x: Math.max(-1, Math.min(1, (event.clientX - box.left - box.width / 2) / (box.width / 2))),
      y: Math.max(-1, Math.min(1, (event.clientY - box.top - box.height / 2) / (box.height / 2))),
    }
  })
}
function settle() {
  tilt.value = { x: 0, y: 0 }
}
const moves = typeof window !== 'undefined' && window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches
onMounted(() => {
  if (moves) {
    window.addEventListener('pointermove', follow, { passive: true })
    document.addEventListener('pointerleave', settle)
  }
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('pointermove', follow)
  document.removeEventListener('pointerleave', settle)
})
const depth = computed(() => ({ '--tx': tilt.value.x, '--ty': tilt.value.y }))
</script>

<template>
  <div class="showcase">
    <div ref="stage" class="stage" :style="depth">
      <div class="halo" aria-hidden="true" />

      <img v-if="cutout" class="portrait" :src="cutout" :alt="profile.name" fetchpriority="high" />

      <!-- the light rising from your palm, with a few sparks -->
      <div class="beam" aria-hidden="true" />
      <div class="palm" aria-hidden="true">
        <span class="ring" />
        <i v-for="n in 5" :key="n" :style="{ '--n': n }" />
      </div>

      <div class="cards">
        <div v-if="numbers.reviews" class="float card-rating">
          <span class="ico amber"><BaseIcon name="star" :size="18" filled /></span>
          <div>
            <b>{{ numbers.rating }} <small>/ 5</small></b>
            <span class="sub"><StarRating :size="11" /> من {{ count(numbers.reviews) }} تقييم</span>
          </div>
        </div>

        <div v-if="numbers.students" class="float card-students">
          <span class="ico blue"><BaseIcon name="users" :size="18" /></span>
          <div>
            <b>{{ count(numbers.students) }}</b>
            <span>طالب ومتدرب</span>
          </div>
        </div>

        <div v-if="numbers.projects" class="float card-projects">
          <span class="ico green"><BaseIcon name="briefcase" :size="18" /></span>
          <div>
            <b>{{ count(numbers.projects) }}</b>
            <span>مشروعاً منجزاً</span>
          </div>
        </div>

        <RouterLink v-if="course" :to="{ name: 'course', params: { slug: course.slug } }" class="float card-course">
          <span class="cover">
            <img v-if="course.cover" :src="course.cover" alt="" />
            <span v-else class="glyph">{{ course.glyph }}</span>
          </span>
          <div>
            <span class="kicker"><BaseIcon name="award" :size="13" />أحدث دورة</span>
            <b>{{ course.title }}</b>
          </div>
        </RouterLink>
      </div>

      <span v-if="profile.available" class="available"><i />{{ profile.available }}</span>
    </div>
  </div>
</template>

<style scoped>
.showcase {
  display: grid;
  place-items: end center;
  padding: 16px 40px 0 8px;
  min-width: 0;
}

/* the photo's own proportions, so every position below is a point on the photo */
.stage {
  --tx: 0;
  --ty: 0;
  position: relative;
  width: min(100%, 500px);
  aspect-ratio: 1065 / 1288;
  direction: ltr;
  container-type: inline-size;
}

.halo {
  position: absolute;
  left: 2%;
  top: 6%;
  width: 78%;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle at 45% 40%, rgba(0, 102, 255, 0.2), transparent 62%),
    radial-gradient(circle at 75% 70%, rgba(124, 58, 237, 0.12), transparent 60%);
  animation: breathe 9s ease-in-out infinite;
}

/* you: rises in once, then barely moves with the pointer */
.portrait {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: translate(calc(var(--tx) * -4px), calc(var(--ty) * -3px));
  transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
  /* the photo is cut at the left shoulder and the waist: fade those edges into the page */
  mask-image: linear-gradient(to bottom, #000 82%, transparent 100%), linear-gradient(to right, transparent 0, #000 10%);
  mask-composite: intersect;
  -webkit-mask-image: linear-gradient(to bottom, #000 82%, transparent 100%), linear-gradient(to right, transparent 0, #000 10%);
  -webkit-mask-composite: source-in;
  animation: rise 1s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

/* a soft column of light from the palm up to the cards */
.beam {
  position: absolute;
  left: 72%;
  top: 2%;
  width: 34%;
  height: 47%;
  border-radius: 50% 50% 40% 40%;
  background: linear-gradient(to top, rgba(0, 102, 255, 0.22), rgba(0, 102, 255, 0.06) 60%, transparent);
  filter: blur(14px);
  transform-origin: 50% 100%;
  animation:
    beam-in 0.9s ease-out 0.6s both,
    beam 5s ease-in-out 1.5s infinite;
}
.palm {
  position: absolute;
  left: 88.5%;
  top: 47.5%;
  width: 0;
  height: 0;
}
.ring {
  position: absolute;
  left: -34px;
  top: -34px;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: 1.5px dashed rgba(0, 102, 255, 0.45);
  animation:
    pop 0.6s ease-out 0.5s both,
    spin 14s linear infinite;
}
.palm::before {
  content: '';
  position: absolute;
  left: -22px;
  top: -22px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 102, 255, 0.45), rgba(0, 102, 255, 0) 70%);
  animation: glow 3s ease-in-out infinite;
}
.palm i {
  position: absolute;
  left: calc((var(--n) - 3) * 9px);
  top: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--primary);
  opacity: 0;
  animation: spark 3.2s ease-out calc(var(--n) * 0.6s + 1s) infinite;
}

/* the cards come out of your palm, one after another, then float; they lean a little with the pointer */
.cards {
  position: absolute;
  inset: 0;
  direction: rtl;
  transform: translate(calc(var(--tx) * 10px), calc(var(--ty) * 8px));
  transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.float {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 12px 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow);
  color: inherit;
  white-space: nowrap;
  animation:
    emerge 0.8s cubic-bezier(0.2, 0.9, 0.3, 1.15) var(--in) both,
    float 6s ease-in-out calc(var(--in) + 0.8s) infinite;
}
.float > div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.float b {
  font-size: 20px;
  line-height: 1.2;
  color: var(--fg);
}
.float b small {
  font-size: 13px;
  color: var(--muted);
  font-weight: 600;
}
.float > div > span:not(.kicker) {
  font-size: 13px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ico {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
}
.ico.amber {
  background: #fff4e0;
  color: #d97706;
}
.ico.blue {
  background: var(--primary-soft);
  color: var(--primary);
}
.ico.green {
  background: var(--green-soft);
  color: var(--green);
}

/* --from-x / --from-y: from the palm to the card's centre, in stage widths (cqw) so it holds at every size */
.card-rating {
  top: 2%;
  right: -2%;
  --in: 0.8s;
  --from-x: 2.5cqw;
  --from-y: 49cqw;
}
.card-students {
  top: 16.5%;
  right: 14%;
  --in: 1s;
  --from-x: 14cqw;
  --from-y: 32cqw;
}
.card-projects {
  top: 31%;
  right: -4%;
  --in: 1.2s;
  --from-x: -3.5cqw;
  --from-y: 14cqw;
}
.card-course {
  top: 72%;
  right: -8%;
  max-width: 250px;
  --in: 1.4s;
  --from-x: 5cqw;
  --from-y: -35cqw;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}
.card-course:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-lg);
}
.card-course .cover {
  flex: none;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--cover);
  display: grid;
  place-items: center;
}
.card-course .cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.glyph {
  color: #fff;
  font-family: var(--mono);
  font-size: 13px;
  direction: ltr;
}
.kicker {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: var(--primary-600);
}
.card-course b {
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.available {
  position: absolute;
  z-index: 3;
  bottom: 5%;
  left: 12%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 99px;
  background: rgba(11, 13, 18, 0.82);
  backdrop-filter: blur(10px);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  direction: rtl;
  box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.35);
  animation: pop 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.3) 1.6s both;
}
.available i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: ping 2.4s ease-out infinite;
}

@keyframes emerge {
  from {
    opacity: 0;
    transform: translate(var(--from-x), var(--from-y)) scale(0.3);
  }
  60% {
    opacity: 1;
  }
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.06);
    opacity: 0.8;
  }
}
@keyframes beam-in {
  from {
    opacity: 0;
    transform: scaleY(0.2);
  }
}
@keyframes beam {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
@keyframes glow {
  0%,
  100% {
    transform: scale(0.85);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}
@keyframes spark {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.6);
  }
  15% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: translateY(-120px) scale(1);
  }
}
@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.92);
  }
}
@keyframes ping {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55);
  }
  80%,
  100% {
    box-shadow: 0 0 0 9px rgba(34, 197, 94, 0);
  }
}

@media (max-width: 980px) {
  .showcase {
    max-width: 540px;
    margin-inline: auto;
    width: 100%;
  }
}
@media (max-width: 560px) {
  .showcase {
    padding: 8px 28px 0 0;
  }
  .float {
    padding: 8px 10px 8px 9px;
    gap: 8px;
    border-radius: 13px;
  }
  .float b {
    font-size: 15px;
  }
  .float > div > span:not(.kicker) {
    font-size: 11px;
  }
  .ico {
    width: 30px;
    height: 30px;
    border-radius: 9px;
  }
  .card-course {
    right: -1%;
    max-width: 190px;
  }
  .card-course b {
    font-size: 13px;
  }
  .card-course .cover {
    width: 36px;
    height: 36px;
  }
  .available {
    font-size: 11px;
    padding: 6px 12px;
  }
  .ring {
    left: -24px;
    top: -24px;
    width: 48px;
    height: 48px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .float,
  .halo,
  .portrait,
  .beam,
  .ring,
  .palm::before,
  .palm i,
  .available,
  .available i {
    animation: none;
  }
  .palm i {
    display: none;
  }
}
</style>
