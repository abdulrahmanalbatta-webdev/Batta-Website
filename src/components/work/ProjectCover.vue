<script setup>
import { computed } from 'vue'

// صورة المشروع من لوحة التحكم، وإن لم تُرفع بعد: غلاف مصمم بنافذة متصفح فيها اسم المشروع
const props = defineProps({
  project: { type: Object, required: true },
  eager: { type: Boolean, default: false },
})

// a steady colour per project, from its id
const HUES = [216, 258, 190, 160, 32, 340]
const hue = computed(() => HUES[[...String(props.project.id)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % HUES.length])
</script>

<template>
  <div class="project-cover" :style="{ '--hue': hue }">
    <img v-if="project.cover" :src="project.cover" :alt="project.title" :loading="eager ? 'eager' : 'lazy'" />
    <div v-else class="placeholder" aria-hidden="true">
      <div class="window">
        <div class="bar"><i /><i /><i /><span class="url">{{ project.id }}</span></div>
        <div class="screen">
          <span class="kicker">{{ project.tag }}</span>
          <b>{{ project.title }}</b>
          <span class="lines"><i /><i /><i /></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-cover {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #0b0d12;
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 9% 10% 0;
  background:
    radial-gradient(70% 90% at 85% 0%, hsl(var(--hue) 90% 55% / 0.55), transparent 70%),
    radial-gradient(60% 80% at 0% 100%, hsl(calc(var(--hue) + 40) 85% 50% / 0.35), transparent 70%),
    #0b0d12;
  transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.placeholder::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 18px 18px;
}
.window {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px 12px 0 0;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid #e8ecf3;
  direction: ltr;
}
.bar i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #dbe1ea;
}
.url {
  margin-inline-start: 10px;
  flex: 1;
  max-width: 55%;
  height: 18px;
  border-radius: 99px;
  background: #f1f4f9;
  font: 600 10px/18px var(--mono);
  color: #8a94a6;
  padding-inline: 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 7% 9%;
  background: linear-gradient(180deg, #fff, hsl(var(--hue) 60% 97%));
}
.kicker {
  align-self: flex-start;
  font-size: clamp(10px, 1.1vw, 12px);
  font-weight: 700;
  color: hsl(var(--hue) 70% 42%);
  background: hsl(var(--hue) 80% 95%);
  padding: 3px 10px;
  border-radius: 99px;
}
.screen b {
  font-size: clamp(16px, 2.2vw, 26px);
  line-height: 1.35;
  color: #0b0d12;
}
.lines {
  display: grid;
  gap: 7px;
  margin-top: 6px;
}
.lines i {
  height: 7px;
  border-radius: 99px;
  background: #e8ecf3;
}
.lines i:nth-child(1) {
  width: 92%;
}
.lines i:nth-child(2) {
  width: 78%;
}
.lines i:nth-child(3) {
  width: 46%;
  background: hsl(var(--hue) 80% 55%);
  height: 18px;
  border-radius: 8px;
  margin-top: 6px;
}
</style>
