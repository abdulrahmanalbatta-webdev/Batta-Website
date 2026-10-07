<script setup>
import { reactive, ref, watch } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { api } from '@/lib/api'
import { useToast } from '@/composables/useToast'

// تقييم الدورة بالنجوم من الطالب المسجّل فيها (يظهر بعد مراجعته في لوحة التحكم)، مع ردّ المدرّب إن وجد
const props = defineProps({
  slug: { type: String, required: true },
  // the student's saved review, from me/courses/{slug}
  initial: { type: Object, default: null },
})
const { showToast } = useToast()

const review = reactive({ rating: 5, body: '', status: null, status_label: '', reply: null })
watch(
  () => props.initial,
  (saved) => saved && Object.assign(review, saved),
  { immediate: true },
)

const error = ref('')
const saving = ref(false)
async function save() {
  saving.value = true
  error.value = ''
  try {
    Object.assign(review, (await api.put(`me/courses/${encodeURIComponent(props.slug)}/review`, { rating: review.rating, body: review.body })).data)
    showToast('شكراً لك! يظهر تقييمك بعد مراجعته.')
  } catch (err) {
    error.value = Object.values(err.errors ?? {})[0] || err.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="card rate" @submit.prevent="save">
    <h3>{{ review.status ? 'تقييمك' : 'قيّم الدورة' }}</h3>
    <p v-if="review.status" class="muted small">الحالة: {{ review.status_label }}</p>
    <div class="stars" role="radiogroup" aria-label="التقييم">
      <button v-for="n in 5" :key="n" type="button" :aria-pressed="review.rating >= n" :aria-label="`${n} من 5`" @click="review.rating = n">
        <BaseIcon name="star" :size="24" :filled="review.rating >= n" />
      </button>
    </div>
    <textarea v-model="review.body" class="input" rows="4" placeholder="ما الذي أعجبك؟ وما الذي يمكن تحسينه؟ (10 أحرف على الأقل)" />
    <p v-if="error" class="err">{{ error }}</p>
    <button class="btn btn-primary btn-block" type="submit" :disabled="saving">{{ saving ? 'جارٍ الإرسال…' : review.status ? 'تحديث التقييم' : 'إرسال التقييم' }}</button>
    <p v-if="review.reply" class="reply"><b>رد المدرّب:</b> {{ review.reply }}</p>
  </form>
</template>

<style scoped>
.rate {
  padding: 20px;
  display: grid;
  gap: 12px;
}
.stars {
  display: flex;
  gap: 4px;
}
.stars button {
  border: 0;
  background: none;
  padding: 2px;
  cursor: pointer;
  color: #f5a524;
}
.muted {
  color: var(--muted);
}
.small {
  font-size: 13.5px;
}
.err {
  color: var(--rose);
  font-weight: 600;
  font-size: 14px;
}
.reply {
  padding: 10px 12px;
  border-radius: var(--r-sm);
  background: var(--tint);
  font-size: 14.5px;
}
</style>
