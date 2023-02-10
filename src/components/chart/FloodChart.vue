<template>
  <div class="chart" :id="'barChart'" v-divResize="resize"></div>
</template>

<script>
var xIndex = 0
console.log(xIndex)
export default {
  name: "FloodChart",
  props: ["items","playerSpeed","timerNum"],
  data: () => ({
    crumbleProbability: null,
    tempChat: null,
    aaa: '',
    option: {
      title: {
        text: '歷史水位圖'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#283b56'
          },
          crossStyle: {
            color: '#999'
          }
        },
        formatter: function(params) {
          xIndex = params[0].dataIndex
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        nameLocation: 'middle',
        axisPointer: {
          type: 'shadow',
        },
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] // date
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320], // init water level
          type: 'line',
          smooth: 0.4,
          areaStyle: {
            color: "#D9EDF770"
          },
          // lineStyle:{
          //   color: "#0000050"
          // },
          itemStyle:{
            color: function(s){
            let itemIndex = s.dataIndex
            let color = "#092D3D80"
            if(xIndex === itemIndex) color = "#E62B32"
              return color
            }
          },
        }
      ],
      grid: {
        right: 8,
        bottom: 20, // default is 60
      }
    },
    chartsInterval: null
  }),
  mounted: async function() {
    this.option.xAxis.data = this.items.dateList
    this.option.series[0].data = this.items.waterLevelList
    this.buildChartFun()
  },
  methods: {
    buildChartFun: function(){
      let myChart = this.$echarts.buildChart("barChart", {})
      myChart.setOption(this.option)
      this.tempChat = myChart
      // let currentThis = this
      // this.tempChat.getZr().on('click', function(){
      //   console.log(xIndex)
      //   console.log(currentThis.tempChat)
      // })
      this.tempChat.setOption(this.option)

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
    },
    "timerNum": function(){
      xIndex = this.timerNum
      this.tempChat.setOption(this.option)
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
