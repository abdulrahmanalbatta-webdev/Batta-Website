<script setup>
import { ref } from 'vue'
import BrandLogo from '@/components/ui/BrandLogo.vue'
import { useToast } from '@/composables/useToast'
import { api } from '@/lib/api'

// المشتركون يظهرون في لوحة التحكم (النشرة البريدية) ويصلهم كل مقال جديد
const email = ref('')
const trap = ref('') // bot trap, hidden from people and autofill
const sending = ref(false)
const { showToast } = useToast()

async function subscribe() {
  sending.value = true
  try {
    const res = await api.post('newsletter', { email: email.value.trim(), website: trap.value })
    showToast(res.message, 4000)
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
    <div class="ink-panel newsletter">
      <span class="mark"><BrandLogo :size="56" :with-name="false" inverse /></span>
      <div>
        <h2>نشرة البطّة</h2>
        <p>يصلك كل مقال جديد على بريدك. بدون إزعاج، ورابط الإلغاء في كل رسالة.</p>
      </div>
      <form @submit.prevent="subscribe">
        <input v-model="email" type="email" required dir="ltr" placeholder="بريدك الإلكتروني" aria-label="البريد الإلكتروني" />
        <div hidden aria-hidden="true"><input v-model="trap" type="text" name="hp_extra" tabindex="-1" autocomplete="off" /></div>
        <button class="btn btn-primary" type="submit" :disabled="sending">{{ sending ? 'جارٍ الاشتراك…' : 'اشترك مجاناً' }}</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  padding-bottom: 88px;
}
.newsletter {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(0, 400px);
  gap: 28px;
  align-items: center;
}
.mark {
  width: 84px;
  height: 84px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
h2 {
  font-size: 26px;
}
form {
  display: flex;
  gap: 8px;
}
input {
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  border-radius: 10px;
  padding: 12px 14px;
  background: #fff;
  color: #0b0d12;
}
@media (max-width: 900px) {
  .newsletter {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 32px;
  }
  .mark {
    margin-inline: auto;
  }
  form {
    justify-content: center;
    flex-wrap: wrap;
  }
  form .btn {
    flex: 1 1 auto;
  }
}
</style>
