<script setup>
import { computed } from 'vue'
import { heroBackdrop } from '@/data/site'
import { profile } from '@/data/profile'

// صورتك أمام كلمات إنجليزية ضخمة (أسلوب أغلفة المجلات): الكلمات تنزلق عند فتح الصفحة ثم تنساب ببطء، وصورتك تصعد
// أمامها. الصورة والكلمات من لوحة التحكم (محتوى الموقع ← عنك ← صورتك في أعلى الرئيسية، والرئيسية ← العنوان الرئيسي)؛
// بدون صورة يظهر أول حرف من اسمك.
const cutout = computed(() => profile.cutout)
</script>

<template>
  <div class="showcase">
    <div class="words" dir="ltr" aria-hidden="true">
      <span v-for="(word, i) in heroBackdrop" :key="`${i}-${word}`" :class="{ accent: i === 1 }" :style="{ '--i': i }">{{ word }}</span>
    </div>

    <img v-if="cutout" class="photo" :src="cutout" :alt="profile.name" fetchpriority="high" draggable="false" />
    <span v-else class="monogram" aria-hidden="true">{{ profile.initial }}</span>

    <div class="sig">
      <b>{{ profile.name }}</b>
      <span>{{ profile.role }}</span>
      <small v-if="profile.available" class="available"><i />{{ profile.available }}</small>
    </div>
    <span class="line" aria-hidden="true" />
  </div>
</template>

<style scoped>
.showcase {
  position: relative;
  container-type: inline-size;
  min-height: 540px;
  height: 100%;
  overflow: hidden;
  display: grid;
}

/* ---------- the big words ---------- */
.words {
  position: absolute;
  inset: 0 0 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-weight: 800;
  font-size: min(17cqi, 116px);
  line-height: 0.98;
  letter-spacing: -0.02em;
  white-space: nowrap;
  user-select: none;
}
.words span {
  color: transparent;
  -webkit-text-stroke: 2px rgba(0, 102, 255, 0.3);
  animation:
    slide-in 1.1s calc(var(--i) * 0.15s) cubic-bezier(0.2, 0.8, 0.2, 1) both,
    drift 14s calc(1.2s + var(--i) * 0.15s) ease-in-out infinite alternate;
}
.words span:nth-child(even) {
  animation-direction: normal, alternate-reverse;
}
.words .accent {
  color: var(--primary);
  -webkit-text-stroke: 0;
}

/* ---------- the photo ---------- */
/* a soft light behind the photo; no drop shadow, which would also darken the faint haze background removers leave */
.showcase::after {
  content: '';
  position: absolute;
  inset-inline: 15%;
  bottom: 0;
  height: 70%;
  background: radial-gradient(50% 55% at 50% 60%, rgba(0, 102, 255, 0.16), transparent 70%);
  pointer-events: none;
}
.photo,
.monogram {
  position: relative;
  z-index: 1;
  align-self: end;
  justify-self: center;
  animation: rise 1.1s 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.photo {
  width: min(88%, 460px);
  max-height: 560px;
  object-fit: contain;
  object-position: bottom;
  /* the cut-out ends at the waist: fade it into the page instead of a hard edge */
  mask-image: linear-gradient(180deg, #000 82%, transparent);
}
.monogram {
  width: 280px;
  aspect-ratio: 1;
  margin-bottom: 120px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--fg);
  color: #fff;
  font-size: 128px;
  font-weight: 800;
}

/* ---------- name card ---------- */
.sig {
  position: absolute;
  z-index: 2;
  bottom: 40px;
  inset-inline-start: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 16px 36px rgba(11, 13, 18, 0.12);
  animation: fade-up 0.7s 1.2s both;
}
.sig b {
  font-size: 17px;
}
.sig span {
  font-size: 13.5px;
  color: var(--muted);
}
.available {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 4px;
  font-size: 12.5px;
  font-weight: 700;
  color: #15803d;
}
.available i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a34a;
  animation: pulse 1.8s infinite;
}
.line {
  position: absolute;
  bottom: 0;
  inset-inline: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  animation: grow 1s 0.6s both;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-80px);
  }
}
@keyframes drift {
  to {
    transform: translateX(-4%);
  }
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(60px);
  }
}
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}
@keyframes grow {
  from {
    transform: scaleX(0);
  }
}
@keyframes pulse {
  70% {
    box-shadow: 0 0 0 8px rgba(22, 163, 74, 0);
  }
  0% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.55);
  }
}

@media (max-width: 980px) {
  .showcase {
    min-height: 460px;
    max-width: 560px;
    width: 100%;
    margin-inline: auto;
  }
}
@media (max-width: 520px) {
  .showcase {
    min-height: 400px;
  }
  .words {
    inset-block-end: 90px;
  }
  .sig {
    bottom: 24px;
    padding: 10px 14px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .showcase *,
  .words span {
    animation: none !important;
  }
}
</style>
