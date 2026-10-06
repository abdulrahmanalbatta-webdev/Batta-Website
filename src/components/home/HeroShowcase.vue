<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import StarRating from '@/components/ui/StarRating.vue'
import { profile } from '@/data/profile'
import { useSettings } from '@/composables/useSettings'
import { useCourses, useStatsNumbers } from '@/composables/useContent'

// بطاقة تعريف معلّقة بشريط (فكرة بطاقة مؤتمر Vercel Ship): تسقط عند فتح الصفحة وتتمرجح، والزائر يسحبها بالماوس
// أو بإصبعه فتتأرجح بفيزياء بسيطة، وبالضغط تنقلب لتظهر الأرقام الحقيقية من لوحة التحكم على ظهرها.
// الصورة: من لوحة التحكم (محتوى الموقع ← عنك ← صورتك بدون خلفية) وإلا src/assets/images/profile-cutout.(png|webp).
const bundled = Object.values(import.meta.glob('@/assets/images/profile-cutout.{png,webp}', { eager: true, import: 'default' }))[0] ?? null
const cutout = computed(() => profile.cutout || bundled)
const numbers = useStatsNumbers()
const { items: courses } = useCourses()
const course = computed(() => courses.value[0])
const { settings } = useSettings()
const brand = computed(() => settings.value?.site_name || 'Batta')
const count = (n) => n.toLocaleString('en-US')
const year = new Date().getFullYear()
const strapId = `strap-${useId()}`

const stage = ref(null)
const badge = ref(null)
const strap = ref(null)
const flipped = ref(false)
const touched = ref(false)

/**
 * The badge's clip is a point on a rope hanging from an anchor above the stage (Verlet integration:
 * the rope pulls, never pushes). The card turns towards the rope's direction with a little lag.
 */
const GRAVITY = 0.9
const DAMPING = 0.985
const anchor = { x: 0, y: 0 }
let ropeLength = 0
let position = { x: 0, y: 0 }
let previous = { x: 0, y: 0 }
let angle = 0
let spin = 0
let dragging = null
let frame = 0
let still = 0
let observer = null
let visible = true
const calm = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function measure() {
  const box = stage.value?.getBoundingClientRect()
  if (!box?.width) {
    return false
  }
  const narrow = box.width < 420
  anchor.x = box.width / 2
  anchor.y = narrow ? -80 : -170
  ropeLength = (narrow ? 36 : 56) - anchor.y
  return true
}

function rest() {
  position = { x: anchor.x, y: anchor.y + ropeLength }
  previous = { ...position }
  angle = 0
  spin = 0
}

function step() {
  if (!dragging) {
    const velocity = { x: (position.x - previous.x) * DAMPING, y: (position.y - previous.y) * DAMPING }
    previous = { ...position }
    position = { x: position.x + velocity.x, y: position.y + velocity.y + GRAVITY }
  }
  const dx = position.x - anchor.x
  const dy = position.y - anchor.y
  const distance = Math.hypot(dx, dy)
  const limit = dragging ? ropeLength * 1.12 : ropeLength
  if (distance > limit) {
    position = { x: anchor.x + (dx / distance) * limit, y: anchor.y + (dy / distance) * limit }
  }
  // the card follows the rope, swings a little past it, and leans with its own speed
  const target = -Math.atan2(position.x - anchor.x, position.y - anchor.y) - (position.x - previous.x) * 0.012
  spin = (spin + (target - angle) * 0.09) * 0.86
  angle += spin
}

function draw() {
  const card = badge.value
  if (!card) {
    return
  }
  card.style.transform = `translate(${position.x - card.offsetWidth / 2}px, ${position.y}px) rotate(${angle}rad)`
  const slack = Math.max(0, ropeLength - Math.hypot(position.x - anchor.x, position.y - anchor.y))
  const middle = { x: (anchor.x + position.x) / 2, y: (anchor.y + position.y) / 2 + slack * 0.7 }
  strap.value?.setAttribute('d', `M ${anchor.x} ${anchor.y} Q ${middle.x} ${middle.y} ${position.x} ${position.y + 4}`)
}

function tick() {
  step()
  draw()
  const moving = Math.hypot(position.x - previous.x, position.y - previous.y) + Math.abs(spin) * 40
  still = moving < 0.03 ? still + 1 : 0
  frame = !dragging && (still > 90 || !visible) ? 0 : requestAnimationFrame(tick)
}

function wake() {
  still = 0
  if (!frame && visible && !calm) {
    frame = requestAnimationFrame(tick)
  }
}

function pointFrom(event) {
  const box = stage.value.getBoundingClientRect()
  return { x: event.clientX - box.left, y: event.clientY - box.top }
}

function grab(event) {
  if (event.button > 0) {
    return
  }
  const point = pointFrom(event)
  dragging = { offset: { x: point.x - position.x, y: point.y - position.y }, from: point, at: performance.now(), moved: false }
  badge.value.setPointerCapture(event.pointerId)
  touched.value = true
  wake()
}

function drag(event) {
  if (!dragging || calm) {
    return
  }
  const point = pointFrom(event)
  if (Math.hypot(point.x - dragging.from.x, point.y - dragging.from.y) > 6) {
    dragging.moved = true
  }
  previous = { ...position }
  position = { x: point.x - dragging.offset.x, y: point.y - dragging.offset.y }
}

function drop() {
  if (!dragging) {
    return
  }
  const tapped = !dragging.moved && performance.now() - dragging.at < 400
  dragging = null
  if (tapped) {
    flip()
  }
  wake()
}

function flip() {
  flipped.value = !flipped.value
  touched.value = true
  // a small push, as if turned by hand
  previous = { x: position.x + 3, y: position.y }
  wake()
}

function resize() {
  if (measure()) {
    rest()
    draw()
  }
}

onMounted(() => {
  if (!measure()) {
    return
  }
  rest()
  if (!calm) {
    // drops in from above and swings into place
    position = { x: anchor.x + 80, y: anchor.y + ropeLength - 520 }
    previous = { ...position }
  }
  draw()
  observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) {
      wake()
    }
  })
  observer.observe(stage.value)
  window.addEventListener('resize', resize, { passive: true })
  wake()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <div class="showcase">
    <div ref="stage" class="stage">
      <svg class="strap" aria-hidden="true">
        <path :id="strapId" ref="strap" class="band" d="" />
        <text dy="4">
          <textPath :href="`#${strapId}`" startOffset="1%">{{ `${brand.toUpperCase()}  ✦  `.repeat(10) }}</textPath>
        </text>
      </svg>

      <div
        ref="badge"
        class="badge"
        :class="{ flipped }"
        role="button"
        tabindex="0"
        :aria-label="flipped ? 'اقلب البطاقة للوجه الأمامي' : 'اقلب البطاقة لترى الأرقام'"
        :aria-pressed="flipped"
        @pointerdown="grab"
        @pointermove="drag"
        @pointerup="drop"
        @pointercancel="drop"
        @keydown.enter.prevent="flip"
        @keydown.space.prevent="flip"
      >
        <span class="clip" aria-hidden="true" />
        <div class="flipper">
          <div class="face front">
            <div class="top">
              <span class="slot" />
              <b class="brand">{{ brand }}<i>.</i></b>
              <span class="year">{{ year }}</span>
            </div>
            <div class="photo">
              <img v-if="cutout" :src="cutout" :alt="profile.name" draggable="false" fetchpriority="high" />
            </div>
            <div class="who">
              <b>{{ profile.name }}</b>
              <span>{{ profile.role }}</span>
            </div>
            <div class="foot">
              <span v-if="profile.available" class="available"><i />{{ profile.available }}</span>
              <span class="turn">↻ اقلبني</span>
            </div>
          </div>

          <div class="face back" :inert="!flipped">
            <div class="top">
              <span class="slot" />
              <b class="brand">{{ brand }}<i>.</i></b>
              <span class="year">{{ year }}</span>
            </div>
            <ul class="numbers">
              <li v-if="numbers.reviews">
                <b>{{ numbers.rating }}<small>/5</small></b>
                <span><StarRating :size="11" /> {{ count(numbers.reviews) }} تقييم</span>
              </li>
              <li v-if="numbers.students">
                <b>{{ count(numbers.students) }}</b>
                <span>طالب ومتدرب</span>
              </li>
              <li v-if="numbers.projects">
                <b>{{ count(numbers.projects) }}</b>
                <span>مشروعاً منجزاً</span>
              </li>
            </ul>
            <RouterLink v-if="course" class="course" :to="{ name: 'course', params: { slug: course.slug } }" @pointerdown.stop>
              <span class="kicker"><BaseIcon name="award" :size="13" />أحدث دورة</span>
              <b>{{ course.title }}</b>
            </RouterLink>
            <RouterLink class="talk" :to="{ path: '/services', hash: '#contact' }" @pointerdown.stop>
              لنبدأ مشروعك <BaseIcon name="arrow" :size="15" />
            </RouterLink>
          </div>
        </div>
      </div>

      <span class="hint" :class="{ gone: touched }" aria-hidden="true">اسحب البطاقة أو اضغط عليها</span>
    </div>
  </div>
</template>

<style scoped>
.showcase {
  min-width: 0;
}
.stage {
  --card-w: 300px;
  --card-h: 440px;
  position: relative;
  height: 580px;
  direction: ltr;
}

/* the strap: a thick band with the site's name printed along it */
.strap {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.band {
  fill: none;
  stroke: var(--fg);
  stroke-width: 22;
  stroke-linecap: round;
}
.strap text {
  fill: #fff;
  font-family: var(--font);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 2px;
  opacity: 0.85;
}

.badge {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--card-w);
  height: var(--card-h);
  transform-origin: 50% 0;
  perspective: 1400px;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  outline: none;
}
.badge:active {
  cursor: grabbing;
}
.badge:focus-visible .face {
  outline: 3px solid var(--primary);
  outline-offset: 3px;
}
.clip {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: -14px;
  width: 34px;
  height: 30px;
  translate: -50% 0;
  border-radius: 7px 7px 5px 5px;
  background: linear-gradient(180deg, #eef1f5, #9aa4b2 55%, #c9d0da);
  box-shadow:
    inset 0 -2px 0 rgba(0, 0, 0, 0.18),
    0 3px 6px rgba(0, 0, 0, 0.25);
}
.clip::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 7px;
  width: 14px;
  height: 6px;
  translate: -50% 0;
  border-radius: 3px;
  background: #5b6472;
}

.flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.3, 1.3, 0.4, 1);
}
.badge.flipped .flipper {
  transform: rotateY(180deg);
}
.face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  border-radius: 22px;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  direction: rtl;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow:
    0 40px 60px -28px rgba(11, 20, 50, 0.45),
    0 12px 24px -12px rgba(11, 20, 50, 0.25);
}
.back {
  transform: rotateY(180deg);
  background: var(--ink-panel);
  border-color: #1f2735;
  color: #fff;
}

.top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26px 20px 12px;
}
.slot {
  position: absolute;
  left: 50%;
  top: 10px;
  width: 46px;
  height: 8px;
  translate: -50% 0;
  border-radius: 99px;
  background: var(--bg);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.18);
}
.back .slot {
  background: #1a212d;
}
.brand {
  font-size: 18px;
  font-weight: 900;
  direction: ltr;
  color: inherit;
}
.brand i {
  font-style: normal;
  color: var(--primary);
}
.year {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  font-family: var(--mono);
}
.back .year {
  color: var(--ink-text);
}

/* front: you, on a blue panel with a fine grid */
.photo {
  position: relative;
  flex: 1;
  margin: 0 14px;
  border-radius: 16px;
  overflow: hidden;
  background:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px) 0 0 / 22px 22px,
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px) 0 0 / 22px 22px,
    radial-gradient(circle at 50% 30%, #3b82f6, #0052cc 55%, #1e1b6b);
}
.photo img {
  position: absolute;
  left: 50%;
  top: 8%;
  width: 104%;
  max-width: none;
  translate: -50% 0;
  pointer-events: none;
}
.who {
  padding: 14px 20px 2px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.who b {
  font-size: 21px;
  line-height: 1.3;
  color: var(--fg);
}
.who span {
  font-size: 13px;
  color: var(--muted);
}
.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 20px 18px;
}
.available {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: var(--green);
}
.available i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  animation: ping 2.4s ease-out infinite;
}
.turn {
  flex: none;
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 99px;
  padding: 3px 10px;
}

/* back: the real numbers */
.numbers {
  list-style: none;
  margin: 4px 20px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.numbers li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #1f2735;
}
.numbers b {
  font-size: 30px;
  line-height: 1;
  font-weight: 900;
  direction: ltr;
}
.numbers small {
  font-size: 14px;
  color: var(--ink-text);
  margin-inline-start: 2px;
}
.numbers span {
  font-size: 13px;
  color: var(--ink-text);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.course {
  margin: 14px 20px 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: #151b26;
  border: 1px solid #222b3a;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.course .kicker {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: #6ea8ff;
}
.course b {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.talk {
  margin: auto 20px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px;
  border-radius: 99px;
  background: var(--primary);
  color: #fff;
  font-weight: 800;
  font-size: 14px;
}

.hint {
  position: absolute;
  left: 50%;
  bottom: 4px;
  translate: -50% 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--muted);
  direction: rtl;
  white-space: nowrap;
  transition: opacity 0.5s;
  animation: nudge 2.6s ease-in-out 2s infinite;
}
.hint.gone {
  opacity: 0;
}

@keyframes ping {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55);
  }
  80%,
  100% {
    box-shadow: 0 0 0 7px rgba(34, 197, 94, 0);
  }
}
@keyframes nudge {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@media (max-width: 980px) {
  .stage {
    max-width: 520px;
    margin-inline: auto;
  }
  /* the text sits above: the strap fades in instead of crossing it */
  .strap {
    mask-image: linear-gradient(to bottom, transparent -60px, #000 24px);
    -webkit-mask-image: linear-gradient(to bottom, transparent -60px, #000 24px);
  }
}
@media (max-width: 420px) {
  .stage {
    --card-w: 256px;
    --card-h: 380px;
    height: 470px;
  }
  .who b {
    font-size: 18px;
  }
  .numbers b {
    font-size: 24px;
  }
  .numbers li {
    padding: 9px 0;
  }
}
/* on touch screens a vertical swipe still scrolls the page; sideways swings the card */
@media (pointer: coarse) {
  .badge {
    touch-action: pan-y;
  }
}
@media (prefers-reduced-motion: reduce) {
  .flipper {
    transition: none;
  }
  .available i,
  .hint {
    animation: none;
  }
}
</style>
