<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useAuth } from '@/composables/useAuth'
import { useRegistrations } from '@/composables/useRegistrations'
import { useToast } from '@/composables/useToast'

// زر التسجيل المجاني في دورة أو ورشة: الزائر يُرسل لتسجيل الدخول ثم يعود، والطالب يسجّل بضغطة،
// والمسجّل يرى "أنت مسجّل" مع إمكانية الإلغاء. type: course | workshop، وtarget: الـ slug أو رقم الورشة.
const props = defineProps({
  type: { type: String, required: true },
  target: { type: [String, Number], required: true },
  label: { type: String, required: true },
  // no seat left, or the workshop is over: registering is closed (an existing registration still shows)
  closed: { type: String, default: '' },
  // the workshop is over: a registration can't be cancelled any more
  locked: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  large: { type: Boolean, default: false },
})
// fires with +1 / -1 so the page can update its seat or student count
const emit = defineEmits(['change'])

const route = useRoute()
const { student } = useAuth()
const { isRegistered, register, cancel } = useRegistrations()
const { showToast } = useToast()

const registered = computed(() => isRegistered(props.type, props.target))
const busy = ref(false)
const classes = computed(() => ({ 'btn-block': props.block, 'btn-lg': props.large }))
const loginLink = computed(() => ({ name: 'login', query: { next: route.fullPath } }))

async function act(run, done, delta) {
  busy.value = true
  try {
    showToast((await run()) || done)
    emit('change', delta)
  } catch (err) {
    showToast(Object.values(err.errors ?? {})[0]?.[0] || err.message, 4000)
  } finally {
    busy.value = false
  }
}

const join = () => act(() => register(props.type, props.target), 'تم التسجيل.', 1)
function leave() {
  const what = props.type === 'course' ? 'الدورة' : 'الورشة'
  if (window.confirm(`إلغاء تسجيلك في ${what}؟`)) {
    act(async () => (await cancel(props.type, props.target), null), 'تم إلغاء تسجيلك.', -1)
  }
}
</script>

<template>
  <div class="reg" :class="{ block }">
    <template v-if="registered">
      <span class="btn btn-soft done" :class="classes"><BaseIcon name="check" :size="18" />أنت مسجّل</span>
      <button v-if="!locked" type="button" class="cancel" :disabled="busy" @click="leave">إلغاء التسجيل</button>
    </template>
    <span v-else-if="closed" class="btn btn-ghost" :class="classes" aria-disabled="true">{{ closed }}</span>
    <RouterLink v-else-if="!student" class="btn btn-primary" :class="classes" :to="loginLink">{{ label }}</RouterLink>
    <button v-else type="button" class="btn btn-primary" :class="classes" :disabled="busy" @click="join">{{ busy ? 'جارٍ التسجيل…' : label }}</button>
  </div>
</template>

<style scoped>
.reg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.reg.block {
  align-items: stretch;
}
.done {
  cursor: default;
  color: var(--green);
  background: var(--green-soft);
  border-color: transparent;
}
.cancel {
  border: 0;
  background: none;
  padding: 2px 6px;
  font: inherit;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.cancel:hover {
  color: var(--rose);
}
</style>
