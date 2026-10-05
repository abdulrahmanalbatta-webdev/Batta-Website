<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import OAuthButtons from '@/components/auth/OAuthButtons.vue'
import PasswordField from '@/components/auth/PasswordField.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const form = reactive({ email: '', password: '', remember: true })
const errors = reactive({ email: '', password: '' })
const loading = ref(false)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  errors.email = emailPattern.test(form.email) ? '' : 'أدخل بريداً إلكترونياً صحيحاً'
  errors.password = form.password ? '' : 'أدخل كلمة المرور'
  return !errors.email && !errors.password
}

// TODO: استبدل المحاكاة باستدعاء خدمة المصادقة الفعلية
async function submit() {
  if (!validate()) return
  loading.value = true
  await new Promise((r) => setTimeout(r, 600))
  loading.value = false
  showToast('تم تسجيل الدخول (نموذج تجريبي)')
  router.push(typeof route.query.next === 'string' ? route.query.next : '/')
}

function forgotPassword() {
  if (!emailPattern.test(form.email)) {
    errors.email = 'اكتب بريدك أولاً، وسنرسل لك رابط الاستعادة عليه'
    return
  }
  showToast('أرسلنا رابط استعادة كلمة المرور إلى بريدك (نموذج تجريبي)')
}
</script>

<template>
  <AuthLayout title="أهلاً بعودتك" subtitle="سجّل دخولك لتكمل دوراتك وتتابع حجوزاتك.">
    <OAuthButtons />

    <form class="fields" novalidate @submit.prevent="submit">
      <div class="field">
        <label for="login-email" class="field-label">البريد الإلكتروني</label>
        <div class="with-icon" :class="{ invalid: errors.email }">
          <BaseIcon name="mail" :size="18" />
          <input id="login-email" v-model.trim="form.email" type="email" autocomplete="email" dir="ltr" placeholder="name@example.com" :aria-invalid="!!errors.email" />
        </div>
        <span v-if="errors.email" class="error">{{ errors.email }}</span>
      </div>

      <div class="field">
        <div class="label-row">
          <label for="login-password" class="field-label">كلمة المرور</label>
          <button type="button" class="text-btn" @click="forgotPassword">نسيت كلمة المرور؟</button>
        </div>
        <PasswordField id="login-password" v-model="form.password" :invalid="!!errors.password" />
        <span v-if="errors.password" class="error">{{ errors.password }}</span>
      </div>

      <label class="check">
        <input v-model="form.remember" type="checkbox" />
        تذكّرني على هذا الجهاز
      </label>

      <button class="btn btn-primary btn-lg btn-block" type="submit" :disabled="loading">
        {{ loading ? 'جارٍ الدخول…' : 'تسجيل الدخول' }}
      </button>
    </form>

    <p class="switch">ليس لديك حساب؟ <RouterLink :to="{ name: 'register', query: route.query }">أنشئ حساباً مجاناً</RouterLink></p>
  </AuthLayout>
</template>

<style scoped src="./auth-form.css"></style>
