<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import BrandLogo from '@/components/ui/BrandLogo.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { nav } from '@/data/navigation'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { student } = useAuth()
const menuOpen = ref(false) // mobile drawer
const openKey = ref(null) // label of the open dropdown
const scrolled = ref(false)
const isMobile = ref(false)

let mq
const syncMq = () => (isMobile.value = mq.matches)
const onScroll = () => (scrolled.value = window.scrollY > 8)
const onKey = (e) => {
  if (e.key === 'Escape') {
    openKey.value = null
    menuOpen.value = false
  }
}
onMounted(() => {
  mq = window.matchMedia('(max-width: 1180px)')
  syncMq()
  mq.addEventListener('change', syncMq)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  mq?.removeEventListener('change', syncMq)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
})

// desktop: open on hover with a small delay so passing the mouse over doesn't flicker
let timer
function hover(key) {
  if (isMobile.value) return
  clearTimeout(timer)
  timer = setTimeout(() => (openKey.value = key), key ? 80 : 160)
}
function toggle(key) {
  clearTimeout(timer)
  openKey.value = openKey.value === key ? null : key
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
    openKey.value = null
  },
)

// whole-segment match, so /work is not "active" on /workshops
const isActive = (item) =>
  item.to === '/' ? route.path === '/' : (item.match ?? [item.to]).some((p) => route.path === p || route.path.startsWith(`${p}/`))
</script>

<template>
  <header class="header" :class="{ scrolled }">
    <div class="container nav">
      <RouterLink to="/" aria-label="الصفحة الرئيسية"><BrandLogo /></RouterLink>

      <nav class="links" :class="{ open: menuOpen }" aria-label="التنقل الرئيسي">
        <template v-for="item in nav" :key="item.label">
          <div v-if="item.children" class="nav-item" @mouseenter="hover(item.label)" @mouseleave="hover(null)">
            <button
              type="button"
              class="nav-link"
              :class="{ active: isActive(item), expanded: openKey === item.label }"
              :aria-expanded="openKey === item.label"
              aria-haspopup="true"
              @click="toggle(item.label)"
            >
              {{ item.label }}
              <BaseIcon name="chevron-down" :size="16" class="chev" />
            </button>

            <Transition name="drop">
              <div v-if="openKey === item.label" class="dropdown" :class="{ wide: item.wide }">
                <div class="drop-list">
                  <RouterLink v-for="c in item.children" :key="c.label" :to="c.to" class="drop-item" :class="{ current: route.path === c.to }">
                    <span class="d-ico"><BaseIcon :name="c.icon" :size="18" /></span>
                    <span class="d-text">
                      <span class="d-title">{{ c.label }}</span>
                      <span class="d-desc">{{ c.desc }}</span>
                    </span>
                  </RouterLink>
                </div>
                <RouterLink v-if="item.footer" :to="item.footer.to" class="drop-foot">
                  {{ item.footer.label }} <BaseIcon name="arrow" :size="16" />
                </RouterLink>
              </div>
            </Transition>
          </div>

          <RouterLink v-else :to="item.to" class="nav-link" :class="{ active: isActive(item) }">{{ item.label }}</RouterLink>
        </template>

        <RouterLink v-if="student" class="nav-link mobile-only" to="/my-courses">دوراتي</RouterLink>
        <RouterLink v-else class="nav-link mobile-only" to="/login">تسجيل الدخول</RouterLink>
        <RouterLink class="btn btn-dark mobile-only mobile-quote" :to="{ path: '/services', hash: '#contact' }">اطلب عرض سعر</RouterLink>
      </nav>

      <div class="end">
        <RouterLink v-if="student" class="login auth" to="/my-courses"><BaseIcon name="user" :size="18" />دوراتي</RouterLink>
        <RouterLink v-else class="login auth" to="/login"><BaseIcon name="user" :size="18" />دخول</RouterLink>
        <RouterLink class="btn btn-dark quote" :to="{ path: '/services', hash: '#contact' }">اطلب عرض سعر</RouterLink>
        <button class="icon-btn menu-btn" type="button" aria-label="القائمة" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
          <BaseIcon :name="menuOpen ? 'close' : 'menu'" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: env(safe-area-inset-top, 0px);
  z-index: 40;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  backdrop-filter: saturate(1.4) blur(14px);
  -webkit-backdrop-filter: saturate(1.4) blur(14px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.header.scrolled {
  border-bottom-color: var(--line);
  box-shadow: var(--shadow-sm);
}
.nav {
  display: flex;
  align-items: center;
  gap: 28px;
  height: var(--header-h);
}
.links {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
}
.nav-item {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  font-weight: 700;
  font-size: 15px;
  color: var(--muted);
  background: none;
  border: 0;
  cursor: pointer;
  border-radius: 10px;
  transition: color 0.15s, background 0.15s;
}
.nav-link:hover,
.nav-link.expanded {
  color: var(--fg);
}
.nav-link.expanded {
  background: var(--tint-2);
}
.nav-link.active {
  color: var(--primary-600);
}
.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  inset-inline: 12px;
  height: 2px;
  border-radius: 2px;
  background: var(--primary);
}
.chev {
  transition: transform 0.2s;
}
.expanded .chev {
  transform: rotate(180deg);
}

/* ---------- dropdown ---------- */
.dropdown {
  position: absolute;
  top: calc(100% - 6px);
  inset-inline-start: 0;
  width: 320px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: 0 24px 48px -16px rgba(11, 13, 18, 0.25), 0 6px 16px -8px rgba(11, 13, 18, 0.1);
  padding: 8px;
  overflow: hidden;
}
.dropdown.wide {
  width: 560px;
}
.drop-list {
  display: grid;
  gap: 2px;
}
.wide .drop-list {
  grid-template-columns: 1fr 1fr;
}
.drop-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  transition: background 0.15s;
}
.drop-item:hover,
.drop-item.current {
  background: var(--tint-2);
}
.d-ico {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex: none;
  background: var(--primary-soft);
  color: var(--primary-600);
  transition: background 0.15s, color 0.15s;
}
.drop-item:hover .d-ico,
.drop-item.current .d-ico {
  background: var(--primary);
  color: #fff;
}
.d-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.5;
}
.d-title {
  font-weight: 800;
  font-size: 14.5px;
  color: var(--fg);
}
.d-desc {
  font-size: 12.5px;
  color: var(--muted);
}
.drop-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 6px -8px -8px;
  padding: 12px;
  background: var(--tint-2);
  border-top: 1px solid var(--line);
  font-weight: 800;
  font-size: 14px;
  color: var(--primary-600);
}
.drop-foot:hover {
  background: var(--primary-soft);
}
.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.end {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-inline-start: auto;
}
.login {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 15px;
  color: var(--fg);
}
.login:hover {
  color: var(--primary-600);
}
.menu-btn {
  display: none;
}
.mobile-only {
  display: none !important;
}

/* ---------- mobile ---------- */
@media (max-width: 1180px) {
  .links {
    display: none;
    position: absolute;
    top: var(--header-h);
    inset-inline: 0;
    height: auto;
    max-height: calc(100dvh - var(--header-h));
    overflow-y: auto;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    padding: 12px 20px 20px;
    background: var(--surface);
    border-bottom: 1px solid var(--line);
    box-shadow: var(--shadow);
  }
  .links.open {
    display: flex;
  }
  .nav-item {
    flex-direction: column;
    align-items: stretch;
    height: auto;
  }
  .nav-link {
    width: 100%;
    justify-content: space-between;
    padding: 12px;
    font-size: 16px;
  }
  .nav-link.active::after {
    display: none;
  }
  .dropdown,
  .dropdown.wide {
    position: static;
    width: auto;
    box-shadow: none;
    border: 0;
    background: var(--tint-2);
    margin: 2px 0 8px;
    padding: 6px;
  }
  .wide .drop-list {
    grid-template-columns: 1fr;
  }
  .d-desc {
    display: none;
  }
  .d-ico {
    width: 32px;
    height: 32px;
  }
  .drop-item {
    align-items: center;
    padding: 8px;
  }
  .drop-item:hover,
  .drop-item.current {
    background: var(--surface);
  }
  .drop-foot {
    margin: 6px -6px -6px;
    background: transparent;
  }
  .menu-btn {
    display: grid;
  }
}
@media (max-width: 560px) {
  .auth,
  .quote {
    display: none;
  }
  .links .mobile-only {
    display: flex !important;
  }
  .links .mobile-quote {
    color: #fff;
    justify-content: center;
    margin-top: 8px;
  }
  .nav :deep(.brand) {
    font-size: 17px;
  }
}
</style>
