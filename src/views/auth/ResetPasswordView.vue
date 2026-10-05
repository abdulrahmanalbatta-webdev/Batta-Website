<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import PasswordField from '@/components/auth/PasswordField.vue'
import { api } from '@/lib/api'
import { useToast } from '@/composables/useToast'

// يصل الطالب هنا من رابط "نسيت كلمة المرور" في بريده: /reset-password?token=…&email=…
const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const form = reactive({ password: '', confirm: '' })
const errors = reactive({ password: '', confirm: '', link: '' })
const loading = ref(false)
const email = String(route.query.email ?? '')

async function submit() {
  errors.password = form.password.length >= 8 && /\d/.test(form.password) && /[a-z]/.test(form.password) && /[A-Z]/.test(form.password) ? '' : '8 أحرف على الأقل، فيها رقم وحرف كبير وحرف صغير'
  errors.confirm = form.confirm === form.password ? '' : 'كلمتا المرور غير متطابقتين'
  if (errors.password || errors.confirm) return
  loading.value = true
  try {
    const res = await api.post('auth/reset-password', { token: String(route.query.token ?? ''), email, password: form.password, password_confirmation: form.confirm })
    showToast(res.message, 4000)
    router.push({ name: 'login' })
  } catch (err) {
    errors.password = err.errors.password || ''
    errors.link = err.errors.email || err.errors.token || (err.errors.password ? '' : err.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout title="كلمة مرور جديدة" :subtitle="email ? `للحساب ${email}` : ''">
    <form class="fields" novalidate @submit.prevent="submit">
      <p v-if="errors.link" class="error" role="alert">{{ errors.link }} <RouterLink :to="{ name: 'login' }">اطلب رابطاً جديداً</RouterLink></p>
      <div class="field">
        <label for="new-password" class="field-label">كلمة المرور الجديدة</label>
        <PasswordField id="new-password" v-model="form.password" autocomplete="new-password" :invalid="!!errors.password" />
        <span v-if="errors.password" class="error">{{ errors.password }}</span>
      </div>
      <div class="field">
        <label for="new-confirm" class="field-label">تأكيد كلمة المرور</label>
        <PasswordField id="new-confirm" v-model="form.confirm" autocomplete="new-password" :invalid="!!errors.confirm" />
        <span v-if="errors.confirm" class="error">{{ errors.confirm }}</span>
      </div>
      <button class="btn btn-primary btn-lg btn-block" type="submit" :disabled="loading">{{ loading ? 'جارٍ الحفظ…' : 'حفظ كلمة المرور' }}</button>
    </form>
  </AuthLayout>
</template>

<style scoped src="./auth-form.css"></style>
