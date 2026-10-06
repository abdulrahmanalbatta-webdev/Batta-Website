<script setup>
import { computed } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import StarRating from '@/components/ui/StarRating.vue'
import { profile } from '@/data/profile'
import { useCourses, useStatsNumbers } from '@/composables/useContent'

// صورتك بدون خلفية تقف مباشرة على خلفية القسم، وحولها بطاقات تطفو بهدوء بأرقام حقيقية من لوحة التحكم:
// التقييم، الطلاب، المشاريع، وآخر دورة. كل بطاقة تختفي إن لم يكن لها رقم بعد.
// الصورة: من لوحة التحكم (محتوى الموقع ← عنك ← صورتك بدون خلفية) وإلا src/assets/images/profile-cutout.(png|webp)
const bundled = Object.values(import.meta.glob('@/assets/images/profile-cutout.{png,webp}', { eager: true, import: 'default' }))[0] ?? null
const cutout = computed(() => profile.cutout || bundled)
const numbers = useStatsNumbers()
const { items: courses } = useCourses()
const course = computed(() => courses.value[0])
const count = (n) => n.toLocaleString('en-US')
</script>

<template>
  <div class="showcase">
    <div class="halo" aria-hidden="true" />
    <div class="orbit" aria-hidden="true"><i /></div>

    <figure class="portrait">
      <img v-if="cutout" :src="cutout" :alt="profile.name" fetchpriority="high" />
      <figcaption v-if="profile.available" class="available"><i />{{ profile.available }}</figcaption>
    </figure>

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
</template>

<style scoped>
.showcase {
  position: relative;
  display: grid;
  place-items: end center;
  padding: 24px 48px 0;
  min-width: 0;
  min-height: 520px;
}

/* a soft circle of light behind you, and a thin orbit with a travelling dot */
.halo {
  position: absolute;
  bottom: 6%;
  width: min(82%, 440px);
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 35%, rgba(0, 102, 255, 0.22), transparent 62%),
    radial-gradient(circle at 70% 75%, rgba(124, 58, 237, 0.12), transparent 60%);
  animation: breathe 9s ease-in-out infinite;
}
.orbit {
  position: absolute;
  bottom: 2%;
  width: min(94%, 500px);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(0, 102, 255, 0.16);
  animation: spin 40s linear infinite;
}
.orbit i {
  position: absolute;
  top: 50%;
  left: -5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 0 5px rgba(0, 102, 255, 0.15);
}

/* you, without a background: rises in once, then floats very slightly */
.portrait {
  position: relative;
  z-index: 1;
  margin: 0;
  width: min(100%, 420px);
  animation: rise 1s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.portrait img {
  display: block;
  width: 100%;
  height: auto;
  /* the photo ends at the waist: fade it into the page */
  /* the photo is cut at the waist and the shoulder: fade those edges into the page */
  mask-image: linear-gradient(to bottom, #000 80%, transparent 100%), linear-gradient(to right, transparent 0, #000 9%, #000 94%, transparent 100%);
  mask-composite: intersect;
  -webkit-mask-image: linear-gradient(to bottom, #000 80%, transparent 100%), linear-gradient(to right, transparent 0, #000 9%, #000 94%, transparent 100%);
  -webkit-mask-composite: source-in;
  animation: drift 8s ease-in-out 1s infinite;
}
.available {
  position: absolute;
  bottom: 4%;
  left: 50%;
  translate: -50% 0;
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
  box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.35);
  animation: pop 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.3) 0.9s both;
}
.available i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: ping 2.4s ease-out infinite;
}

/* the floating cards */
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
  animation:
    pop 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.3) var(--in, 0.4s) both,
    float 6s ease-in-out calc(var(--in, 0.4s) + 0.6s) infinite;
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

.card-rating {
  top: 10%;
  inset-inline-start: 0;
  --in: 0.35s;
}
.card-students {
  top: 30%;
  inset-inline-end: -4px;
  --in: 0.5s;
}
.card-projects {
  top: 54%;
  inset-inline-start: -8px;
  --in: 0.65s;
}
.card-course {
  top: 70%;
  inset-inline-end: 0;
  max-width: 250px;
  --in: 0.8s;
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
  white-space: nowrap;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
}
@keyframes drift {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
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
    max-width: 520px;
    margin-inline: auto;
    width: 100%;
  }
}
@media (max-width: 560px) {
  .showcase {
    padding: 16px 6px 0;
    min-height: 0;
  }
  .portrait {
    width: 80%;
  }
  .float {
    padding: 9px 12px 9px 10px;
    gap: 9px;
    border-radius: 14px;
  }
  .float b {
    font-size: 16px;
  }
  .ico {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }
  .card-rating {
    top: 3%;
  }
  .available {
    font-size: 12px;
    bottom: 3%;
  }
  .card-students {
    inset-inline-end: 0;
  }
  .card-projects {
    inset-inline-start: 0;
  }
  .card-course {
    top: 72%;
    inset-inline-end: 0;
    max-width: 230px;
  }
  .card-projects {
    top: 50%;
  }
  .card-course .cover {
    width: 40px;
    height: 40px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .float,
  .halo,
  .orbit,
  .portrait,
  .portrait img,
  .available,
  .available i {
    animation: none;
  }
}
</style>
