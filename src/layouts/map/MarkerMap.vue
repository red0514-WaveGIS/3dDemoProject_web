<template>
  <div>
    <div class="mapBox">
      <div id="cesiumContainer"></div>
      <div 
        class="d-flex control_plate"
        :style="positionStyle"
      >
        <div class="control_plate_bg mt-0 pt-0">
          <v-alert
            border="left"
            color="blue-grey darken-1"
            dark
          >
            <h3>Map Tools</h3>
          </v-alert>
          <div class="mx-4">
            <div class="cesium-style">
              <h3 class="yellow lighten-5">Cesium Tools</h3>
              <div class="mt-2">
                <h4 class="mt-2">LayerPicker</h4>
                <div class="mt-2">
                  <v-radio-group v-model="layerGroup" class="mt-2">
                    <v-radio
                      v-for="layer in layerLists"
                      color="cyan"
                      :key="layer"
                      :label="`${layer}`"
                      :value="layer"
                    >
                      <template v-slot:label>
                        <div>
                          <v-icon>{{turnBackLayersIconFunc(layer)}}</v-icon> 
                          <span class="pl-2">{{layer}}</span>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </div>
                <v-divider></v-divider>
                <h4 class="mt-2">Building Control</h4>
                <div class="my-2 ">
                  <v-switch
                    class="mt-0"
                    color="green"
                    v-model="buildingState"
                    :hide-details="true"
                    :label="`${buildingState === false ? '顯示':'隱藏'}3D建築`"
                    @change="addBuildingFunc(buildingState)"
                  ></v-switch>
                </div>
                <v-expansion-panels class="mb-4">
                  <v-expansion-panel>
                    <v-expansion-panel-header><span class="pink--text">*設定建築顯示範圍</span></v-expansion-panel-header>
                    <v-expansion-panel-content>
                     <div class="d-flex">
                        <v-text-field 
                          class="mx-2"
                          hide-details
                          label="Up_lat"
                          v-model="upLat"
                        ></v-text-field>
                        <v-text-field 
                          class="mx-2"
                          hide-details
                          label="Bottom_lat"
                          v-model="bottomLat"
                        ></v-text-field>
                      </div>
                      <div class="d-flex">
                        <v-text-field 
                          class="mx-2"
                          hide-details
                          label="Left_lon"
                          v-model="leftLon"
                        ></v-text-field>
                        <v-text-field 
                          class="mx-2"
                          hide-details
                          label="Right_lon"
                          v-model="rightLon"
                        ></v-text-field>
                      </div>
                      <div class="d-flex justify-end">
                        <v-btn class="mt-4" dark color="cyan" @click="addSampleLoactionForShowBuildingFunc()">
                          <v-icon dark class="pr-1">mdi-map-marker-plus</v-icon>Add Sample Loaction
                        </v-btn>
                        <v-btn class="mt-4 mx-2" dark color="green" @click="resetShowBuildingAreaFunc()">
                          <v-icon class="pr-1" dark>mdi-arrow-u-up-left-bold</v-icon>Reset
                        </v-btn>
                        <v-btn class="mt-4" dark color="orange" @click="setShowBuildingAreaFunc()">
                          <v-icon dark class="pr-1">mdi-settings</v-icon>Set
                        </v-btn>
                      </div>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
                <v-divider></v-divider>
                <h4 class="mt-2">Flooded Board</h4>
                <div v-for="floodItem of floodedList" :key="floodItem.areaName" class="mt-2">
                  <v-switch
                    class="mt-0"
                    color="blue"
                    v-model="floodItem.active"
                    :hide-details="true"
                    :label="floodItem.areaName"
                    @change="showFloodedAreaFunc(floodItem.active, floodItem.name)"
                  ></v-switch>
                  <div class="d-flex align-center my-2">
                    <span class="mx-2">海拔：{{(+(floodItem.height)).toFixed(2)}} m</span>
                    <v-btn x-small dark fab color="green" @click="pluseFloodAreaFunc(floodItem.name)">
                      <v-icon color="white">{{floodItem.isPause? 'mdi-play-circle-outline': 'mdi-pause-circle-outline'}}</v-icon>
                    </v-btn>
                    <v-btn class="ml-2" color="red" x-small dark fab @click="cameraFlyToFunc(floodItem.name)">
                      <v-icon color="white">mdi-airplane-takeoff</v-icon>
                    </v-btn>
                  </div>
                </div>
                <v-divider></v-divider>
                <h4 class="mt-2">Weather Simulation</h4>
                <v-radio-group v-model="weatherGroup" class="mt-2">
                  <v-radio
                    v-for="weather in weatherLists"
                    color="orange"
                    :key="weather"
                    :label="`${weather}`"
                    :value="weather"
                  >
                    <template v-slot:label>
                      <div>
                        <v-icon>{{turnBackIconFunc(weather)}}</v-icon> 
                        <span class="pl-2">{{weather}}</span>
                      </div>
                    </template>
                  </v-radio>
                </v-radio-group>
                <v-divider></v-divider>
                <h4 class="mt-2">Functional Btn</h4>
                <v-col cols="12">
                  <v-btn
                    color="teal" 
                    @click="cameraFlyToFunc('origin')"
                  >
                    <span class="white--text">返回初始視角</span> 
                  </v-btn>
                </v-col>
              </div>
            </div>
          </div>
        </div>
        <div class="collapse d-flex align-center">
          <span 
            @click="collapseFunc()" 
            class="arrow-style pl-2 white--text"
          >{{isShowMapTools === true ? "＜":"＞"}}</span>
        </div>
      </div>
      <LonLatHeigntLable
        v-if="lonLatHeightIsShow"
        :lonLatHeightData="lonLatHeightData"
      />
      <BasicProgressbarVue 
        v-if="isLoading"
        :dataSize="200"
      />
      <ImgDialog
        :imgDailogIsOpen="imgDailogIsOpen"
        :turnCurrentUrl="turnCurrentUrl"
        @triggerClose="closeImgDialog"
      />
      <SensorDialog
        :sensorDailogIsOpen="sensorDailogIsOpen"
        :sensorData="sensorData"
        :sensorDataLog="sensorDataLog"
        :pDistanceInMeters="pDistanceInMeters"
        @changeFloodAreaFunc="changeFloodAreaFunc"
        @triggerClose="closeSensorDialog"
        @floodedSimulationFunc="floodedSimulationFunc()"
        @selectedFloodingDate="selectedFloodingDate"
      />
      <NotFoundDialog
        :notFoundDailogIsOpen="notFoundDailogIsOpen"
        @triggerClose="notFoundDailogIsOpen = false"
      />
    </div>
  </div>
</template>
<script>
import customApi from "@/mixins/custom-api.js"
import customCesium from "@/mixins/custom-cesium.js"
import weather from '@/assets/cesium-object/weather.js'
import floodedLists from '@/assets/cesium-object/floodedList.js'
import BasicProgressbarVue from "@/components/progressbar/BasicProgressbar.vue"
import ImgDialog from "@/components/dialog/ImgDialog.vue"
import SensorDialog from "@/components/dialog/SensorDialog.vue"
import NotFoundDialog from "@/components/dialog/NotFoundDialog.vue"
import LonLatHeigntLable from "@/components/map/LonLatHeigntLable.vue"

export default {
  name: "MarkerMap",
  components: {
    BasicProgressbarVue,ImgDialog,NotFoundDialog,SensorDialog,LonLatHeigntLable
  },
  mixins: [customApi, customCesium],
  data: () => ({
    orgId: 69,
    Cesium: null,
    originalPosition: {
      lon: 120.639,
      lat: 24.001,
      height: 20000
    },
    map: {
      mapTargetId: "MarkerMap",
      lon: 121.556,
      lat: 25.035,
    },
    dataLoading: false,
    buildingState: false,
    isShowMapTools: false,
    positionStyle: 'transform: translateX(-89%); height: 50%; top:22%;',
    mapRadio: 'hybrid',
    viewSwitch: true,
    weatherGroup: 'Cloudy',
    weatherLists: ['Cloudy', 'Rain', 'Fog', 'Snow'],
    layerGroup: 'satelliteOnly',
    layerLists: ['standardRoadMap', 'somehowAlteredRoadMap', 'hybrid', 'satelliteOnly', 'terrain'],
    showBuildingAreaState: {
      isSetBuilding: null,
      point: [0,0,0,0]
    },
    upLat: 0,
    bottomLat: 0,
    leftLon: 0,
    rightLon: 0,
    cesiumViewer: null,
    isLoading: true,
    floodedList: null,
    currentPositionInfo: {
      lonLat: '',
      originalUrl: '',
      floodUrl: ''
    },
    imgDailogIsOpen: false,
    notFoundDailogIsOpen: false,
    siteInfoDom: false,
    floodedBoxes: [],
    floodedSimulation: false,
    targetFloodedHeight: 0,
    sensorDailogIsOpen: false,
    sensorData: [],
    sensorDataLog: [],
    sensorGeoData: [],
    sensorLogQueue: {},
    selectedFloodDate: "",
    pDistanceInMeters: 100,
    lonLatHeightData: {
      lon: 0,
      lat: 0,
      height: 0,
    },
    lonLatHeightIsShow: false
  }),
  beforeMount() {
    this.floodedList = floodedLists
  },
  mounted: async function() {
    await this.initOriginCesium()
    await this.getFloodListData(this.orgId)
    .then(res=>{
      let resData = res.data
      resData.forEach((el,i)=>{
        if(i > 34 && i < 47) {
          this.addPointFunc(this.cesiumViewer, el) // add
        }
      })
    })
    .catch(err=>{
      console.log(err)
    })
    .finally(()=>{
      this.lonLatHeightIsShow = true
    })

    // 設定獲取當前點位經緯度(lon, lat)與視野(Camera)高度 ; 初始化Cesium事件
    this.setCesiumEvent()
    

    // 設定拖曳KML匯入地圖
    this.setDragDropFunc(this.cesiumViewer)

    this.doRoadingFunc(4000)
  },
  methods: {
    setCesiumEvent(){
      let currentThis = this
      this.setFeatureEventListener(this.cesiumViewer, {
        hasFeature: async function(handler) {
          // Set left click event
          handler.setInputAction(function(data) {
            let pickedObjects = currentThis.cesiumViewer.scene.drillPick(data.position)
            if(currentThis.Cesium.defined(pickedObjects)) {
              if(pickedObjects.length >=1) {
                let entity = pickedObjects[0].id
                let geoDetail = currentThis.getLonLatHeightFunc(data)
                // Get target info
                let height = geoDetail.height // 這裡的height是指 地圖點擊這個點的高度
                let st_no = entity.store.st_no
                currentThis.getFloodLog(69,st_no)
                .then(res=>{
                  let randomNum = 0
                  for(let el of res.data) {
                    if(el.water_inner === 0) {
                      if(Number((Math.random() * 0.1).toFixed(2)) > 0.04) {
                        randomNum = randomNum + Number((Math.random() * 0.1).toFixed(2))
                        el.water_inner = Math.abs(Number(randomNum.toFixed(2)))
                      } else {
                        if(randomNum !== 0) {
                          randomNum = randomNum - Number((Math.random() * 0.1)).toFixed(2)
                        }
                        el.water_inner = Math.abs(Number(randomNum.toFixed(2)))
                      }
                    }
                    currentThis.sensorLogQueue[el.datatime] = el.water_inner + height
                  }
                  currentThis.sensorDataLog = res.data
                })
                .catch(err=>{
                  console.log(err)
                })
                .finally(()=>{
                  currentThis.sensorData = entity.store
                  currentThis.sensorGeoData = data
                  currentThis.sensorDailogIsOpen = true
                  currentThis.floodedSimulationFunc()
                })
              }
            }
          }, currentThis.Cesium.ScreenSpaceEventType.LEFT_CLICK) // left click

          // Set right click event
          handler.setInputAction(function(data) {
            let lonlatInfo = currentThis.getLonLatHeightFunc(data)
            console.log(lonlatInfo)

          }, currentThis.Cesium.ScreenSpaceEventType.RIGHT_CLICK) // Right click

          // Set scroll MOUSE_MOVE  event
          handler.setInputAction(async function(data) {
            let cartesian2 = {position: data.endPosition}
            let lonlatInfo = currentThis.getLonLatHeightFunc(cartesian2)
            currentThis.lonLatHeightData.lon = lonlatInfo.lon
            currentThis.lonLatHeightData.lat = lonlatInfo.lat
            currentThis.lonLatHeightData.height = lonlatInfo.height
          }, currentThis.Cesium.ScreenSpaceEventType.MOUSE_MOVE) // scroll MOUSE_MOVE 
        }
      })
    },
    // 產生淹水模擬圖片
    getFloodedImageFunc(latitudeString, longitudeString){
      this.doRoadingFunc(null, true)
      this.getFloodedImage(+latitudeString, +longitudeString)
      .then(res=>{
        let resData = res.data 
        this.currentPositionInfo.originalUrl = resData.originalUrl
        this.currentPositionInfo.floodUrl = resData.floodUrl
        this.currentPositionInfo.lonLat = `(${longitudeString}, ${latitudeString})`
        setTimeout(()=>{
          this.doRoadingFunc(null, false)
          this.imgDailogIsOpen = true
        },5000)
      })
      .catch(err=>{
        console.log(err)
        this.doRoadingFunc(null, false)
        this.notFoundDailogIsOpen = true
      })
    },
    getLonLatHeightFunc(data){
      let ellipsoid = this.cesiumViewer.scene.globe.ellipsoid
      let ray = this.cesiumViewer.camera.getPickRay(data.position)
      let cartesian3 = this.cesiumViewer.scene.globe.pick(ray, this.cesiumViewer.scene)
      let cartographic = ellipsoid.cartesianToCartographic(cartesian3)
      //將弧度轉為度的十進位制度表示
      let longitudeString = this.Cesium.Math.toDegrees(cartographic.longitude).toFixed(4)
      let latitudeString = this.Cesium.Math.toDegrees(cartographic.latitude).toFixed(4)
      let geoDetail = {
        lon: +longitudeString,
        lat: +latitudeString,
        height: cartographic.height
      }
      return geoDetail
    },
    floodedSimulationFunc(){
      console.log(this.sensorData)
      // let geoData = this.sensorGeoData
      // let ellipsoid = this.cesiumViewer.scene.globe.ellipsoid
      // let ray = this.cesiumViewer.camera.getPickRay(geoData.position)
      // let cartesian3 = this.cesiumViewer.scene.globe.pick(ray, this.cesiumViewer.scene)
      // let cartographic = ellipsoid.cartesianToCartographic(cartesian3)
      // let lon = this.Cesium.Math.toDegrees(cartographic.longitude)
      // let lat = this.Cesium.Math.toDegrees(cartographic.latitude)
      let lon = this.sensorData.lon
      let lat = this.sensorData.lat
      let height = Number(this.sensorData.height)
      let geoDetail = {
        lon: lon,
        lat: lat,
        height: height,
        sensorLog: this.sensorDataLog
      }
      // 獲取中心點向外擴4點
      let pointAroundSquare = this.getBoundingBox(lat, lon, this.pDistanceInMeters)    
      for(let el of this.floodedBoxes) {
        this.cesiumViewer.entities.removeById(el.id)
      }
      let entity = this.addedFloodedPolygonWithLatLon(this.cesiumViewer, pointAroundSquare, geoDetail)
      this.floodedBoxes = []
      this.floodedBoxes.push(entity.flooded)
      this.floodedBoxes.push(entity.flag)
    },
    collapseFunc(){
      this.isShowMapTools = !this.isShowMapTools
      if(this.isShowMapTools) {
        this.positionStyle = ''
      } else {
        this.positionStyle = "transform: translateX(-89%); height: 50%; top:22%;"
      }
    },
    async showFloodedAreaFunc(state, name){
      let item = this.floodedList[name]
      if(state) {
        if(this.floodedList[name].cesiumItem === null) {
          this.isLoading = true
          this.floodedList[name].cesiumItem = await this.addedFloodedPolygon(this.cesiumViewer, item, name)
          this.isLoading = false
        } else {
          for(let entity of this.floodedList[name].cesiumItem._entities._array) {
            if(entity._name === item.areaName) {
              entity._show = state
              // this.floodedList[name].isPause = !state
            }
          }
        }
      } else {
        for(let entity of this.floodedList[name].cesiumItem._entities._array) {
          if(entity._name === item.areaName) {
            entity._show = state
            // this.floodedList[name].isPause = !state
          }
        }
      }
    },
    pluseFloodAreaFunc(name){
      let item = this.floodedList[name]
      for(let entity of this.floodedList[name].cesiumItem._entities._array) {
        if(entity._name === item.areaName) {
          this.floodedList[name].isPause = !this.floodedList[name].isPause
        }
      }
    },
    setShowBuildingAreaFunc(){
      this.showBuildingAreaState.point[0] = this.upLat
      this.showBuildingAreaState.point[1] = this.bottomLat
      this.showBuildingAreaState.point[2] = this.leftLon
      this.showBuildingAreaState.point[3] = this.rightLon
      let lon = (Number(this.leftLon) + Number(this.rightLon)) / 2
      let lat = Number(this.bottomLat) - 0.01

      let cameraPosition = {
        lon: lon,
        lat: lat,
        height: 1200
      }
      this.adjustShowBuildingArea(this.showBuildingAreaState)
      this.cameraFlyToFunc('building', cameraPosition)
    },
    resetShowBuildingAreaFunc(){
      this.resetShowBuildingArea(this.showBuildingAreaState)
    },
    addSampleLoactionForShowBuildingFunc(){
      this.upLat = 25.04538076919183
      this.bottomLat = 25.04153912699482
      this.leftLon = 121.55796412314149
      this.rightLon = 121.56583135058975
    },
    cameraFlyToFunc(type, customLoaction){
      let position = ""
      let heading = null
      let pitch = null
      let roll = null
      if(type === 'origin') {
        position = this.originalPosition
      } else if (type === 'building') {
        position = customLoaction
      } else if (type === 'kml') {
        // 世界座標轉換為經緯度 https://reurl.cc/gQykq7
        let ellipsoid = this.cesiumViewer.scene.globe.ellipsoid
        let cartesian3 = customLoaction[0]
        let cartograhphic = ellipsoid.cartesianToCartographic(cartesian3)
        let lon = this.Cesium.Math.toDegrees(cartograhphic .longitude)
        let lat = this.Cesium.Math.toDegrees(cartograhphic.latitude)
        // let height = cartograhphic.height
        position = {
          lon: lon,
          lat: lat,
          height: 2000
        }
        heading = 0
        pitch = -90
        roll = 0
      } else {
        position = this.floodedList[type].cameraPosition
      }
      this.cameraFlyTo(this.cesiumViewer.scene, position, heading, pitch, roll)
    },
    addBuildingFunc(){
      let state = this.buildingState
      if(state === true) {
        if(this.showBuildingAreaState.isSetBuilding === null) {
          this.showBuildingAreaState.isSetBuilding = this.addBuilding(this.cesiumViewer)
          this.doRoadingFunc(7000)
        } else {
          this.hideBuilding(this.showBuildingAreaState.isSetBuilding, state)
        }
      } else {
        this.hideBuilding(this.showBuildingAreaState.isSetBuilding, state)
      }
    },
    turnBackIconFunc(weather){
      let icon = ""
      switch (weather) {
        case 'Cloudy':
          icon = 'mdi-weather-cloudy'
          break;
        case 'Rain':
          icon = 'mdi-weather-rainy'
          break;
        case 'Snow':
          icon = 'mdi-weather-snowy'
          break;
        case 'Fog':
          icon = 'mdi-weather-fog'
          break;
      }
      return icon
    },
    turnBackLayersIconFunc(layer){
      let icon = ""
      switch (layer) {
        case 'standardRoadMap':
          icon = 'mdi-earth'
          break;
        case 'somehowAlteredRoadMap':
          icon = 'mdi-earth-plus'
          break;
        case 'hybrid':
          icon = 'mdi-google-earth'
          break;
        case 'satelliteOnly':
          icon = 'mdi-earth-box'
          break;
        case 'terrain':
          icon = 'mdi-terrain'
          break;
      }
      return icon
    },
    doRoadingFunc(time, state){
      this.isLoading = true
      if (time !== null) {
        setTimeout(() => {
          this.isLoading = false  
        }, time)
      } else {
        this.isLoading = state
      }
    },
    closeImgDialog(){
      this.imgDailogIsOpen = false
      this.currentPositionInfo.floodUrl = ""
      this.currentPositionInfo.originalUrl = ""
    },
    closeSensorDialog(){
      this.sensorDailogIsOpen = false
      this.sensorData = []
    },
    show(){
      this.siteInfoDom = true
    },
    hide(){
      this.siteInfoDom = false
    },
    selectedFloodingDate(date){
      this.selectedFloodDate = date
    },
    changeFloodAreaFunc(floodAreaMeter) {
      this.pDistanceInMeters = floodAreaMeter
    }
  },
  computed: {
    turnCurrentUrl(){
      let obj = this.currentPositionInfo
      return obj
    }
  }, 
  watch: {
    weatherGroup(){
      this.removeWeather(this.cesiumViewer.scene)
      if(this.weatherGroup !== 'Cloudy') {
        this.addWeather(this.cesiumViewer.scene, weather[this.weatherGroup], this.weatherGroup)
      }
    },
    layerGroup(){
      this.doRoadingFunc(4000)
      this.changeLayersFunc(this.cesiumViewer, this.layerGroup)
    }
  }
}
</script>
<style scoped>
.mapBox {
  width: 100%;
  height: calc(100vh - 64px);
  display: inline-block;
  position: absolute;
  z-index: 1;
  left: 0;
  top: 0;
}
#cesiumContainer {
  width: 100%;
  height: 100%;
}
.control_plate {
  transition: 1s all;
  display: inline-block;
  position: absolute;
  top: 0px;
  z-index: 2;
  height: 100%;
  left: 0;
  overflow: hidden;
}
.control_plate_bg {
  background-color: rgba(255, 255, 255, 0.904);
  height: 100%;
  overflow-y: scroll;
}
.control_plate_bg::-webkit-scrollbar { 
  display: none;  /* Safari and Chrome */
}
.collapse {
  transition: 1s all;
  background-color: rgba(84,110,122,0.8);
  height: 100%;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}
.collapse:hover{
  background-color: rgba(84,110,122,0.95);
}
.arrow-style{
  transition: 0.5s all;
  font-size: 30px;
  font-weight: bolder;
  cursor: pointer;
}
.arrow-style:hover{
  transform: translateX(5%);
}
</style>
