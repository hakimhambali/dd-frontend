import App from '@/App.vue'
import BaseAlert from '@/components/BaseAlert.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import BaseModal from '@/components/BaseModal.vue'
import SpinnerOverlay from '@/components/SpinnerOverlay.vue'
import TablePagination from '@/components/TablePagination.vue'
import router from '@/router'
import '@tabler/core/dist/css/tabler.min.css'
import 'bootstrap/dist/js/bootstrap'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App);

app.use(pinia).use(router);

app
    .component('BaseAlert', BaseAlert)
    .component('BaseIcon', BaseIcon)
    .component('BaseModal', BaseModal)
    .component('Pagination', TablePagination)
    .component('SpinnerOverlay', SpinnerOverlay)
    .component('v-select', VueSelect)

app.mount('#app')
