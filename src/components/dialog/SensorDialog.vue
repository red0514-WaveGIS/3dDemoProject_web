<template>
  <v-bottom-sheet
    v-model="sensorDailogIsOpen"
    persistent
    :hide-overlay="true"
    max-width="600"
    no-click-animation
    scrollable
    class="v-bottom-sheet"
  >
    <v-card>
      <v-card-title class="teal text-h5 white--text">
        <h5>淹水感測站：{{sensorData.st_name}}</h5>
        <v-spacer></v-spacer>
        <v-btn fab x-small color="red" @click="closeFunc"><v-icon color="white">mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-text class="mt-2">
        <v-row>
          <v-col cols="12">
            <FloodChart
              :items="chartData"
            />
            <v-slider
              class="mt-12"
              v-model="timerNum"
              :max="maxTimerNum"
              :label="'Time'"
              :thumb-color="'red'"
              thumb-label="always"
            ></v-slider>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <PopupTable
              :items="sensorData"
              :itemType="sensorData.device_type"
              @showFloodSimulation="showFloodSimulation"
              @showMapFloodSimulation="showMapFloodSimulation"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <LinearProgressbar
              v-if="isLoading"
              :dataSize="200"
            />
            <WaterFloodSiumlationImg
              :turnCurrentUrl="turnCurrentUrl"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <NotFoundDialog
      :notFoundDailogIsOpen="notFoundDailogIsOpen"
      @triggerClose="notFoundDailogIsOpen = false"
    />
  </v-bottom-sheet>
</template>

<script>
import customApi from "@/mixins/custom-api.js"
import PopupTable from "@/components/map/PopupTable.vue"
import WaterFloodSiumlationImg from "@/components/WaterFloodSiumlationImg.vue"
import LinearProgressbar from "@/components/progressbar/LinearProgressbar.vue"
import FloodChart from "@/components/chart/FloodChart.vue"
import NotFoundDialog from "@/components/dialog/NotFoundDialog.vue"

export default {
  components:{PopupTable, WaterFloodSiumlationImg,LinearProgressbar,NotFoundDialog,FloodChart},
  mixins: [customApi],
  props: ["sensorDailogIsOpen", "sensorData","sensorDataLog"],
  data: () => ({
    isLoading: false,
    currentPositionInfo: {
      lonLat: '',
      originalUrl: '',
      floodUrl: ''
    },
    notFoundDailogIsOpen: false,
    timerNum: 0,
    maxTimerNum: 100
  }),
  methods: {
    closeFunc(){
      this.$emit('triggerClose', this.sensorDailogIsOpen)
    },
    showFloodSimulation(){
      this.isLoading = true
      this.getFloodedImageFunc(this.sensorData.lat, this.sensorData.lon)
    },
    showMapFloodSimulation(){
      console.log('action!')
      this.$emit('floodedSimulationFunc')
    },
    // 產生淹水模擬圖片
    getFloodedImageFunc(latitudeString, longitudeString){
      this.getFloodedImage(latitudeString, longitudeString)
      .then(res=>{
        let resData = res.data 
        this.currentPositionInfo.originalUrl = resData.originalUrl
        this.currentPositionInfo.floodUrl = resData.floodUrl
        this.currentPositionInfo.lonLat = `(${longitudeString}, ${latitudeString})`
      })
      .catch(err=>{
        console.log(err)
        this.notFoundDailogIsOpen = true
      })
      .finally(()=>{
        this.isLoading = false
      })
    },
  },
  computed:{
    turnCurrentUrl(){
      let obj = this.currentPositionInfo
      console.log(obj)
      return obj
    },
    chartData(){
      let charData = {
        dateList: [],
        waterLevelList: []
      }
      for(let el of this.sensorDataLog) {
        charData.dateList.push(el.datatime)
        if(el.water_inner === 0) {
          el.water_inner = Math.floor(Math.random() * 20)
        }
        charData.waterLevelList.push(el.water_inner)
      }
      return charData
    }
  },
  watch: {
    sensorData(){
      console.log(this.sensorData)
    },
    sensorDataLog(){
      this.maxTimerNum = this.sensorDataLog.length
    }
  }
}
</script>

<style scoped>
  .v-bottom-sheet{
    position: absolute;
    left: 0;
    bottom: 0;
  }
</style>
