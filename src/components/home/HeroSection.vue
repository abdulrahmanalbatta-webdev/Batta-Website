<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import StarRating from '@/components/ui/StarRating.vue'
import TopoPattern from '@/components/ui/TopoPattern.vue'
import ProfilePhoto from '@/components/ui/ProfilePhoto.vue'
import HeroShowcase from '@/components/home/HeroShowcase.vue'
import { heroWords, testimonials } from '@/data/site'
import { texts } from '@/data/texts'
import { useStatsNumbers } from '@/composables/useContent'
import { profile } from '@/data/profile'

const numbers = useStatsNumbers()
const format = (n) => n.toLocaleString('en-US')
const initials = computed(() => testimonials.slice(0, 4).map((t) => t.initial))

// rotating word in the headline
const wordIndex = ref(0)
let timer
onMounted(() => {
  timer = setInterval(() => (wordIndex.value = (wordIndex.value + 1) % heroWords.length), 2600)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <section class="hero">
    <TopoPattern />
    <div class="container grid-hero">
      <div class="copy">

        <h1>
          {{ texts.home.hero.before }}
          <span class="rotator" aria-live="polite">
            <Transition name="word" mode="out-in">
              <span :key="wordIndex" class="hl">{{ heroWords[wordIndex] }}</span>
            </Transition>
          </span>
          <br />{{ texts.home.hero.after }}
        </h1>

        <p>{{ texts.home.hero.text }}</p>

        <div class="actions">
          <RouterLink class="btn btn-dark btn-lg" :to="{ name: 'contact' }">
            {{ texts.ui.buttons.quote }} <BaseIcon name="arrow" :size="18" />
          </RouterLink>
          <RouterLink class="btn btn-ghost btn-lg" to="/work">{{ texts.ui.buttons.see_work }}</RouterLink>
        </div>

        <!-- real numbers from the dashboard; hidden until there is something to show -->
        <div v-if="numbers.students || numbers.reviews" class="trust">
          <div v-if="initials.length" class="avatars"><span v-for="(letter, i) in initials" :key="i">{{ letter }}</span></div>
          <div class="trust-text">
            <template v-if="numbers.reviews"><StarRating /> <b>{{ numbers.rating }}</b> من 5<br /></template>
            <template v-if="numbers.students"><b>{{ format(numbers.students) }}</b> طالب</template>
            <template v-if="numbers.projects">{{ numbers.students ? ' و' : '' }}<b>{{ format(numbers.projects) }}</b> مشروعاً منجزاً</template>
          </div>
        </div>
      </div>

      <HeroShowcase />
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(55% 70% at 15% 20%, rgba(0, 102, 255, 0.1), transparent 70%),
    radial-gradient(45% 60% at 95% 0%, rgba(0, 102, 255, 0.08), transparent 70%),
    linear-gradient(180deg, #e8eef9 0%, var(--bg) 100%);
  padding-block: 72px 96px;
}
.grid-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 56px;
  align-items: center;
}
.copy {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}
.intro {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  max-width: 100%;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 99px;
  padding: 6px 8px 6px 16px;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.avatar {
  box-shadow: 0 0 0 2px var(--surface), 0 0 0 3px var(--primary), 0 4px 10px -2px rgba(0, 82, 204, 0.35);
}
.intro:hover {
  border-color: var(--line-2);
  box-shadow: var(--shadow);
}
.intro b {
  display: block;
  font-size: 14px;
  color: var(--fg);
  line-height: 1.3;
}
.intro small {
  font-size: 12px;
  color: var(--muted);
}
.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--green-soft);
  color: var(--green);
  border-radius: 99px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 700;
  margin-inline-start: 6px;
  white-space: nowrap;
}
.status::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(14, 159, 110, 0.5); }
  50% { box-shadow: 0 0 0 5px rgba(14, 159, 110, 0); }
}
h1 {
  font-size: clamp(38px, 5.4vw, 62px);
  line-height: 1.3;
}
.rotator {
  display: inline-block;
  min-width: 4.2em;
}
.hl {
  display: inline-block;
  color: var(--primary);
}
.word-enter-active,
.word-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.word-enter-from {
  opacity: 0;
  transform: translateY(14px);
}
.word-leave-to {
  opacity: 0;
  transform: translateY(-14px);
}
.copy > p {
  font-size: 18.5px;
  color: var(--muted);
  max-width: 560px;
}
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.trust {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding-top: 8px;
}
.avatars {
  display: flex;
}
.avatars span {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 13px;
  color: #fff;
  border: 2px solid var(--surface);
  margin-inline-start: -10px;
  background: #0066ff;
}
.avatars span:first-child { margin-inline-start: 0; }
.avatars span:nth-child(2) { background: #0b0d12; }
.avatars span:nth-child(3) { background: #334155; }
.avatars span:nth-child(4) { background: #5c9dff; }
.trust-text {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.6;
}
.trust-text b {
  color: var(--fg);
}

@media (max-width: 980px) {
  .grid-hero {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 520px) {
  .hero {
    padding-block: 48px 72px;
  }
  .actions .btn {
    flex: 1 1 auto;
  }
  .intro small,
  .status {
    display: none;
  }
}
</style>
