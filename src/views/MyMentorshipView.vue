<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { api } from '@/lib/api'
import { shrinkImage, toDataUrl, UPLOAD_LIMIT } from '@/lib/shrinkImage'
import { useToast } from '@/composables/useToast'
import { walletLogo } from '@/data/wallets'

// طلب الإرشاد، على شكل صفحة دفع: أين وصل الطلب، وبعد القبول اختيار المحفظة وخطوات التحويل ورفع الإشعار،
// وبجانبها ملخّص الطلب والمهلة المتبقية.
const { showToast } = useToast()

const request = ref(null)
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    request.value = (await api.get('me/mentorship')).data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
onMounted(load)

// the payment window ticks down while the page is open
const now = ref(Date.now())
const timer = setInterval(() => (now.value = Date.now()), 15000)
onUnmounted(() => clearInterval(timer))

const STEPS = ['تقديم الطلب', 'مراجعة الطلب', 'الدفع', 'تأكيد الدفع', 'الجلسة الأولى']
const stepIndex = computed(() => ({ pending: 1, accepted: 2, proof_submitted: 3, paid: 4, scheduled: 5, completed: 5 })[request.value?.status] ?? -1)
const closed = computed(() => ['rejected', 'expired'].includes(request.value?.status))

const when = (iso, style = 'full') => (iso ? new Intl.DateTimeFormat('ar', { dateStyle: style, timeStyle: 'short', timeZone: 'Asia/Gaza', numberingSystem: 'latn' }).format(new Date(iso)) : '')
const part = (iso, options) => new Intl.DateTimeFormat('ar', { ...options, timeZone: 'Asia/Gaza', numberingSystem: 'latn' }).format(new Date(iso))
const msLeft = computed(() => new Date(request.value?.payment_due_at).getTime() - now.value)
const left = computed(() => {
  const ms = msLeft.value
  if (!(ms > 0)) return 'انتهت المهلة'
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return hours ? `${hours} ساعة و${minutes} دقيقة` : `${minutes} دقيقة`
})
// how much of the window is still open, for the bar (the window starts when the request was accepted)
const windowShare = computed(() => {
  const due = new Date(request.value?.payment_due_at).getTime()
  const start = new Date(request.value?.accepted_at ?? request.value?.created_at).getTime()
  return due > start ? Math.max(0, Math.min(1, msLeft.value / (due - start))) : 0
})

async function copy(text, label) {
  try {
    await navigator.clipboard.writeText(text)
    showToast(`تم نسخ ${label}`)
  } catch {
    showToast(text)
  }
}

/* ---------- paying: the wallet, then the receipt ---------- */
const wallet = ref(null)
watch(request, (r) => (wallet.value = r?.wallets?.[0]?.id ?? null), { immediate: true })
const chosenWallet = computed(() => request.value?.wallets?.find((w) => w.id === wallet.value))

const file = ref(null)
const preview = ref('')
const dragging = ref(false)
const reference = ref('')
const progress = ref(0)
const sending = ref(false)
const fileInput = ref(null)

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
function pick(picked) {
  if (!picked) return
  if (!ACCEPTED.includes(picked.type)) return showToast('اختر صورة (JPG أو PNG) أو ملف PDF.')
  if (preview.value) URL.revokeObjectURL(preview.value)
  file.value = picked
  preview.value = picked.type.startsWith('image/') ? URL.createObjectURL(picked) : ''
}
function drop(e) {
  dragging.value = false
  pick(e.dataTransfer?.files?.[0])
}
function clearFile() {
  if (preview.value) URL.revokeObjectURL(preview.value)
  file.value = null
  preview.value = ''
  if (fileInput.value) fileInput.value.value = ''
}
onUnmounted(() => preview.value && URL.revokeObjectURL(preview.value))
const size = (bytes) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} ميغابايت` : `${Math.max(1, Math.round(bytes / 1024))} كيلوبايت`)

async function sendProof() {
  if (!file.value) return showToast('أرفق صورة إشعار التحويل أولاً')
  sending.value = true
  progress.value = 0
  try {
    const proof = await shrinkImage(file.value)
    if (proof.size > UPLOAD_LIMIT) return showToast('الملف أكبر من 4 ميغابايت. أرسل لقطة شاشة للإشعار بدلاً منه.', 4500)
    const res = await api.postWithProgress(
      'me/mentorship/proof',
      { proof: await toDataUrl(proof), proof_name: proof.name, transaction_ref: reference.value.trim() || null },
      (share) => (progress.value = share),
    )
    request.value = res.data
    clearFile()
    showToast(res.message, 4500)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    showToast(Object.values(err.errors ?? {})[0] || err.message, 4500)
  } finally {
    sending.value = false
  }
}

// "add to Google Calendar" for the booked session (an hour long)
const calendarUrl = computed(() => {
  const r = request.value
  if (!r?.session_at) return ''
  const start = new Date(r.session_at)
  const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `جلسة الإرشاد · ${r.package_name}`,
    dates: `${stamp(start)}/${stamp(new Date(start.getTime() + 3600000))}`,
    details: r.meeting_url ? `رابط اللقاء: ${r.meeting_url}` : '',
  })
  return `https://calendar.google.com/calendar/render?${params}`
})
</script>

<template>
  <div class="checkout-page">
    <section class="top">
      <div class="container top-inner">
        <nav class="crumbs" aria-label="مسار الصفحة">
          <RouterLink :to="{ name: 'my-courses' }">حسابي</RouterLink><span>/</span><span>طلب الإرشاد</span>
        </nav>
        <div class="title-row">
          <h1>طلب الإرشاد</h1>
          <template v-if="request">
            <button type="button" class="order-no" :title="'نسخ رقم الطلب'" @click="copy(request.number, 'رقم الطلب')">
              <span dir="ltr">{{ request.number }}</span><BaseIcon name="copy" :size="14" />
            </button>
            <span class="status" :class="request.status">{{ request.status_label }}</span>
          </template>
        </div>

        <ol v-if="request && !closed" class="stepper" aria-label="مراحل الطلب">
          <li v-for="(s, i) in STEPS" :key="s" :class="{ done: i < stepIndex, now: i === stepIndex }">
            <span class="n"><BaseIcon v-if="i < stepIndex" name="check" :size="14" /><template v-else>{{ i + 1 }}</template></span>
            <span class="label">{{ s }}</span>
          </li>
        </ol>
        <!-- phones show the numbers only, and the current step's name here -->
        <p v-if="request && !closed" class="step-caption">الخطوة {{ Math.min(stepIndex, STEPS.length - 1) + 1 }} من {{ STEPS.length }}: <b>{{ STEPS[Math.min(stepIndex, STEPS.length - 1)] }}</b></p>
      </div>
    </section>

    <section class="body">
      <div class="container">
        <LoadState :loading="loading" :error="error" @retry="load" />

        <template v-if="!loading && !error">
          <div v-if="!request" class="card state">
            <span class="state-ico"><BaseIcon name="users" :size="28" /></span>
            <h2>لم تقدّم طلب إرشاد بعد</h2>
            <p>تعرّف على الباقات وقدّم طلبك من صفحة الإرشاد، ولا تدفع شيئاً قبل قبول طلبك.</p>
            <RouterLink class="btn btn-primary btn-lg" :to="{ name: 'mentorship' }">صفحة الإرشاد <BaseIcon name="arrow" :size="18" /></RouterLink>
          </div>

          <div v-else class="layout">
            <div class="main">
              <!-- waiting for review -->
              <div v-if="request.status === 'pending'" class="card state">
                <span class="state-ico"><BaseIcon name="clock" :size="28" /></span>
                <h2>طلبك قيد المراجعة</h2>
                <p>أراجع طلبك بنفسي وأردّ عليك خلال يومين، وسيصلك بريد بالنتيجة.</p>
                <ul class="next">
                  <li><BaseIcon name="check" :size="16" />عند القبول تظهر هنا طرق الدفع والمبلغ</li>
                  <li><BaseIcon name="check" :size="16" />تحوّل المبلغ وترفع إشعار التحويل</li>
                  <li><BaseIcon name="check" :size="16" />بعد تأكيد الدفع نحدّد موعد جلستك الأولى</li>
                </ul>
              </div>

              <!-- accepted: the checkout -->
              <template v-else-if="request.status === 'accepted'">
                <div v-if="request.decision_note" class="alert">
                  <BaseIcon name="info" :size="20" />
                  <div><b>لم يُقبل إشعار التحويل السابق</b><p>{{ request.decision_note }}</p></div>
                </div>

                <div class="card block">
                  <header class="block-head"><span class="num">1</span><h2>اختر طريقة الدفع</h2></header>
                  <div class="wallets" role="radiogroup" aria-label="طريقة الدفع">
                    <label v-for="w in request.wallets" :key="w.id" class="wallet" :class="[w.id, { on: wallet === w.id }]">
                      <input v-model="wallet" type="radio" name="wallet" :value="w.id" />
                      <span class="w-logo" :class="{ plain: !walletLogo(w.id) }">
                        <img v-if="walletLogo(w.id)" :src="walletLogo(w.id)" :alt="w.name" />
                        <BaseIcon v-else name="wallet" :size="22" />
                      </span>
                      <span class="w-text"><b>{{ w.name }}</b><small>محفظة إلكترونية</small></span>
                      <span class="radio" />
                    </label>
                  </div>
                </div>

                <div v-if="chosenWallet" class="card block">
                  <header class="block-head">
                    <span class="num">2</span><h2>حوّل المبلغ عبر {{ chosenWallet.name }}</h2>
                    <img v-if="walletLogo(chosenWallet.id)" class="head-logo" :src="walletLogo(chosenWallet.id)" alt="" />
                  </header>
                  <ol class="howto">
                    <li>
                      <span>المبلغ</span>
                      <div class="value"><b class="amount">{{ request.price }} ₪</b></div>
                    </li>
                    <li>
                      <span>إلى الرقم</span>
                      <div class="value">
                        <b dir="ltr">{{ chosenWallet.number }}</b>
                        <button type="button" class="copy" @click="copy(chosenWallet.number, 'الرقم')"><BaseIcon name="copy" :size="15" />نسخ</button>
                      </div>
                      <small v-if="chosenWallet.holder">باسم {{ chosenWallet.holder }}</small>
                    </li>
                    <li>
                      <span>اكتب في ملاحظة التحويل</span>
                      <div class="value">
                        <b dir="ltr">{{ request.number }}</b>
                        <button type="button" class="copy" @click="copy(request.number, 'رقم الطلب')"><BaseIcon name="copy" :size="15" />نسخ</button>
                      </div>
                      <small>حتى أعرف أن التحويل لطلبك.</small>
                    </li>
                  </ol>
                </div>

                <form class="card block" @submit.prevent="sendProof">
                  <header class="block-head"><span class="num">3</span><h2>ارفع إشعار التحويل</h2></header>

                  <div
                    v-if="!file"
                    class="drop"
                    :class="{ over: dragging }"
                    role="button"
                    tabindex="0"
                    @click="fileInput.click()"
                    @keydown.enter.prevent="fileInput.click()"
                    @dragover.prevent="dragging = true"
                    @dragleave="dragging = false"
                    @drop.prevent="drop"
                  >
                    <span class="drop-ico"><BaseIcon name="upload" :size="26" /></span>
                    <b>اسحب صورة الإشعار هنا، أو اضغط للاختيار</b>
                    <small>لقطة شاشة من التطبيق، أو صورة، أو PDF</small>
                  </div>
                  <input ref="fileInput" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" @change="pick($event.target.files[0])" />

                  <div v-if="file" class="picked">
                    <img v-if="preview" :src="preview" alt="" />
                    <span v-else class="pdf"><BaseIcon name="file" :size="26" /></span>
                    <div class="picked-text">
                      <b>{{ file.name }}</b>
                      <small>{{ size(file.size) }}</small>
                    </div>
                    <button type="button" class="icon-btn" aria-label="إزالة الملف" :disabled="sending" @click="clearFile"><BaseIcon name="trash" :size="18" /></button>
                  </div>

                  <label class="field-label"><span class="lbl">رقم العملية <small>اختياري، من رسالة التطبيق</small></span>
                    <input v-model="reference" class="input" dir="ltr" maxlength="100" />
                  </label>

                  <div v-if="sending" class="progress" role="progressbar" :aria-valuenow="Math.round(progress * 100)" aria-valuemin="0" aria-valuemax="100">
                    <i :style="{ width: `${Math.max(6, progress * 100)}%` }" />
                  </div>

                  <button class="btn btn-primary btn-lg btn-block" :disabled="sending || !file">
                    <BaseIcon name="lock" :size="18" />{{ sending ? `جارٍ الإرسال… ${Math.round(progress * 100)}%` : 'إرسال الإشعار للمراجعة' }}
                  </button>
                </form>
              </template>

              <!-- receipt sent -->
              <div v-else-if="request.status === 'proof_submitted'" class="card state success">
                <span class="state-ico big"><BaseIcon name="check" :size="34" /></span>
                <h2>وصل إشعار التحويل</h2>
                <p>أتأكّد من وصول المبلغ إلى المحفظة وأؤكّد لك الدفع قريباً، وسيصلك بريد بذلك.</p>
                <small class="muted">أُرسل {{ when(request.proof_uploaded_at, 'medium') }}</small>
              </div>

              <div v-else-if="request.status === 'paid'" class="card state success">
                <span class="state-ico big"><BaseIcon name="shield" :size="32" /></span>
                <h2>تم تأكيد الدفع</h2>
                <p>اشتراكك مؤكّد. سأحدّد معك موعد الجلسة الأولى قريباً، وسيصلك بريد بالموعد ورابط اللقاء.</p>
              </div>

              <div v-else-if="request.status === 'scheduled'" class="card session">
                <div class="date-tile">
                  <small>{{ part(request.session_at, { month: 'long' }) }}</small>
                  <b>{{ part(request.session_at, { day: 'numeric' }) }}</b>
                  <small>{{ part(request.session_at, { weekday: 'long' }) }}</small>
                </div>
                <div class="session-text">
                  <span class="pill green">موعدك محدّد</span>
                  <h2>جلستك الأولى</h2>
                  <p>{{ when(request.session_at) }} · بتوقيت فلسطين</p>
                  <div class="row">
                    <a v-if="request.meeting_url" class="btn btn-primary btn-lg" :href="request.meeting_url" target="_blank" rel="noopener noreferrer"><BaseIcon name="monitor" :size="18" />دخول اللقاء</a>
                    <a class="btn btn-ghost btn-lg" :href="calendarUrl" target="_blank" rel="noopener noreferrer"><BaseIcon name="calendar" :size="18" />أضف إلى التقويم</a>
                  </div>
                </div>
              </div>

              <div v-else class="card state">
                <span class="state-ico" :class="{ muted: request.status !== 'completed' }"><BaseIcon :name="request.status === 'completed' ? 'award' : 'close'" :size="28" /></span>
                <h2>{{ request.status === 'completed' ? 'اكتمل الإرشاد' : request.status === 'expired' ? 'انتهت مهلة الدفع' : 'لم يُقبل الطلب' }}</h2>
                <p v-if="request.status === 'completed'">شكراً لثقتك، وبالتوفيق في خطوتك القادمة.</p>
                <p v-else-if="request.status === 'expired'">لم يصل إشعار التحويل قبل انتهاء المهلة، فأُلغي الطلب وعاد المقعد متاحاً.</p>
                <p v-else>{{ request.decision_note || 'شكراً لاهتمامك، لا يمكنني قبول طلبك في الوقت الحالي.' }}</p>
                <RouterLink class="btn btn-ghost btn-lg" :to="{ name: 'mentorship', hash: '#apply' }">تقديم طلب جديد</RouterLink>
              </div>
            </div>

            <!-- the order summary -->
            <aside class="side">
              <div class="card summary">
                <small class="muted">ملخّص الطلب</small>
                <div class="sum-plan">
                  <span class="ico-box"><BaseIcon name="target" /></span>
                  <div><b>{{ request.package_name }}</b><small>طلب {{ request.number }}</small></div>
                </div>
                <ul class="sum-lines">
                  <li><span>سعر الباقة</span><span>{{ request.price }} ₪</span></li>
                  <li><span>رسوم التحويل</span><span>0 ₪</span></li>
                  <li class="total"><span>الإجمالي</span><b>{{ request.price }} ₪</b></li>
                </ul>

                <div v-if="request.status === 'accepted'" class="deadline" :class="{ late: windowShare < 0.25 }">
                  <div class="dl-top"><BaseIcon name="clock" :size="16" /><span>متبقي للدفع</span><b>{{ left }}</b></div>
                  <div class="dl-bar"><i :style="{ width: `${windowShare * 100}%` }" /></div>
                  <small>آخر موعد: {{ when(request.payment_due_at, 'medium') }}</small>
                </div>
              </div>

              <div class="card secure">
                <b><BaseIcon name="shield" :size="18" />دفع آمن</b>
                <p>أراجع كل تحويل بنفسي قبل تأكيده. لن أطلب منك أبداً كلمة مرور أو رمز تحقق أو رقماً سرياً.</p>
                <RouterLink :to="{ name: 'contact', query: { type: 'student' } }" class="help">تحتاج مساعدة؟ تواصل معي <BaseIcon name="arrow" :size="14" /></RouterLink>
              </div>
            </aside>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.checkout-page {
  background: var(--bg);
}
.top {
  padding-block: 32px 0;
  background: linear-gradient(180deg, #e8eef9 0%, var(--bg) 100%);
  border-bottom: 1px solid var(--line);
}
.top-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.crumbs {
  display: flex;
  gap: 8px;
  color: var(--muted);
  font-size: 14px;
}
.crumbs a {
  color: var(--primary-600);
  font-weight: 600;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.title-row h1 {
  font-size: clamp(26px, 3vw, 34px);
}
.order-no {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--surface);
  font: inherit;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
}
.status {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 700;
  background: var(--tint);
  color: var(--text);
}
.status.accepted,
.status.proof_submitted {
  background: #fff4e0;
  color: #9a5b00;
}
.status.paid,
.status.scheduled,
.status.completed {
  background: var(--green-soft);
  color: var(--green);
}
.status.rejected,
.status.expired {
  background: var(--rose-soft);
  color: var(--rose);
}

.stepper {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}
.stepper li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 14px;
  border-bottom: 3px solid var(--line);
  color: var(--muted);
  font-weight: 700;
  font-size: 14px;
}
.stepper .n {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 12.5px;
  background: var(--surface);
  border: 1px solid var(--line);
  flex: none;
}
.step-caption {
  display: none;
}
.stepper .done {
  color: var(--green);
  border-color: var(--green);
}
.stepper .done .n {
  background: var(--green);
  border-color: var(--green);
  color: #fff;
}
.stepper .now {
  color: var(--fg);
  border-color: var(--primary);
}
.stepper .now .n {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.body {
  padding-block: 32px 88px;
}
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
  align-items: start;
}
.main,
.side {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.side {
  position: sticky;
  top: calc(var(--header-h) + 20px);
}
.card {
  border-radius: 20px;
}

.block {
  padding: 26px;
  gap: 18px;
}
.block-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.block-head h2 {
  font-size: 19px;
}
.num {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--fg);
  color: #fff;
  font-weight: 800;
  font-size: 14px;
  flex: none;
}

.wallets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.wallet {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  border: 1.5px solid var(--line);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.wallet input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.wallet.on {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.1);
}
.w-logo {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  padding: 7px;
  background: #fff;
  border: 1px solid var(--line);
  flex: none;
}
.w-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.w-logo.plain {
  color: #fff;
  border: 0;
  background: linear-gradient(135deg, #0b6e4f, #18a36f);
}
.head-logo {
  height: 30px;
  width: auto;
  margin-inline-start: auto;
}
.w-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.w-text small {
  color: var(--muted);
}
.radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--line-2);
  flex: none;
}
.wallet.on .radio {
  border-color: var(--primary);
  box-shadow: inset 0 0 0 4px var(--surface), inset 0 0 0 10px var(--primary);
}

.howto {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
}
.howto li {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  grid-template-rows: auto auto;
  column-gap: 16px;
  align-items: center;
  padding: 16px 18px;
}
.howto li + li {
  border-top: 1px solid var(--line);
}
.howto li > span {
  grid-row: 1 / span 2;
  color: var(--muted);
  font-weight: 600;
}
.howto small {
  color: var(--muted);
}
.value {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.value b {
  font-size: 20px;
  color: var(--fg);
  letter-spacing: 0.5px;
}
.amount {
  color: var(--primary-600) !important;
  font-size: 24px !important;
}
.copy {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--surface);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--primary-600);
  cursor: pointer;
}
.copy:hover {
  border-color: var(--primary);
}

.drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 34px 20px;
  border-radius: 18px;
  border: 2px dashed var(--line-2);
  background: var(--bg);
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.drop:hover,
.drop:focus-visible,
.drop.over {
  border-color: var(--primary);
  background: var(--primary-soft);
  outline: none;
}
.drop small {
  color: var(--muted);
}
.drop-ico {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: var(--surface);
  color: var(--primary-600);
  box-shadow: var(--shadow-sm);
  margin-bottom: 6px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.picked {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: var(--bg);
}
.picked img,
.pdf {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  flex: none;
}
.pdf {
  display: grid;
  place-items: center;
  background: var(--rose-soft);
  color: var(--rose);
}
.picked-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.picked-text b {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.picked-text small {
  color: var(--muted);
}
.lbl small {
  color: var(--muted);
  font-weight: 500;
}
.progress {
  height: 8px;
  border-radius: 999px;
  background: var(--tint);
  overflow: hidden;
}
.progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--primary), #4d94ff);
  transition: width 0.2s;
}

.alert {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 16px 18px;
  border-radius: 16px;
  background: #fff8ec;
  border: 1px solid #f5c27a;
  color: #9a5b00;
}
.alert p {
  color: #7a4a00;
  margin-top: 2px;
}

.state {
  align-items: center;
  text-align: center;
  padding: 44px 28px;
  gap: 12px;
}
.state h2 {
  font-size: 24px;
}
.state p {
  max-width: 480px;
  line-height: 1.9;
}
.state-ico {
  width: 68px;
  height: 68px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  background: var(--primary-soft);
  color: var(--primary-600);
}
.state-ico.muted {
  background: var(--tint);
  color: var(--muted);
}
.state-ico.big {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: var(--green);
  color: #fff;
  box-shadow: 0 0 0 10px var(--green-soft);
  animation: pop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1.3);
}
@keyframes pop {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
}
.next {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: start;
}
.next li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  font-weight: 600;
}
.next .icon {
  color: var(--green);
}

.session {
  flex-direction: row;
  align-items: center;
  gap: 26px;
  padding: 28px;
}
.date-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 130px;
  border-radius: 20px;
  background: var(--fg);
  color: #fff;
  flex: none;
}
.date-tile b {
  font-size: 46px;
  line-height: 1.1;
}
.date-tile small {
  color: #b9c2d0;
}
.session-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}
.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.summary {
  padding: 22px;
  gap: 16px;
}
.sum-plan {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sum-plan div {
  display: flex;
  flex-direction: column;
}
.sum-plan small {
  color: var(--muted);
}
.sum-lines {
  list-style: none;
  margin: 0;
  padding: 14px 0 0;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sum-lines li {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
}
.sum-lines .total {
  padding-top: 12px;
  border-top: 1px dashed var(--line-2);
  color: var(--fg);
  font-weight: 700;
}
.sum-lines .total b {
  font-size: 24px;
}
.deadline {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  background: var(--primary-soft);
  color: var(--primary-600);
}
.deadline.late {
  background: var(--rose-soft);
  color: var(--rose);
}
.dl-top {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.dl-top b {
  margin-inline-start: auto;
}
.dl-bar {
  height: 6px;
  border-radius: 999px;
  background: rgba(0, 102, 255, 0.15);
  overflow: hidden;
}
.dl-bar i {
  display: block;
  height: 100%;
  background: currentColor;
  border-radius: inherit;
}
.deadline small {
  color: var(--muted);
}
.secure {
  padding: 20px 22px;
  gap: 8px;
}
.secure b {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--fg);
}
.secure b .icon {
  color: var(--green);
}
.secure p {
  font-size: 14px;
  line-height: 1.8;
}
.help {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-600);
  font-weight: 700;
  font-size: 14px;
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .side {
    position: static;
  }
}
@media (max-width: 620px) {
  .top {
    padding-top: 22px;
  }
  .title-row {
    gap: 8px;
  }
  .title-row h1 {
    font-size: 24px;
    width: 100%;
  }
  .stepper {
    margin-top: 4px;
  }
  .stepper li {
    justify-content: center;
    padding-bottom: 12px;
  }
  .stepper .label {
    display: none;
  }
  .step-caption {
    display: block;
    padding-bottom: 14px;
    color: var(--muted);
    font-size: 14.5px;
  }
  .step-caption b {
    color: var(--fg);
  }
  .body {
    padding-block: 20px 72px;
  }
  .state {
    padding: 32px 18px;
  }
  .state h2 {
    font-size: 21px;
  }
  .next {
    font-size: 14.5px;
  }
  .wallets {
    grid-template-columns: 1fr;
  }
  .head-logo {
    display: none;
  }
  .block-head h2 {
    font-size: 17px;
  }
  .dl-top {
    flex-wrap: wrap;
  }
  .dl-top b {
    margin-inline-start: 0;
    width: 100%;
    font-size: 18px;
  }
  .summary,
  .secure {
    padding: 18px;
  }
  .block {
    padding: 20px 16px;
  }
  .howto li {
    grid-template-columns: 1fr;
    row-gap: 4px;
  }
  .howto li > span {
    grid-row: auto;
  }
  .session {
    flex-direction: column;
    text-align: center;
  }
  .session-text {
    align-items: center;
  }
}
</style>
