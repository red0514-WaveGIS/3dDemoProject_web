import Vue from 'vue'

import errorPage from '@/layout/error.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(errorPage),
}).$mount('#app')
