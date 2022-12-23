import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import index from '@/layouts/index.vue'
import vuetify from '@/plugins/vuetify'
import router from '@/router/index.js'
import store from '@/store/index.js'
import wgUI from 'wg-ui-component-vuetify'
import '@/mixins/global'
import '@/mixins/custom'
import '@/styles/customer.sass'
import VuetifyConfirm from 'vuetify-confirm'
import ECharts from '@/plugins/echarts'
import XLSX from "@/plugins/xlsx"
import VueDraggableResizable from 'vue-draggable-resizable'
import * as turf from '@turf/turf'
import * as Cesium from 'cesium'

// optionally import default styles
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
Vue.component('vue-draggable-resizable', VueDraggableResizable)
Vue.config.productionTip = false
Vue.use(XLSX)
Vue.use(VueAxios, axios)
Vue.use(VuetifyConfirm, { vuetify })
Vue.use(wgUI)
Vue.use(ECharts)
Vue.use(turf)
Vue.use(Cesium)

new Vue({
  vuetify,
  router,
  store,
  render: h => h(index)
}).$mount('#app')