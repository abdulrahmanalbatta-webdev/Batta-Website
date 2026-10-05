<script setup>
import { ref } from 'vue'
import BrandLogo from '@/components/ui/BrandLogo.vue'
import { useToast } from '@/composables/useToast'

const email = ref('')
const { showToast } = useToast()

// TODO: اربط هنا خدمة النشرة البريدية (ConvertKit / Mailchimp / Buttondown)
function subscribe() {
  showToast('تم الاشتراك في نشرة البطّة (نموذج تجريبي)')
  email.value = ''
}
</script>

<template>
  <div id="newsletter" class="container wrap">
    <div class="ink-panel newsletter">
      <span class="mark"><BrandLogo :size="56" :with-name="false" inverse /></span>
      <div>
        <h2>نشرة البطّة</h2>
        <p>مقال واحد، أداة واحدة، ونصيحة عملية كل ثلاثاء. بدون إزعاج، وتقدر تلغي متى شئت.</p>
      </div>
      <form @submit.prevent="subscribe">
        <input v-model="email" type="email" required placeholder="بريدك الإلكتروني" aria-label="البريد الإلكتروني" />
        <button class="btn btn-primary" type="submit">اشترك مجاناً</button>
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
