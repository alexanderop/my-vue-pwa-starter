import { createApp } from 'vue'
import '@starter/ui/styles.css'
import './app/app.css'
import App from './app/App.vue'
import { createApplication } from './app/bootstrap'

const application = createApplication()
const app = createApp(App, { notes: application.notes })
app.use(application.router).mount('#app')
function onPageHide(event: PageTransitionEvent) {
  if (!event.persisted) application.close()
}
window.addEventListener('pagehide', onPageHide)
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    window.removeEventListener('pagehide', onPageHide)
    app.unmount()
    application.close()
  })
