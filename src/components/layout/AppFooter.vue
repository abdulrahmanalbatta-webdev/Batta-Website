<script setup>
import BrandLogo from '@/components/ui/BrandLogo.vue'
import SocialLinks from '@/components/ui/SocialLinks.vue'
import { useContact } from '@/composables/useSettings'
import { profile } from '@/data/profile'
import { texts } from '@/data/texts'

const year = new Date().getFullYear()
const { email, whatsapp, whatsappUrl } = useContact()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="cols">
        <div>
          <BrandLogo inverse />
          <p>{{ profile.role }}. {{ texts.general.footer.text }}</p>
          <ul class="contact">
            <li v-if="email"><a :href="`mailto:${email}`" dir="ltr">{{ email }}</a></li>
            <li v-if="whatsappUrl"><a :href="whatsappUrl" target="_blank" rel="noopener" dir="ltr">{{ whatsapp }}</a></li>
          </ul>
          <SocialLinks dark class="socials" />
        </div>
        <div>
          <h4>اعمل معي</h4>
          <ul>
            <li><RouterLink to="/services">{{ texts.ui.pages.services }}</RouterLink></li>
            <li><RouterLink to="/work">{{ texts.ui.pages.work }}</RouterLink></li>
            <li><RouterLink :to="{ name: 'contact' }">{{ texts.ui.buttons.quote }}</RouterLink></li>
            <li><RouterLink to="/about">{{ texts.ui.pages.about }}</RouterLink></li>
          </ul>
        </div>
        <div>
          <h4>تعلّم</h4>
          <ul>
            <li><RouterLink to="/courses">{{ texts.ui.pages.courses }}</RouterLink></li>
            <li><RouterLink to="/workshops">{{ texts.ui.pages.workshops }}</RouterLink></li>
            <li><RouterLink to="/articles">{{ texts.ui.pages.articles }}</RouterLink></li>
            <li><RouterLink to="/tools">{{ texts.ui.pages.tools }}</RouterLink></li>
          </ul>
        </div>
        <div>
          <h4>الحساب</h4>
          <ul>
            <li><RouterLink to="/login">تسجيل الدخول</RouterLink></li>
            <li><RouterLink to="/register">إنشاء حساب</RouterLink></li>
            <li><RouterLink :to="{ path: '/', hash: '#newsletter' }">{{ texts.home.newsletter.title }}</RouterLink></li>
          </ul>
        </div>
      </div>
      <div class="bottom">
        <span>© {{ year }} {{ profile.name }}. جميع الحقوق محفوظة.</span>
        <span v-if="texts.general.footer.made_with">{{ texts.general.footer.made_with }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--ink-panel);
  color: var(--ink-text);
  padding-block: 56px 28px;
}
.cols {
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr);
  gap: 32px;
}
p {
  font-size: 14.5px;
  max-width: 300px;
  margin-top: 14px;
}
h4 {
  font-size: 15px;
  color: #fff;
  margin-bottom: 12px;
}
.contact {
  margin: 14px 0 0 !important;
}
.contact a {
  unicode-bidi: isolate;
}
.cols > div > ul:not(.socials) {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14.5px;
}
a:hover {
  color: #fff;
}
.socials {
  margin-top: 18px;
}
.bottom {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 13.5px;
  color: #7d8796;
}
@media (max-width: 860px) {
  .cols {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 480px) {
  .cols {
    grid-template-columns: 1fr;
  }
}
</style>
