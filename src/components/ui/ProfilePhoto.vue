<script setup>
import { computed } from 'vue'
import { profile } from '@/data/profile'

const props = defineProps({
  size: { type: [Number, String], default: 64 },
  rounded: { type: String, default: '50%' },
})

// الصورة الكاملة: src/assets/images/profile.(jpg|jpeg|png|webp)
// صورة الوجه للدوائر الصغيرة: src/assets/images/profile-face.(jpg|jpeg|png|webp)
const full = Object.values(import.meta.glob('@/assets/images/profile.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }))[0] ?? null
const face = Object.values(import.meta.glob('@/assets/images/profile-face.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }))[0] ?? null

// small avatars (≤ 120px) use the face crop so the face fills the circle
const src = computed(() => (typeof props.size === 'number' && props.size <= 120 ? face ?? full : full))
const dim = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <span class="photo" :style="{ width: dim, height: dim, borderRadius: rounded }">
    <img v-if="src" :src="src" :alt="profile.name" />
    <span v-else class="placeholder" aria-hidden="true">{{ profile.initial }}</span>
  </span>
</template>

<style scoped>
.photo {
  display: inline-grid;
  place-items: center;
  overflow: hidden;
  flex: none;
  background: var(--cover);
  container-type: inline-size;
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
}
.placeholder {
  color: #fff;
  font-weight: 800;
  font-size: 42cqi;
  line-height: 1;
}
</style>
