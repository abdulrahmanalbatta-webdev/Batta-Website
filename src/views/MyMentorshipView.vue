<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { api } from '@/lib/api'
import { shrinkImage, toDataUrl, UPLOAD_LIMIT } from '@/lib/shrinkImage'
import { useToast } from '@/composables/useToast'

// طلب الإرشاد: أين وصل الطلب، وبعد القبول المحافظ التي يُحوَّل إليها المبلغ ورفع إشعار التحويل قبل انتهاء المهلة.
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
const timer = setInterval(() => (now.value = Date.now()), 30000)
onUnmounted(() => clearInterval(timer))

const STEPS = [
  { key: 'review', label: 'مراجعة الطلب' },
  { key: 'payment', label: 'الدفع' },
  { key: 'confirm', label: 'تأكيد الدفع' },
  { key: 'session', label: 'موعد الجلسة' },
]
const stepIndex = computed(() => ({ pending: 0, accepted: 1, proof_submitted: 2, paid: 3, scheduled: 4, completed: 4 })[request.value?.status] ?? -1)
const ended = computed(() => ['rejected', 'expired', 'completed'].includes(request.value?.status))

const when = (iso) => (iso ? new Intl.DateTimeFormat('ar', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Gaza', numberingSystem: 'latn' }).format(new Date(iso)) : '')
const left = computed(() => {
  const ms = new Date(request.value?.payment_due_at).getTime() - now.value
  if (!(ms > 0)) return 'انتهت المهلة'
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return hours ? `متبقي ${hours} ساعة و${minutes} دقيقة` : `متبقي ${minutes} دقيقة`
})

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
    showToast('تم النسخ')
  } catch {
    showToast(text)
  }
}

const file = ref(null)
const reference = ref('')
const sending = ref(false)
async function sendProof() {
  if (!file.value) return showToast('اختر صورة إشعار التحويل أولاً')
  sending.value = true
  try {
    const proof = await shrinkImage(file.value)
    if (proof.size > UPLOAD_LIMIT) return showToast('الملف أكبر من 4 ميغابايت. أرسل لقطة شاشة للإشعار بدلاً منه.', 4500)
    const res = await api.post('me/mentorship/proof', { proof: await toDataUrl(proof), proof_name: proof.name, transaction_ref: reference.value.trim() || null })
    request.value = res.data
    showToast(res.message, 4500)
  } catch (err) {
    showToast(Object.values(err.errors ?? {})[0] || err.message, 4500)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div>
    <PageHero title="طلب الإرشاد" eyebrow="حسابي" :subtitle="request ? `${request.package_name} · ${request.price} ₪ · رقم الطلب ${request.number}` : ''" />

    <section class="page-body">
      <div class="container narrow">
        <LoadState :loading="loading" :error="error" @retry="load" />

        <template v-if="!loading && !error">
          <div v-if="!request" class="card state">
            <BaseIcon name="users" :size="30" />
            <h3>لم تقدّم طلب إرشاد بعد</h3>
            <p>تعرّف على الباقات وقدّم طلبك من صفحة الإرشاد.</p>
            <RouterLink class="btn btn-primary" :to="{ name: 'mentorship' }">صفحة الإرشاد</RouterLink>
          </div>

          <template v-else>
            <ol v-if="!['rejected', 'expired'].includes(request.status)" class="tracker" aria-label="مراحل الطلب">
              <li v-for="(s, i) in STEPS" :key="s.key" :class="{ done: i < stepIndex, current: i === stepIndex }">
                <span class="n"><BaseIcon v-if="i < stepIndex" name="check" :size="16" /><template v-else>{{ i + 1 }}</template></span>
                {{ s.label }}
              </li>
            </ol>

            <!-- waiting for review -->
            <div v-if="request.status === 'pending'" class="card state">
              <BaseIcon name="clock" :size="30" />
              <h3>طلبك قيد المراجعة</h3>
              <p>أراجع طلبك وأردّ عليك خلال يومين، وسيصلك بريد بالنتيجة.</p>
            </div>

            <!-- accepted: pay and send the receipt -->
            <template v-else-if="request.status === 'accepted'">
              <div v-if="request.decision_note" class="card notice">
                <b>لم يُقبل إشعار التحويل السابق</b>
                <p>{{ request.decision_note }}</p>
              </div>

              <div class="card pay">
                <div class="pay-head">
                  <div>
                    <span class="pill green">تم قبول طلبك</span>
                    <h3>حوّل {{ request.price }} ₪ عبر إحدى المحافظ التالية</h3>
                    <p>اكتب رقم الطلب <b dir="ltr">{{ request.number }}</b> في ملاحظة التحويل، ثم ارفع صورة الإشعار.</p>
                  </div>
                  <div class="deadline">
                    <BaseIcon name="clock" :size="18" />
                    <b>{{ left }}</b>
                    <small>آخر موعد: {{ when(request.payment_due_at) }}</small>
                  </div>
                </div>

                <div class="wallets">
                  <div v-for="w in request.wallets" :key="w.id" class="wallet">
                    <small>{{ w.name }}</small>
                    <b dir="ltr">{{ w.number }}</b>
                    <span v-if="w.holder">باسم {{ w.holder }}</span>
                    <button type="button" class="btn btn-ghost btn-sm" @click="copy(w.number)">نسخ الرقم</button>
                  </div>
                </div>

                <form class="upload" @submit.prevent="sendProof">
                  <label class="field-label">إشعار التحويل (صورة أو لقطة شاشة، أو PDF حتى 4 ميغابايت)
                    <input class="input" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required @change="file = $event.target.files[0] ?? null" />
                  </label>
                  <label class="field-label"><span class="lbl">رقم العملية <small>اختياري</small></span>
                    <input v-model="reference" class="input" dir="ltr" maxlength="100" />
                  </label>
                  <button class="btn btn-primary" :disabled="sending">{{ sending ? 'جارٍ الرفع…' : 'إرسال الإشعار' }}</button>
                </form>
              </div>
            </template>

            <div v-else-if="request.status === 'proof_submitted'" class="card state">
              <BaseIcon name="check" :size="30" />
              <h3>وصل إشعار التحويل</h3>
              <p>أتأكّد من وصول المبلغ وأؤكّد لك الدفع قريباً، وسيصلك بريد بذلك.</p>
            </div>

            <div v-else-if="request.status === 'paid'" class="card state">
              <BaseIcon name="calendar" :size="30" />
              <h3>تم تأكيد الدفع</h3>
              <p>سأحدّد معك موعد الجلسة الأولى قريباً، وسيصلك بريد بالموعد ورابط اللقاء.</p>
            </div>

            <div v-else-if="request.status === 'scheduled'" class="card state session">
              <BaseIcon name="calendar" :size="30" />
              <h3>موعد جلستك</h3>
              <p class="time">{{ when(request.session_at) }}</p>
              <small class="muted">بتوقيت فلسطين</small>
              <a v-if="request.meeting_url" class="btn btn-primary" :href="request.meeting_url" target="_blank" rel="noopener noreferrer"><BaseIcon name="monitor" :size="18" />رابط اللقاء</a>
            </div>

            <div v-else class="card state">
              <BaseIcon :name="request.status === 'completed' ? 'award' : 'close'" :size="30" />
              <h3>{{ request.status === 'completed' ? 'اكتمل الإرشاد' : request.status === 'expired' ? 'انتهت مهلة الدفع' : 'لم يُقبل الطلب' }}</h3>
              <p v-if="request.status === 'completed'">شكراً لثقتك، وبالتوفيق في خطوتك القادمة.</p>
              <p v-else-if="request.status === 'expired'">لم يصل إشعار التحويل قبل انتهاء المهلة، فأُلغي الطلب.</p>
              <p v-else>{{ request.decision_note || 'شكراً لاهتمامك، لا يمكنني قبول طلبك في الوقت الحالي.' }}</p>
              <RouterLink v-if="ended" class="btn btn-ghost" :to="{ name: 'mentorship', hash: '#apply' }">تقديم طلب جديد</RouterLink>
            </div>

            <div class="card summary">
              <div><small>الباقة</small><b>{{ request.package_name }}</b></div>
              <div><small>المبلغ</small><b>{{ request.price }} ₪</b></div>
              <div><small>الحالة</small><b>{{ request.status_label }}</b></div>
              <div><small>رقم الطلب</small><b dir="ltr">{{ request.number }}</b></div>
            </div>
          </template>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.narrow {
  max-width: 860px;
}
.state {
  align-items: center;
  text-align: center;
  padding: 36px 24px;
}
.state > .icon {
  color: var(--primary-600);
}
.session .time {
  font-size: 22px;
  font-weight: 800;
  color: var(--fg);
}
.tracker {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.tracker li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--muted);
  font-weight: 700;
  font-size: 14.5px;
}
.tracker .n {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--tint);
  flex: none;
}
.tracker .done {
  color: var(--green);
}
.tracker .done .n {
  background: var(--green-soft);
}
.tracker .current {
  border-color: var(--primary);
  color: var(--fg);
}
.tracker .current .n {
  background: var(--primary);
  color: #fff;
}
.notice {
  border-color: #f5c27a;
  background: #fff8ec;
}
.notice b {
  color: #9a5b00;
}
.pay {
  gap: 22px;
}
.pay-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.pay-head h3 {
  font-size: 21px;
  margin: 8px 0 6px;
}
.deadline {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--primary-soft);
  color: var(--primary-600);
  min-width: 220px;
}
.deadline small {
  color: var(--muted);
}
.wallets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.wallet {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: var(--bg);
}
.wallet b {
  font-size: 22px;
  color: var(--fg);
  /* the number reads left to right, but sits on the right like the rest of the card */
  text-align: right;
}
.wallet span {
  color: var(--muted);
  font-size: 14px;
}
.wallet .btn {
  margin-top: 8px;
  width: fit-content;
}
.upload {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) auto;
  gap: 14px;
  align-items: end;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}
.lbl small {
  color: var(--muted);
  font-weight: 500;
}
.summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.summary div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.summary small {
  color: var(--muted);
}
.summary b {
  color: var(--fg);
}
@media (max-width: 720px) {
  .tracker,
  .summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .upload {
    grid-template-columns: 1fr;
  }
}
</style>
