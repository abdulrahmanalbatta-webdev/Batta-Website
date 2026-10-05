<script setup>
import { computed } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import SocialLinks from '@/components/ui/SocialLinks.vue'
import { profile } from '@/data/profile'
import { texts } from '@/data/texts'

// the latest four stages; the about page has the whole story
const steps = computed(() => profile.journey.slice(-4))
</script>

<template>
  <section class="section about">
    <div class="container grid-about">
      <!-- the journey (dashboard: content → about → journey); the photo is in the hero just above -->
      <div class="journey-wrap">
        <div class="journey-card">
          <div class="jc-head">
            <span class="ico-box"><BaseIcon name="bulb" :size="20" /></span>
            <div>
              <b>مسيرتي</b>
              <span>{{ profile.role }}</span>
            </div>
          </div>
          <ol class="steps">
            <li v-for="(j, i) in steps" :key="j.title" :class="{ now: i === steps.length - 1 }" :style="{ '--i': i }">
              <span class="node">{{ i + 1 }}</span>
              <div>
                <span class="label">{{ j.label }}</span>
                <b>{{ j.title }}</b>
                <p>{{ j.text }}</p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      <div class="copy">
        <span class="eyebrow">{{ texts.home.about.eyebrow }}</span>
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
          <RouterLink class="btn btn-dark btn-lg" to="/about">{{ texts.ui.buttons.read_story }} <BaseIcon name="arrow" :size="18" /></RouterLink>
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

/* journey card */
.journey-wrap {
  position: relative;
  padding: 0 0 28px 28px;
}
.journey-wrap::before {
  content: '';
  position: absolute;
  inset: 28px 28px 0 0;
  border-radius: 28px;
  background: var(--primary);
  background-image: radial-gradient(rgba(255, 255, 255, 0.16) 1px, transparent 1px);
  background-size: 16px 16px;
}
.journey-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: var(--shadow-lg);
  padding: 28px 28px 22px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.jc-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line);
}
.jc-head b {
  display: block;
  font-size: 18px;
  color: var(--fg);
}
.jc-head span:not(.ico-box) {
  font-size: 13px;
  color: var(--muted);
}
.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}
.steps li {
  position: relative;
  display: flex;
  gap: 16px;
  padding-bottom: 22px;
}
.steps li:last-child {
  padding-bottom: 0;
}
/* the line between the numbered nodes */
.steps li:not(:last-child)::before {
  content: '';
  position: absolute;
  inset-inline-start: 17px;
  top: 38px;
  bottom: 4px;
  width: 2px;
  background: linear-gradient(var(--line-2), var(--line));
}
.node {
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 14px;
  color: var(--primary-600);
  background: var(--primary-soft);
  border: 1px solid rgba(0, 102, 255, 0.18);
}
.steps li.now .node {
  color: #fff;
  background: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 0 0 6px rgba(0, 102, 255, 0.14);
}
.steps .label {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  margin-bottom: 2px;
}
.steps li.now .label {
  color: var(--green);
}
.steps b {
  display: block;
  color: var(--fg);
  font-size: 16px;
}
.steps p {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.8;
  margin-top: 2px;
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
  .journey-wrap {
    max-width: 520px;
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
  .journey-wrap {
    padding: 0 0 18px 18px;
  }
  .journey-wrap::before {
    inset: 18px 18px 0 0;
  }
  .journey-card {
    padding: 22px 20px 18px;
  }
}
</style>
