<script setup>
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import OAuthButtons from '@/components/auth/OAuthButtons.vue'
import PasswordField from '@/components/auth/PasswordField.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const form = reactive({ name: '', email: '', password: '', confirm: '', terms: false, newsletter: true })
const errors = reactive({ name: '', email: '', password: '', confirm: '', terms: '' })
const loading = ref(false)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// password strength: length, number, letter case, symbol
const strength = computed(() => {
  const p = form.password
  let score = 0
  if (p.length >= 8) score++
  if (/\d/.test(p)) score++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})
const strengthLabel = computed(() => ['', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية'][strength.value])

function validate() {
  errors.name = form.name.trim().length >= 2 ? '' : 'اكتب اسمك'
  errors.email = emailPattern.test(form.email) ? '' : 'أدخل بريداً إلكترونياً صحيحاً'
  errors.password = form.password.length >= 8 ? '' : 'كلمة المرور 8 أحرف على الأقل'
  errors.confirm = form.confirm === form.password && form.confirm ? '' : 'كلمتا المرور غير متطابقتين'
  errors.terms = form.terms ? '' : 'يجب الموافقة على الشروط للمتابعة'
  return Object.values(errors).every((e) => !e)
}

// TODO: استبدل المحاكاة باستدعاء خدمة المصادقة الفعلية
async function submit() {
  if (!validate()) return
  loading.value = true
  await new Promise((r) => setTimeout(r, 700))
  loading.value = false
  showToast(`أهلاً ${form.name.trim()}، تم إنشاء حسابك (نموذج تجريبي)`)
  router.push(typeof route.query.next === 'string' ? route.query.next : '/')
}
</script>

<template>
  <AuthLayout title="أنشئ حسابك" subtitle="مجاناً، وخلال أقل من دقيقة.">
    <OAuthButtons />

    <form class="fields" novalidate @submit.prevent="submit">
      <div class="field">
        <label for="reg-name" class="field-label">الاسم الكامل</label>
        <div class="with-icon" :class="{ invalid: errors.name }">
          <BaseIcon name="user" :size="18" />
          <input id="reg-name" v-model="form.name" autocomplete="name" placeholder="مثلاً: أحمد محمد" :aria-invalid="!!errors.name" />
        </div>
        <span v-if="errors.name" class="error">{{ errors.name }}</span>
      </div>

      <div class="field">
        <label for="reg-email" class="field-label">البريد الإلكتروني</label>
        <div class="with-icon" :class="{ invalid: errors.email }">
          <BaseIcon name="mail" :size="18" />
          <input id="reg-email" v-model.trim="form.email" type="email" autocomplete="email" dir="ltr" placeholder="name@example.com" :aria-invalid="!!errors.email" />
        </div>
        <span v-if="errors.email" class="error">{{ errors.email }}</span>
      </div>

      <div class="field">
        <label for="reg-password" class="field-label">كلمة المرور</label>
        <PasswordField id="reg-password" v-model="form.password" autocomplete="new-password" :invalid="!!errors.password" />
        <div v-if="form.password" class="strength" :data-level="strength">
          <span class="bars"><i v-for="n in 4" :key="n" :class="{ on: n <= strength }" /></span>
          <span>قوة كلمة المرور: {{ strengthLabel }}</span>
        </div>
        <span v-if="errors.password" class="error">{{ errors.password }}</span>
      </div>

      <div class="field">
        <label for="reg-confirm" class="field-label">تأكيد كلمة المرور</label>
        <PasswordField id="reg-confirm" v-model="form.confirm" autocomplete="new-password" :invalid="!!errors.confirm" />
        <span v-if="errors.confirm" class="error">{{ errors.confirm }}</span>
      </div>

      <label class="check">
        <input v-model="form.newsletter" type="checkbox" />
        اشترك في نشرة البطّة الأسبوعية
      </label>
      <label class="check" :class="{ invalid: errors.terms }">
        <input v-model="form.terms" type="checkbox" />
        أوافق على الشروط وسياسة الخصوصية
      </label>
      <span v-if="errors.terms" class="error">{{ errors.terms }}</span>

      <button class="btn btn-primary btn-lg btn-block" type="submit" :disabled="loading">
        {{ loading ? 'جارٍ إنشاء الحساب…' : 'إنشاء الحساب' }}
      </button>
    </form>

    <p class="switch">لديك حساب بالفعل؟ <RouterLink :to="{ name: 'login', query: route.query }">سجّل الدخول</RouterLink></p>
  </AuthLayout>
</template>

<style scoped src="./auth-form.css"></style>
