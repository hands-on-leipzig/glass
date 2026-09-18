import 'bootstrap-icons/font/bootstrap-icons.css'
import '../../styles/index.css'
import './story-chrome.css'
import { createApp } from 'vue'
import { initTheme } from '../../theme/index.js'
import App from './App.vue'

initTheme()
createApp(App).mount('#app')
