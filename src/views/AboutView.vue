<script setup>
import BaseIcon from '@/components/ui/BaseIcon.vue'
import ProfilePhoto from '@/components/ui/ProfilePhoto.vue'
import SocialLinks from '@/components/ui/SocialLinks.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import TopoPattern from '@/components/ui/TopoPattern.vue'
import TechMarquee from '@/components/ui/TechMarquee.vue'
import { profile } from '@/data/profile'
import { texts } from '@/data/texts'
import { useStats } from '@/composables/useContent'

const stats = useStats()
</script>

<template>
  <div>
    <!-- intro -->
    <section class="about-hero">
      <TopoPattern tone="dark" />
      <div class="container grid-hero" :class="{ solo: !profile.photo }">
        <div class="copy">
          <h1>{{ profile.name }}</h1>
          <p class="role">{{ profile.role }}</p>
          <p class="lead">{{ profile.short }}</p>
          <div class="actions">
            <RouterLink class="btn btn-primary btn-lg" :to="{ name: 'contact' }">{{ texts.ui.buttons.about_work }} <BaseIcon name="arrow" :size="18" /></RouterLink>
            <RouterLink class="btn btn-outline-light btn-lg" to="/courses">{{ texts.ui.buttons.about_learn }}</RouterLink>
          </div>
          <SocialLinks dark />
        </div>

        <!-- your photo from the dashboard; without one the text stands alone -->
        <div v-if="profile.photo" class="portrait">
          <ProfilePhoto size="100%" rounded="28px" />
        </div>
      </div>
    </section>

    <!-- numbers -->
    <div class="container stats-wrap">
      <div class="stats">
        <div v-for="s in stats" :key="s.label" class="stat">
          <b>{{ s.value }}</b>
          <span>{{ s.label }}</span>
        </div>
      </div>
    </div>

    <!-- story + journey -->
    <section class="section">
      <div class="container grid-story">
        <div class="story">
          <span class="eyebrow">{{ texts.pages.story.eyebrow }}</span>
          <h2>{{ texts.pages.story.title }}</h2>
          <p v-for="(p, i) in profile.story" :key="i">{{ p }}</p>
        </div>

        <ol class="journey">
          <li v-for="(j, i) in profile.journey" :key="j.title" :class="{ now: i === profile.journey.length - 1 }">
            <span class="node" />
            <span class="label">{{ j.label }}</span>
            <b>{{ j.title }}</b>
            <p>{{ j.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- values -->
    <section class="section tinted">
      <div class="container">
        <SectionHeading :eyebrow="texts.pages.values.eyebrow" :title="texts.pages.values.title" />
        <div class="grid g4">
          <div v-for="(v, i) in profile.values" :key="v.title" class="card value">
            <span class="num">0{{ i + 1 }}</span>
            <h3>{{ v.title }}</h3>
            <p>{{ v.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- the tools I use: the logo strip -->
    <section class="section">
      <div class="container">
        <SectionHeading :eyebrow="texts.pages.skills.eyebrow" :title="texts.pages.skills.title" />
      </div>
      <TechMarquee class="tools-strip" />
      <div class="container">
        <div class="center-row">
          <RouterLink class="btn btn-ghost" to="/tools">{{ texts.ui.buttons.all_tools }} <BaseIcon name="arrow" :size="16" /></RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: var(--ink-panel);
  padding-block: 56px 112px;
  color: var(--ink-text);
}
.about-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(45% 80% at 85% 10%, rgba(0, 102, 255, 0.32), transparent 70%),
    radial-gradient(40% 70% at 10% 60%, rgba(0, 102, 255, 0.2), transparent 70%);
}
.grid-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 64px;
  align-items: center;
}
.copy {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
}
h1 {
  font-size: clamp(36px, 5vw, 56px);
  color: #fff;
}
.role {
  font-size: 20px;
  font-weight: 700;
  color: #6ea8ff;
  margin-top: -8px;
}
.lead {
  font-size: 18px;
  line-height: 2;
  max-width: 620px;
  color: #c9d1dd;
}
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-block: 4px;
}
.grid-hero.solo {
  grid-template-columns: minmax(0, 760px);
}
.tools-strip {
  margin-block: 8px 32px;
}
.portrait {
  aspect-ratio: 4 / 5;
  border-radius: 28px;
  display: grid;
  box-shadow: 0 40px 80px -24px rgba(0, 102, 255, 0.45);
  outline: 1px solid rgba(255, 255, 255, 0.14);
  outline-offset: 10px;
}
.portrait :deep(.photo) {
  width: 100% !important;
  height: 100% !important;
}

.stats-wrap {
  margin-top: -52px;
  position: relative;
  z-index: 2;
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: var(--shadow);
}
.stat {
  padding: 26px;
  text-align: center;
  display: flex;
  flex-direction: column;
}
.stat + .stat {
  border-inline-start: 1px solid var(--line);
}
.stat b {
  font-size: 34px;
  font-weight: 800;
  color: var(--fg);
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
}
.stat span {
  color: var(--muted);
  font-weight: 600;
}

.grid-story {
  display: grid !important;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 72px;
  align-items: start;
}
.story {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.eyebrow {
  color: var(--primary-600);
  font-weight: 700;
  font-size: 14px;
}
.story h2 {
  font-size: clamp(28px, 3.4vw, 38px);
  margin-bottom: 4px;
}
.story p {
  font-size: 17.5px;
  line-height: 2.05;
}
.journey {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}
.journey::before {
  content: '';
  position: absolute;
  inset-inline-start: 9px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background: var(--line);
}
.journey li {
  position: relative;
  padding-inline-start: 40px;
  padding-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.journey li:last-child {
  padding-bottom: 0;
}
.node {
  position: absolute;
  inset-inline-start: 0;
  top: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--surface);
  border: 2px solid var(--line-2);
}
.now .node {
  background: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 0 0 5px var(--primary-soft);
}
.label {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary-600);
}
.journey b {
  font-size: 18px;
  color: var(--fg);
}
.journey p {
  color: var(--muted);
  font-size: 15px;
}

.value {
  gap: 10px;
}
.num {
  font-size: 32px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 980px) {
  .grid-hero,
  .grid-story {
    grid-template-columns: minmax(0, 1fr);
    gap: 40px;
  }
  .portrait {
    max-width: 380px;
    width: 100%;
    margin-inline: auto;
    order: -1;
  }
}
@media (max-width: 760px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .stat:nth-child(3) {
    border-inline-start: 0;
  }
  .stat:nth-child(n + 3) {
    border-top: 1px solid var(--line);
  }
}
</style>
