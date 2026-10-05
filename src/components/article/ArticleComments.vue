<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { api } from '@/lib/api'
import { arabicDate } from '@/composables/useContent'
import { useAuth } from '@/composables/useAuth'
import { useSettings } from '@/composables/useSettings'
import { profile } from '@/data/profile'

// التعليقات تحت المقال: المنشورة من لوحة التحكم، ونموذج للطالب المسجّل (يظهر تعليقه بعد المراجعة)
const props = defineProps({
  slug: { type: String, required: true },
})

const route = useRoute()
const { student } = useAuth()
const { settings } = useSettings()
// "التعليقات على المقالات" في إعدادات اللوحة
const open = computed(() => settings.value?.article_comments !== false)

const comments = ref([])
async function load() {
  try {
    comments.value = (await api.get(`articles/${encodeURIComponent(props.slug)}/comments`)).data
  } catch {
    comments.value = []
  }
}
watch(() => props.slug, load, { immediate: true })

const body = ref('')
const sending = ref(false)
const sent = ref('')
const error = ref('')
async function submit() {
  error.value = ''
  if (body.value.trim().length < 3) {
    error.value = 'اكتب تعليقك أولاً'
    return
  }
  sending.value = true
  try {
    sent.value = (await api.post(`articles/${encodeURIComponent(props.slug)}/comments`, { body: body.value.trim() })).message
    body.value = ''
  } catch (err) {
    error.value = err.errors?.body?.[0] || err.message
  } finally {
    sending.value = false
  }
}

const loginLink = computed(() => ({ name: 'login', query: { next: `${route.path}#comments` } }))
const registerLink = computed(() => ({ name: 'register', query: { next: `${route.path}#comments` } }))
</script>

<template>
  <section v-if="open || comments.length" id="comments" class="comments">
    <h2>التعليقات<span v-if="comments.length" class="count">{{ comments.length }}</span></h2>

    <ol v-if="comments.length" class="list">
      <li v-for="c in comments" :key="c.id" class="comment">
        <span class="avatar">{{ c.initial }}</span>
        <div class="main">
          <div class="meta"><b>{{ c.name }}</b><time :datetime="c.date">{{ arabicDate(c.date) }}</time></div>
          <p>{{ c.body }}</p>
          <div v-if="c.reply" class="reply">
            <b>ردّ {{ profile.name }}</b>
            <p>{{ c.reply }}</p>
          </div>
        </div>
      </li>
    </ol>
    <p v-else-if="open" class="empty">لا توجد تعليقات بعد، كن أول من يعلّق.</p>

    <template v-if="open">
      <form v-if="student" class="form card" @submit.prevent="submit">
        <label for="comment-body" class="field-label">أضف تعليقك</label>
        <textarea id="comment-body" v-model="body" class="input" rows="4" maxlength="2000" placeholder="شاركنا رأيك أو سؤالك عن المقال…" :aria-invalid="!!error" />
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <p v-if="sent" class="ok"><BaseIcon name="check" :size="16" />{{ sent }}</p>
        <div class="actions">
          <small>يظهر تعليقك بعد مراجعته.</small>
          <button class="btn btn-primary" type="submit" :disabled="sending">{{ sending ? 'جارٍ الإرسال…' : 'أرسل التعليق' }}</button>
        </div>
      </form>
      <div v-else class="signin card">
        <p>سجّل دخولك لتشارك برأيك أو تسأل عن المقال.</p>
        <div class="buttons">
          <RouterLink class="btn btn-primary" :to="loginLink">تسجيل الدخول</RouterLink>
          <RouterLink class="btn btn-ghost" :to="registerLink">إنشاء حساب</RouterLink>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.comments {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
h2 {
  font-size: 22px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.count {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary-600);
  background: var(--primary-soft);
  border-radius: 99px;
  padding: 2px 10px;
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.comment {
  display: flex;
  gap: 12px;
}
.avatar {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--primary);
  color: #fff;
  font-weight: 700;
}
.main {
  flex: 1;
  min-width: 0;
}
.meta {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.meta b {
  color: var(--fg);
}
.meta time {
  color: var(--muted);
  font-size: 13px;
}
.main > p {
  margin-top: 4px;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.reply {
  margin-top: 10px;
  padding: 12px 14px;
  border-inline-start: 3px solid var(--primary);
  background: var(--tint-2);
  border-radius: 10px;
}
.reply b {
  color: var(--fg);
  font-size: 14px;
}
.reply p {
  margin-top: 4px;
  white-space: pre-line;
}
.empty {
  color: var(--muted);
}
.form,
.signin {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.form textarea {
  resize: vertical;
  min-height: 110px;
}
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.actions small {
  color: var(--muted);
}
.error {
  color: var(--rose);
  font-size: 14px;
}
.ok {
  color: var(--green);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}
.buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
