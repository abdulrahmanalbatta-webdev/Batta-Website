<script setup>
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import PasswordField from '@/components/auth/PasswordField.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'
import { useSettings } from '@/composables/useSettings'
import { texts } from '@/data/texts'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const { register } = useAuth()
const { settings } = useSettings()

const form = reactive({ name: '', email: '', phone: '', password: '', confirm: '', terms: false })
const errors = reactive({ name: '', email: '', phone: '', password: '', confirm: '', terms: '' })
const phonePattern = /^\+?[0-9 ]{7,20}$/
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
  errors.phone = phonePattern.test(form.phone.trim()) ? '' : 'اكتب رقم واتساب مع مقدّمة الدولة، مثل ‎+970 59 000 0000'
  errors.password = form.password.length >= 8 && /\d/.test(form.password) && /[a-z]/.test(form.password) && /[A-Z]/.test(form.password) ? '' : '8 أحرف على الأقل، فيها رقم وحرف كبير وحرف صغير'
  errors.confirm = form.confirm === form.password && form.confirm ? '' : 'كلمتا المرور غير متطابقتين'
  errors.terms = form.terms ? '' : 'يجب الموافقة على الشروط للمتابعة'
  return Object.values(errors).every((e) => !e)
}

const next = () => (typeof route.query.next === 'string' && route.query.next.startsWith('/') && !route.query.next.startsWith('//') ? route.query.next : '/my-courses')

async function submit() {
  if (!validate()) return
  loading.value = true
  try {
    await register({ name: form.name.trim(), email: form.email.toLowerCase(), phone: form.phone.trim(), password: form.password, password_confirmation: form.confirm })
    showToast(`أهلاً ${form.name.trim()}، تم إنشاء حسابك وسنتواصل معك على واتساب`, 4500)
    router.push(next())
  } catch (err) {
    // field errors from the dashboard (e.g. the email is already registered)
    Object.entries(err.errors).forEach(([key, message]) => {
      const field = key === 'password_confirmation' ? 'confirm' : key
      if (field in errors) errors[field] = message
    })
    if (!Object.keys(err.errors).length) showToast(err.message, 4500)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout :title="texts.general.register.title" :subtitle="texts.general.register.text">
    <p v-if="settings && !settings.registration_open" class="closed">التسجيل مغلق حالياً. تواصل معنا إذا أردت الانضمام.</p>

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
        <label for="reg-phone" class="field-label">رقم واتساب</label>
        <div class="with-icon" :class="{ invalid: errors.phone }">
          <BaseIcon name="chat" :size="18" />
          <input id="reg-phone" v-model="form.phone" type="tel" autocomplete="tel" dir="ltr" placeholder="+970 59 000 0000" :aria-invalid="!!errors.phone" />
        </div>
        <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
        <span v-else class="hint">نتواصل معك عليه بخصوص الدورات والورش التي تسجّل فيها.</span>
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
