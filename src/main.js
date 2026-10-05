import { createApp } from 'vue'

import '@fontsource/cairo/400.css'
import '@fontsource/cairo/600.css'
import '@fontsource/cairo/700.css'
import '@fontsource/cairo/800.css'
import '@/assets/styles/tokens.css'
import '@/assets/styles/base.css'

import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
