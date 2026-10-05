import { createApp } from 'vue'

import '@fontsource/cairo/400.css'
import '@fontsource/cairo/600.css'
import '@fontsource/cairo/700.css'
import '@fontsource/cairo/800.css'
import '@/assets/styles/tokens.css'
import '@/assets/styles/base.css'

import App from './App.vue'
import router, { pageTitle } from './router'
import { loadSiteContent } from './lib/siteContent'

createApp(App).use(router).mount('#app')
// the site's texts from the dashboard (the bundled ones show until they arrive)
loadSiteContent().then(() => {
  // the tab title, now with the dashboard's page names (course and article pages set their own)
  const route = router.currentRoute.value
  if (!Object.keys(route.params).length) document.title = pageTitle(route)
})
