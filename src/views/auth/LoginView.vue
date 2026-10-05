<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import PasswordField from '@/components/auth/PasswordField.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useToast } from '@/composables/useToast'
import { useAuth } from '@/composables/useAuth'
import { texts } from '@/data/texts'
import { api } from '@/lib/api'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const { signIn } = useAuth()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const loading = ref(false)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  errors.email = emailPattern.test(form.email) ? '' : 'أدخل بريداً إلكترونياً صحيحاً'
  errors.password = form.password ? '' : 'أدخل كلمة المرور'
  return !errors.email && !errors.password
}

// only paths inside the site (never a full URL from the query string)
const next = () => (typeof route.query.next === 'string' && route.query.next.startsWith('/') && !route.query.next.startsWith('//') ? route.query.next : '/my-courses')

async function submit() {
  if (!validate()) return
  loading.value = true
  try {
    await signIn(form)
    showToast('أهلاً بعودتك')
    router.push(next())
  } catch (err) {
    errors.email = err.errors.email || err.message
  } finally {
    loading.value = false
  }
}

const sending = ref(false)
async function forgotPassword() {
  if (!emailPattern.test(form.email)) {
    errors.email = 'اكتب بريدك أولاً، وسنرسل لك رابط الاستعادة عليه'
    return
  }
  sending.value = true
  try {
    showToast((await api.post('auth/forgot-password', { email: form.email })).message, 5000)
  } catch (err) {
    errors.email = err.errors.email || err.message
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <AuthLayout :title="texts.general.login.title" :subtitle="texts.general.login.text">
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
          <button type="button" class="text-btn" :disabled="sending" @click="forgotPassword">{{ sending ? 'جارٍ الإرسال…' : 'نسيت كلمة المرور؟' }}</button>
        </div>
        <PasswordField id="login-password" v-model="form.password" :invalid="!!errors.password" />
        <span v-if="errors.password" class="error">{{ errors.password }}</span>
      </div>

      <button class="btn btn-primary btn-lg btn-block" type="submit" :disabled="loading">
        {{ loading ? 'جارٍ الدخول…' : 'تسجيل الدخول' }}
      </button>
    </form>

    <p class="switch">ليس لديك حساب؟ <RouterLink :to="{ name: 'register', query: route.query }">أنشئ حساباً مجاناً</RouterLink></p>
  </AuthLayout>
</template>

<style scoped src="./auth-form.css"></style>
