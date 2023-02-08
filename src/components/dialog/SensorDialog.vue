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
            <v-row>
              <v-col cols="12" class="d-flex justify-space-around align-center">
                <div class="d-flex justify-space-around align-center teal lighten-5">
                  <v-btn title="speed down" icon :disabled="playerStatus" @click="playerSpeedControler(-1)">
                    <v-icon>mdi-speedometer-slow</v-icon>
                  </v-btn>
                  <v-btn icon @click="skipPreviousOrNext('previous')">
                    <v-icon>mdi-skip-previous</v-icon>
                  </v-btn>
                  <v-btn icon color="red" @click="stopControlTimerFunc">
                    <v-icon>mdi-stop</v-icon>
                  </v-btn>
                  <v-btn icon @click="controlTimerFunc" :color="playerStatus === true? 'orange':'success'">
                    <v-icon>{{playerStatus === true ? "mdi-pause": "mdi-play"}}</v-icon>
                  </v-btn>
                  <v-btn icon @click="playerRepeatStatus = !playerRepeatStatus" :color="playerRepeatStatus === true? 'purple lighten-2':'grey'">
                    <v-icon>{{playerRepeatStatus === true ? "mdi-repeat": "mdi-repeat-off"}}</v-icon>
                  </v-btn>
                  <v-btn icon @click="skipPreviousOrNext('next')">
                    <v-icon>mdi-skip-next</v-icon>
                  </v-btn>
                  <v-btn title="speed up" icon :disabled="playerStatus" @click="playerSpeedControler(1)">
                    <v-icon>mdi-speedometer</v-icon>
                  </v-btn>
                  <p class="mb-0 mx-2 grey lighten-1 white--text px-1 py-1 rounded">{{speedText}}</p>
                </div>
                <v-btn class="mx-2" dark small color="info" @click="showMapFloodSimulation"><v-icon left>mdi-water-alert</v-icon>顯示3D淹水模擬</v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-chip
                  class="ma-1"
                  color="teal"
                  label
                  text-color="white"
                >
                  <v-icon left>
                    mdi-calendar-blank
                  </v-icon>
                  {{ sensorDataDatetime }}
                </v-chip>
                <v-chip
                  class="ma-1"
                  color="cyan"
                  label
                  text-color="white"
                >
                  <v-icon left>
                    mdi-cup-water
                  </v-icon>
                  {{ sensorDataWaterLevel }} m
                </v-chip>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <PopupTable
              :items="sensorData"
              :itemType="sensorData.device_type"
              @showFloodSimulation="showFloodSimulation"
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
    maxTimerNum: 100,
    playerStatus: false,
    playerRepeatStatus: false,
    playerSpeed: 1000,
    playerSpeedNum: 3,
    floodTimeZone: 0,
    floodTargetValue: 0,
    timerInterval: [],
    interValValue: 1000
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
    controlTimerFunc(){
      this.playerStatus = !this.playerStatus
      if(this.playerStatus){
        this.timerInterval = setInterval(() => {
          if(this.timerNum < this.maxTimerNum) {
            this.timerNum ++
          } else if (this.timerNum === this.maxTimerNum){
            if(this.playerRepeatStatus === false) {
              clearInterval(this.timerInterval)
              this.playerStatus = false
            }
            this.timerNum = 0
          }
        }, this.interValValue)
      } else {
        clearInterval(this.timerInterval)
      }
    },
    stopControlTimerFunc(){
      this.playerStatus = false
      this.timerNum = 0
      clearInterval(this.timerInterval)
    },
    skipPreviousOrNext(status){
      if(status === 'previous') {
        if(this.timerNum !== 0) {
          clearInterval(this.timerInterval)
          this.playerStatus = false
          this.timerNum = this.timerNum - 1
        }
      } else {
        if(this.timerNum !== this.maxTimerNum) {
          clearInterval(this.timerInterval)
          this.playerStatus = false
          this.timerNum = this.timerNum + 1
        }
      }
    },
    playerSpeedControler(count){
      const speedList = [2000, 1750, 1250, 1000, 750, 250]
      this.playerSpeedNum = this.playerSpeedNum + count
      if(this.playerSpeedNum < 0) {
        this.playerSpeedNum = 0
      } else if (this.playerSpeedNum > 5) {
        this.playerSpeedNum = 5
      }
      this.playerSpeed = speedList[this.playerSpeedNum]
    }
  },
  computed:{
    turnCurrentUrl(){
      let obj = this.currentPositionInfo
      return obj
    },
    chartData(){
      let charData = {
        dateList: [],
        waterLevelList: []
      }
      for(let el of this.sensorDataLog) {
        charData.dateList.push(el.datatime)
        charData.waterLevelList.push(el.water_inner)
      }
      return charData
    },
    sensorDataDatetime(){
      let datatime = ""
      if(this.sensorDataLog.length !== 0) {
        datatime = this.sensorDataLog[this.timerNum].datatime
      }
      return datatime
    },
    sensorDataWaterLevel(){
      let waterLevel = ""
      if(this.sensorDataLog.length !== 0) {
        waterLevel = this.sensorDataLog[this.timerNum].water_inner
      }
      return waterLevel
    },
    speedText(){
      let speed = 'x 1.00'
      switch (this.playerSpeed) {
        case 2000:
          speed = 'x 0.25'
          break
        case 1750:
          speed = 'x 0.50'
          break
        case 1250:
          speed = 'x 0.75'
          break     
        case 1000:
          speed = 'x 1.00'
          break
        case 750:
          speed = 'x 1.75'
          break
        case 250:
          speed = 'x 2.00'
          break
      }
      return speed
    }
  },
  watch: {
    sensorData(){
      console.log(this.sensorData)
    },
    sensorDataLog(){
      this.maxTimerNum = this.sensorDataLog.length - 1
    },
    timerNum(){
      this.$emit('selectedFloodingDate', this.sensorDataLog[this.timerNum].datatime)
    },
    playerSpeed(newVal){
      this.interValValue = newVal
      console.log(this.interValValue)
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
