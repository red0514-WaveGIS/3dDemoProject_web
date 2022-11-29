var echarts = require('echarts')

const install = function (Vue) {
  Object.defineProperties(Vue.prototype, {
    $echarts: {
      get() {
        return {
          buildChart: function (id,optionData) {
            this.chart = echarts.init(document.getElementById(id))
            this.chart.clear()
            this.chart.setOption(optionData)
            return this.chart
          }
        }
      }
    }
  })
}

export default {
  install
}