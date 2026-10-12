<script setup>
import { computed } from 'vue'
import PageHero from '@/components/ui/PageHero.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { useContact } from '@/composables/useSettings'
import { legal } from '@/data/site'
import { contentStatus, loadSiteContent } from '@/lib/siteContent'

// سياسة الخصوصية والشروط: النص كله من اللوحة (محتوى الموقع ← الخصوصية والشروط)، بفهرس للأقسام
const props = defineProps({
  page: { type: String, required: true },
})

const content = computed(() => legal[props.page])
const { email } = useContact()
// the content failed to load (its message), or loaded without this page (a dashboard older than it)
const loadError = computed(() => ({ loading: '', ready: 'هذه الصفحة غير متاحة حالياً، حاول لاحقاً.' })[contentStatus.value] ?? contentStatus.value)
</script>

<template>
  <div>
    <PageHero :title="content?.title || ' '" :subtitle="content?.updated ? `آخر تحديث: ${content.updated}` : ''" />

    <section class="section">
      <div v-if="content" class="container layout">
        <nav v-if="content.sections.length > 2" class="toc" aria-label="أقسام الصفحة">
          <b>في هذه الصفحة</b>
          <ol>
            <li v-for="(s, i) in content.sections" :key="i">
              <a :href="`#section-${i + 1}`">{{ s.title }}</a>
            </li>
          </ol>
        </nav>

        <article class="body">
          <p class="intro">{{ content.intro }}</p>
          <section v-for="(s, i) in content.sections" :id="`section-${i + 1}`" :key="i" class="part">
            <h2><span>{{ i + 1 }}.</span> {{ s.title }}</h2>
            <p v-for="(text, j) in s.paragraphs" :key="j">{{ text }}</p>
          </section>

          <aside class="contact">
            <b>لديك سؤال أو طلب بخصوص بياناتك؟</b>
            <p>
              راسلنا من <RouterLink :to="{ name: 'contact' }">صفحة التواصل</RouterLink><template v-if="email">
                أو على <a :href="`mailto:${email}`" dir="ltr">{{ email }}</a></template
              >.
            </p>
          </aside>
        </article>
      </div>
      <div v-else class="container">
        <LoadState :loading="contentStatus === 'loading'" :error="loadError" @retry="loadSiteContent" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 48px;
  align-items: start;
}
.toc {
  position: sticky;
  top: 96px;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
  font-size: 14px;
}
.toc b {
  display: block;
  margin-bottom: 10px;
  color: var(--fg);
}
.toc ol {
  margin: 0;
  padding-inline-start: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--muted);
}
.toc a:hover {
  color: var(--primary-600);
}
.body {
  max-width: 760px;
}
.intro {
  font-size: 18px;
  line-height: 1.9;
  color: var(--text);
}
.part {
  margin-top: 36px;
  scroll-margin-top: 96px;
}
.part h2 {
  font-size: 22px;
  margin-bottom: 12px;
}
.part h2 span {
  color: var(--primary-600);
}
.part p {
  color: var(--text);
  line-height: 1.95;
  font-size: 16px;
}
.part p + p {
  margin-top: 10px;
}
.contact {
  margin-top: 44px;
  padding: 20px 22px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
}
.contact b {
  color: var(--fg);
}
.contact p {
  margin-top: 6px;
  color: var(--muted);
}
.contact a {
  color: var(--primary-600);
  font-weight: 700;
  unicode-bidi: isolate;
}
@media (max-width: 900px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
  }
  .toc {
    position: static;
  }
}
</style>
