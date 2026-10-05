<script setup>
import { computed } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import ProfilePhoto from '@/components/ui/ProfilePhoto.vue'
import StarRating from '@/components/ui/StarRating.vue'
import { profile } from '@/data/profile'
import { useCourses, useStatsNumbers } from '@/composables/useContent'

// صورتك بإطار أنيق، وحولها بطاقات تطفو بهدوء بأرقام حقيقية من لوحة التحكم:
// التقييم، الطلاب، المشاريع، وآخر دورة. كل بطاقة تختفي إن لم يكن لها رقم بعد.
const numbers = useStatsNumbers()
const { items: courses } = useCourses()
const course = computed(() => courses.value[0])
const count = (n) => n.toLocaleString('en-US')
</script>

<template>
  <div class="showcase">
    <div class="glow" aria-hidden="true" />
    <div class="ring" aria-hidden="true" />

    <figure class="portrait">
      <ProfilePhoto size="100%" rounded="28px" />
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
  place-items: center;
  padding: 40px 48px;
  min-width: 0;
}

/* soft light and a thin ring behind the frame */
.glow {
  position: absolute;
  width: 78%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 102, 255, 0.28), transparent 65%);
  filter: blur(20px);
}
.ring {
  position: absolute;
  width: 88%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1.5px dashed rgba(0, 102, 255, 0.22);
  animation: spin 60s linear infinite;
}

.portrait {
  position: relative;
  margin: 0;
  width: min(100%, 380px);
  aspect-ratio: 4 / 5;
  padding: 10px;
  border-radius: 36px;
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.55));
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 40px 80px -30px rgba(0, 82, 204, 0.45),
    0 0 0 1px rgba(0, 102, 255, 0.08);
  backdrop-filter: blur(8px);
}
.portrait :deep(.photo) {
  display: block;
  height: 100%;
}
.available {
  position: absolute;
  bottom: 24px;
  inset-inline-start: 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 99px;
  background: rgba(11, 13, 18, 0.7);
  backdrop-filter: blur(10px);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
.available i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.25);
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
  animation: float 6s ease-in-out infinite;
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
  top: 7%;
  inset-inline-start: 0;
}
.card-students {
  top: 27%;
  inset-inline-end: -4px;
  animation-delay: -1.5s;
}
.card-projects {
  top: 50%;
  inset-inline-start: -8px;
  animation-delay: -3s;
}
.card-course {
  bottom: 0;
  inset-inline-end: 0;
  max-width: 250px;
  animation-delay: -4.5s;
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

@media (max-width: 980px) {
  .showcase {
    max-width: 520px;
    margin-inline: auto;
    width: 100%;
  }
}
@media (max-width: 560px) {
  .showcase {
    padding: 24px 6px 64px;
  }
  .portrait {
    width: 78%;
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
    bottom: 14px;
    inset-inline-start: 14px;
    font-size: 12px;
  }
  .card-students {
    inset-inline-end: 0;
  }
  .card-projects {
    inset-inline-start: 0;
  }
  .card-course {
    bottom: 0;
    inset-inline-end: 0;
    max-width: 230px;
  }
  .card-course .cover {
    width: 40px;
    height: 40px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .float,
  .ring {
    animation: none;
  }
}
</style>
