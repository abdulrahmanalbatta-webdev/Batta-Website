<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { siGoogle, siFacebook } from 'simple-icons'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useAuth } from '@/composables/useAuth'
import { useSettings } from '@/composables/useSettings'
import { prepareSocial, googleToken, facebookToken } from '@/lib/social'

// أزرار "المتابعة بحساب Google / Facebook" فوق نموذج الدخول أو التسجيل؛ يظهر كل زر بعد ضبطه في اللوحة
// (الإعدادات ← تسجيل الدخول). الحساب الجديد يُكمل برقم واتساب ثم يُرسل نفس التوكن مرة ثانية.
const emit = defineEmits(['signed-in'])

const { settings } = useSettings()
const { socialSignIn } = useAuth()

const providers = computed(() =>
  [
    settings.value?.google_client_id && { id: 'google', label: 'المتابعة بحساب Google', icon: siGoogle, color: '#4285F4' },
    settings.value?.facebook_app_id && { id: 'facebook', label: 'المتابعة بحساب Facebook', icon: siFacebook, color: '#0866FF' },
  ].filter(Boolean),
)

onMounted(() => settings.value && prepareSocial(settings.value))
watch(settings, (value) => value && prepareSocial(value))

const busy = ref('')
const error = ref('')
// a new account: the provider's token waits for the phone
const pending = ref(null)
const phone = ref('')
const phoneError = ref('')

async function start(provider) {
  error.value = ''
  busy.value = provider
  try {
    const accessToken = provider === 'google' ? await googleToken(settings.value.google_client_id) : await facebookToken()
    if (!accessToken) return // the window was closed
    await finish(provider, accessToken)
  } catch (err) {
    error.value = err.message
  } finally {
    busy.value = ''
  }
}

async function finish(provider, accessToken, withPhone) {
  try {
    await socialSignIn(provider, accessToken, withPhone)
    pending.value = null
    emit('signed-in')
  } catch (err) {
    if (err.errors?.phone && !withPhone) {
      pending.value = { provider, accessToken }
      return
    }
    if (err.errors?.phone) {
      phoneError.value = err.errors.phone
      return
    }
    pending.value = null
    error.value = err.errors?.token || err.message
  }
}

async function completeSignUp() {
  phoneError.value = /^\+?[0-9 ]{7,20}$/.test(phone.value.trim()) ? '' : 'اكتب رقم واتساب مع مقدّمة الدولة، مثل ‎+970 59 000 0000'
  if (phoneError.value) return
  busy.value = pending.value.provider
  try {
    await finish(pending.value.provider, pending.value.accessToken, phone.value.trim())
  } finally {
    busy.value = ''
  }
}
</script>

<template>
  <div v-if="providers.length" class="social">
    <form v-if="pending" class="phone-step" novalidate @submit.prevent="completeSignUp">
      <p class="step-title">خطوة أخيرة لإنشاء حسابك</p>
      <label for="social-phone" class="field-label">رقم واتساب</label>
      <div class="with-icon" :class="{ invalid: phoneError }">
        <BaseIcon name="chat" :size="18" />
        <input id="social-phone" v-model="phone" type="tel" autocomplete="tel" dir="ltr" placeholder="+970 59 000 0000" :aria-invalid="!!phoneError" />
      </div>
      <span v-if="phoneError" class="error">{{ phoneError }}</span>
      <span v-else class="hint">نتواصل معك عليه بخصوص الدورات والورش التي تسجّل فيها. بالمتابعة توافق على الشروط وسياسة الخصوصية.</span>
      <div class="step-actions">
        <button class="btn btn-primary btn-block" type="submit" :disabled="!!busy">{{ busy ? 'جارٍ إنشاء الحساب…' : 'إنشاء الحساب' }}</button>
        <button class="text-btn" type="button" @click="pending = null">إلغاء</button>
      </div>
    </form>

    <template v-else>
      <button v-for="p in providers" :key="p.id" type="button" class="provider" :disabled="!!busy" @click="start(p.id)">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path :d="p.icon.path" :fill="p.color" /></svg>
        {{ busy === p.id ? 'جارٍ الدخول…' : p.label }}
      </button>
      <span v-if="error" class="error">{{ error }}</span>
    </template>

    <div class="divider"><span>أو بالبريد الإلكتروني</span></div>
  </div>
</template>

<style scoped>
.social {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 6px;
}
.provider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 11px 16px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  color: var(--fg);
  font: inherit;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.provider:hover:not(:disabled) {
  border-color: var(--primary);
  background: var(--bg);
}
.provider:disabled {
  opacity: 0.7;
  cursor: progress;
}
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  color: var(--muted);
  font-size: 13px;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
}
.phone-step {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--bg);
}
.step-title {
  margin: 0 0 6px;
  color: var(--fg);
  font-weight: 800;
}
.step-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  background: var(--surface);
  border-radius: 10px;
  padding-inline: 12px;
  color: var(--muted);
}
.with-icon:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}
.with-icon.invalid {
  border-color: var(--rose);
}
.with-icon input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  padding: 11px 0;
  color: var(--fg);
  text-align: right;
}
.with-icon input:focus {
  outline: none;
}
.error {
  font-size: 13px;
  color: var(--rose);
  font-weight: 600;
}
.hint {
  font-size: 13px;
  color: var(--muted);
}
.text-btn {
  border: 0;
  background: none;
  padding: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--primary-600);
  cursor: pointer;
}
</style>
