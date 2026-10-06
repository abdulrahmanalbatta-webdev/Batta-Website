<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import ProfilePhoto from '@/components/ui/ProfilePhoto.vue'
import { api } from '@/lib/api'
import { arabicDate } from '@/composables/useContent'
import { useAuth } from '@/composables/useAuth'
import { useSettings } from '@/composables/useSettings'
import { profile } from '@/data/profile'

// التعليقات تحت مقال أو دورة أو ورشة: المنشورة من لوحة التحكم مع ردّك وردود الطلاب، ونموذج للطالب المسجّل
// يعلّق أو يرد على تعليق (يظهر بعد المراجعة). type: article | course | workshop، وtarget: الـ slug أو رقم الورشة.
const props = defineProps({
  type: { type: String, required: true },
  target: { type: [String, Number], required: true },
})

const PATHS = { article: 'articles', course: 'courses', workshop: 'workshops' }
const endpoint = computed(() => `${PATHS[props.type]}/${encodeURIComponent(props.target)}/comments`)
// who answers in your name under the comment
const role = computed(() => (props.type === 'article' ? 'الكاتب' : 'المدرّب'))

const route = useRoute()
const { student } = useAuth()
const { settings } = useSettings()
// "التعليقات" in the dashboard settings
const open = computed(() => settings.value?.article_comments !== false)

const comments = ref([])
const total = computed(() => comments.value.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0))
async function load() {
  try {
    comments.value = (await api.get(endpoint.value)).data
  } catch {
    comments.value = []
  }
}
watch(endpoint, load, { immediate: true })

// the main form, and the reply form open under one comment
const body = ref('')
const sending = ref(false)
const sent = ref('')
const error = ref('')
const replyingTo = ref(null)
const replyBody = ref('')
const replySent = ref({})
const replyError = ref('')

async function post(text, parentId = null) {
  return (await api.post(endpoint.value, { body: text.trim(), parent_id: parentId })).message
}

async function submit() {
  error.value = ''
  if (body.value.trim().length < 3) {
    error.value = 'اكتب تعليقك أولاً'
    return
  }
  sending.value = true
  try {
    sent.value = await post(body.value)
    body.value = ''
  } catch (err) {
    error.value = err.errors?.body?.[0] || err.message
  } finally {
    sending.value = false
  }
}

async function startReply(id) {
  replyingTo.value = replyingTo.value === id ? null : id
  replyBody.value = ''
  replyError.value = ''
  await nextTick()
  document.getElementById(`reply-${id}`)?.focus()
}

async function submitReply(id) {
  replyError.value = ''
  if (replyBody.value.trim().length < 3) {
    replyError.value = 'اكتب ردّك أولاً'
    return
  }
  sending.value = true
  try {
    replySent.value = { ...replySent.value, [id]: await post(replyBody.value, id) }
    replyingTo.value = null
  } catch (err) {
    replyError.value = err.errors?.body?.[0] || err.errors?.parent_id?.[0] || err.message
  } finally {
    sending.value = false
  }
}

const loginLink = computed(() => ({ name: 'login', query: { next: `${route.path}#comments` } }))
const registerLink = computed(() => ({ name: 'register', query: { next: `${route.path}#comments` } }))
</script>

<template>
  <section v-if="open || comments.length" id="comments" class="comments">
    <h2>التعليقات<span v-if="total" class="count">{{ total }}</span></h2>

    <ol v-if="comments.length" class="list">
      <li v-for="c in comments" :key="c.id" class="thread">
        <div class="comment">
          <span class="avatar">{{ c.initial }}</span>
          <div class="main">
            <div class="meta"><b>{{ c.name }}</b><time :datetime="c.date">{{ arabicDate(c.date) }}</time></div>
            <p class="text">{{ c.body }}</p>
            <button v-if="open" type="button" class="reply-btn" :aria-expanded="replyingTo === c.id" @click="startReply(c.id)">
              <BaseIcon name="chat" :size="15" />ردّ
            </button>
          </div>
        </div>

        <!-- your answer, set apart from the students' -->
        <div v-if="c.reply" class="answer">
          <ProfilePhoto :size="34" />
          <div>
            <div class="meta"><b>{{ profile.name }}</b><span class="role"><BaseIcon name="check" :size="12" />{{ role }}</span></div>
            <p class="text">{{ c.reply }}</p>
          </div>
        </div>

        <ol v-if="c.replies?.length" class="replies">
          <li v-for="r in c.replies" :key="r.id" class="comment small">
            <span class="avatar">{{ r.initial }}</span>
            <div class="main">
              <div class="meta"><b>{{ r.name }}</b><time :datetime="r.date">{{ arabicDate(r.date) }}</time></div>
              <p class="text">{{ r.body }}</p>
            </div>
          </li>
        </ol>

        <p v-if="replySent[c.id]" class="ok nested"><BaseIcon name="check" :size="16" />{{ replySent[c.id] }}</p>

        <template v-if="replyingTo === c.id">
          <form v-if="student" class="reply-form nested" @submit.prevent="submitReply(c.id)">
            <textarea :id="`reply-${c.id}`" v-model="replyBody" class="input" rows="3" maxlength="2000" :placeholder="`ردّك على ${c.name}…`" :aria-invalid="!!replyError" />
            <p v-if="replyError" class="error" role="alert">{{ replyError }}</p>
            <div class="actions">
              <button type="button" class="btn btn-ghost btn-sm" @click="replyingTo = null">إلغاء</button>
              <button class="btn btn-primary btn-sm" type="submit" :disabled="sending">{{ sending ? 'جارٍ الإرسال…' : 'أرسل الرد' }}</button>
            </div>
          </form>
          <p v-else class="nested signin-hint">
            <RouterLink :to="loginLink">سجّل دخولك</RouterLink> أو <RouterLink :to="registerLink">أنشئ حساباً</RouterLink> لترد على {{ c.name }}.
          </p>
        </template>
      </li>
    </ol>
    <p v-else-if="open" class="empty">لا توجد تعليقات بعد، كن أول من يعلّق.</p>

    <template v-if="open">
      <form v-if="student" class="form card" @submit.prevent="submit">
        <label for="comment-body" class="field-label">أضف تعليقك</label>
        <textarea id="comment-body" v-model="body" class="input" rows="4" maxlength="2000" placeholder="شاركنا رأيك أو سؤالك…" :aria-invalid="!!error" />
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <p v-if="sent" class="ok"><BaseIcon name="check" :size="16" />{{ sent }}</p>
        <div class="actions">
          <small>يظهر تعليقك بعد مراجعته.</small>
          <button class="btn btn-primary" type="submit" :disabled="sending">{{ sending ? 'جارٍ الإرسال…' : 'أرسل التعليق' }}</button>
        </div>
      </form>
      <div v-else class="signin card">
        <p>سجّل دخولك لتشارك برأيك أو تسأل.</p>
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
  gap: 20px;
  scroll-margin-top: calc(var(--header-h) + 24px);
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
.list,
.replies {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}
.list {
  gap: 0;
}
.thread {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 0;
  border-bottom: 1px solid var(--line);
}
.thread:first-child {
  padding-top: 0;
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
  align-items: center;
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
.text {
  margin-top: 4px;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.reply-btn {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  margin-inline-start: -10px;
  border: 0;
  border-radius: 99px;
  background: none;
  color: var(--muted);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.reply-btn:hover,
.reply-btn[aria-expanded='true'] {
  background: var(--primary-soft);
  color: var(--primary-600);
}

/* your answer: tinted, with your photo and a role badge */
.answer {
  margin-inline-start: 52px;
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary-soft), var(--tint-2));
  border: 1px solid color-mix(in srgb, var(--primary) 18%, transparent);
}
.answer > div {
  flex: 1;
  min-width: 0;
}
.role {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 99px;
  background: var(--primary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

/* students' replies hang off a thin thread line */
.replies {
  margin-inline-start: 19px;
  padding-inline-start: 32px;
  border-inline-start: 2px solid var(--line);
  gap: 14px;
}
.comment.small .avatar {
  width: 32px;
  height: 32px;
  font-size: 14px;
  background: var(--fg);
}
.nested {
  margin-inline-start: 52px;
}
.reply-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.reply-form textarea {
  resize: vertical;
  min-height: 80px;
}
.reply-form .actions {
  justify-content: flex-end;
}
.signin-hint {
  color: var(--muted);
  font-size: 14px;
}
.signin-hint a {
  color: var(--primary-600);
  font-weight: 700;
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
@media (max-width: 560px) {
  .answer,
  .nested {
    margin-inline-start: 0;
  }
  .replies {
    margin-inline-start: 8px;
    padding-inline-start: 16px;
  }
}
</style>
