<script setup>
import { ref } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useToast } from '@/composables/useToast'
import { api } from '@/lib/api'
import { texts } from '@/data/texts'

// المشتركون يظهرون في لوحة التحكم (النشرة البريدية) ويصلهم كل مقال جديد
const email = ref('')
const trap = ref('') // bot trap, hidden from people and autofill
const sending = ref(false)
const done = ref('') // the API's message once subscribed, shown in place of the form
const { showToast } = useToast()

async function subscribe() {
  sending.value = true
  try {
    const res = await api.post('newsletter', { email: email.value.trim(), website: trap.value })
    done.value = res.message
    email.value = ''
  } catch (err) {
    showToast(err.errors.email || err.message, 4500)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div id="newsletter" class="container wrap">
    <div class="band">
      <span v-if="texts.home.newsletter.eyebrow" class="eyebrow">{{ texts.home.newsletter.eyebrow }}</span>
      <h2>{{ texts.home.newsletter.title }}</h2>
      <p class="lead">{{ texts.home.newsletter.text }}</p>

      <p v-if="done" class="done" role="status">
        <span class="check"><BaseIcon name="check" :size="14" /></span>{{ done }}
      </p>
      <form v-else class="pill" @submit.prevent="subscribe">
        <input v-model="email" type="email" required dir="ltr" placeholder="you@example.com" aria-label="البريد الإلكتروني" />
        <div hidden aria-hidden="true"><input v-model="trap" type="text" name="hp_extra" tabindex="-1" autocomplete="off" /></div>
        <button class="btn btn-primary" type="submit" :disabled="sending">{{ sending ? 'جارٍ الاشتراك…' : texts.ui.buttons.subscribe }}</button>
      </form>

      <ul v-if="texts.home.newsletter.perks?.length" class="perks">
        <li v-for="perk in texts.home.newsletter.perks" :key="perk"><BaseIcon name="check" :size="15" />{{ perk }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  padding-bottom: 88px;
}
/* a soft blue band with a dotted pattern fading from the top */
.band {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 56px 24px;
  text-align: center;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: linear-gradient(180deg, var(--primary-soft), var(--surface));
}
.band::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(var(--line-2) 1px, transparent 1px);
  background-size: 18px 18px;
  mask-image: radial-gradient(60% 70% at 50% 0%, #000, transparent);
  pointer-events: none;
}
.band > * {
  position: relative;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--primary-600);
  font-size: 14px;
  font-weight: 700;
}
.eyebrow::before,
.eyebrow::after {
  content: '';
  width: 22px;
  height: 2px;
  border-radius: 2px;
  background: var(--primary);
}
h2 {
  font-size: clamp(26px, 3.4vw, 34px);
  text-wrap: balance;
}
.lead {
  max-width: 52ch;
  color: var(--muted);
  font-size: 16.5px;
}

/* the field and the button share one pill */
.pill {
  display: flex;
  align-items: center;
  gap: 6px;
  width: min(500px, 100%);
  margin-top: 8px;
  padding: 6px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  box-shadow: var(--shadow);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.pill:focus-within {
  border-color: var(--primary);
  box-shadow: var(--shadow), 0 0 0 4px var(--primary-soft);
}
.pill input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  padding: 10px 16px;
  background: transparent;
  color: var(--fg);
  font: inherit;
}
.pill .btn {
  border-radius: 999px;
  white-space: nowrap;
}
.done {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 12px 18px;
  border-radius: 14px;
  background: var(--green-soft);
  color: var(--green);
  font-weight: 700;
}
.check {
  flex: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--green);
  color: #fff;
}
.perks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 20px;
  color: var(--muted);
  font-size: 14px;
}
.perks li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.perks .icon {
  color: var(--green);
}

@media (max-width: 560px) {
  .band {
    padding: 40px 18px;
  }
  .pill {
    flex-direction: column;
    align-items: stretch;
    border-radius: 18px;
  }
  .pill input {
    text-align: center;
  }
  .pill .btn {
    border-radius: 12px;
  }
}
</style>
