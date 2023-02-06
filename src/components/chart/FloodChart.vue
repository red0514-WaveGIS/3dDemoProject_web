<template>
  <div class="chart" :id="'barChart'" v-divResize="resize"></div>
</template>

<script>
export default {
  name: "FloodChart",
  props: ["items"],
  data: () => ({
    crumbleProbability: null,
    tempChat: null,
    option: {
      title: {
        text: '歷史水位圖'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        nameLocation: 'middle',
        axisPointer: {
          type: 'shadow'
        },
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] // date
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320], // init water level
          type: 'line',
          areaStyle: {
            color: "#D9EDF7"
          },
          // lineStyle:{
          //   color: "#0000050"
          // },
          itemStyle:{
            color: "#092D3D80"
          }
        }
      ],
      grid: {
        bottom: 20, // default is 60
      }
    },
  }),
  mounted: async function() {
    this.option.xAxis.data = this.items.dateList
    this.option.series[0].data = this.items.waterLevelList
    this.buildChartFun()
  },
  methods: {
    buildChartFun: function(){
      let myChart = this.$echarts.buildChart("barChart", {})

      myChart.setOption(this.option);
      this.tempChat = myChart
    },
    resize: function() {
      if (this.tempChat) {
        this.tempChat.resize()
      }
    },
  },
  directives: {
    divResize: {
      bind: function(el, binding) {
        let width = ""
        let height = ""
        function isReize() {
          let style = document.defaultView.getComputedStyle(el)
          if (width !== style.width || height !== style.height) {
            binding.value()
          }
          width = style.width
          height = style.height
        }
        el.__vueSetInterval__ = setInterval(isReize, 300)
      },
      unbind: function(el) {
        clearInterval(el.__vueSetInterval__)
      },
    },
  },
  watch:{
    "items": function(){
      this.option.xAxis.data = this.items.dateList
      this.option.series[0].data = this.items.waterLevelList
      this.buildChartFun()
    }
  }
}
</script>

<style scoped>
.chart {
  width: 100%;
  height: 350px;
}
@media only screen and (max-width: 599px){
  .chart {
    width: 100%;
    height: 350px;
  }
}
</style>
