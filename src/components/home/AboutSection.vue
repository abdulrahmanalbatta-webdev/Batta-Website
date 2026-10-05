<script setup>
import BaseIcon from '@/components/ui/BaseIcon.vue'
import ProfilePhoto from '@/components/ui/ProfilePhoto.vue'
import SocialLinks from '@/components/ui/SocialLinks.vue'
import { profile } from '@/data/profile'
</script>

<template>
  <section class="section about">
    <div class="container grid-about">
      <div class="portrait">
        <div class="frame">
          <ProfilePhoto size="100%" rounded="24px" />
        </div>
        <div class="name-card">
          <b>{{ profile.name }}</b>
          <span>{{ profile.role }}</span>
        </div>
        <div class="badge-card">
          <span class="ico-box"><BaseIcon name="briefcase" :size="20" /></span>
          <div><b>24</b><span>مشروعاً منجزاً</span></div>
        </div>
      </div>

      <div class="copy">
        <span class="eyebrow">من أنا</span>
        <h2>أهلاً، أنا {{ profile.name }}</h2>
        <p class="lead">{{ profile.short }}</p>

        <ul class="highlights">
          <li v-for="h in profile.highlights" :key="h.title">
            <span class="ico-box"><BaseIcon :name="h.icon" :size="20" /></span>
            <div>
              <b>{{ h.title }}</b>
              <span>{{ h.text }}</span>
            </div>
          </li>
        </ul>

        <div class="actions">
          <RouterLink class="btn btn-dark btn-lg" to="/about">اقرأ قصتي كاملة <BaseIcon name="arrow" :size="18" /></RouterLink>
          <SocialLinks />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid-about {
  display: grid !important;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 72px;
  align-items: center;
}

/* portrait */
.portrait {
  position: relative;
  padding: 0 0 28px 28px;
}
.portrait::before {
  content: '';
  position: absolute;
  inset: 28px 28px 0 0;
  border-radius: 28px;
  background: var(--primary);
  background-image: radial-gradient(rgba(255, 255, 255, 0.16) 1px, transparent 1px);
  background-size: 16px 16px;
}
.frame {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  display: grid;
}
.frame :deep(.photo) {
  width: 100% !important;
  height: 100% !important;
}
.name-card {
  position: absolute;
  inset-inline-start: 20px;
  bottom: 52px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 12px 18px;
  box-shadow: var(--shadow);
  line-height: 1.5;
}
.name-card b {
  display: block;
  color: var(--fg);
  font-size: 17px;
}
.name-card span {
  font-size: 13px;
  color: var(--muted);
}
.badge-card {
  position: absolute;
  inset-inline-end: 0;
  top: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: var(--shadow);
  line-height: 1.3;
}
.badge-card b {
  display: block;
  font-size: 22px;
  color: var(--fg);
}
.badge-card span {
  font-size: 12.5px;
  color: var(--muted);
}

/* copy */
.copy {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--primary-600);
  font-size: 14px;
  font-weight: 700;
}
.eyebrow::after {
  content: '';
  width: 22px;
  height: 2px;
  border-radius: 2px;
  background: var(--primary);
}
h2 {
  font-size: clamp(28px, 3.6vw, 42px);
}
.lead {
  font-size: 18px;
  color: var(--text);
  line-height: 2;
}
.highlights {
  list-style: none;
  padding: 0;
  margin: 4px 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.highlights li {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface);
}
.highlights b {
  display: block;
  color: var(--fg);
  font-size: 15.5px;
}
.highlights span:not(.ico-box) {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.7;
}
.ico-box {
  width: 42px;
  height: 42px;
  border-radius: 12px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 4px;
}

@media (max-width: 980px) {
  .grid-about {
    grid-template-columns: minmax(0, 1fr);
    gap: 48px;
  }
  .portrait {
    max-width: 420px;
    width: 100%;
    margin-inline: auto;
  }
}
@media (max-width: 620px) {
  .highlights {
    grid-template-columns: 1fr;
  }
  .highlights li {
    flex-direction: row;
    align-items: flex-start;
  }
}
</style>
