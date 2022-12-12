<template>
  <div>
    <div class="mapBox">
      <div id="cesiumContainer"></div>
      <!-- <div id="wrapMap">
        <div id="MarkerMap"></div>
        <div id="popup" class="ol-popup">
          <PopupInfo 
            :popupContent="popupCol" 
          ></PopupInfo>
        </div>
      </div> -->
      <div 
        class="d-flex control_plate"
        :style="positionStyle"
      >
        <div class="collapse d-flex align-center">
          <span 
            @click="collapseFunc()" 
            class="arrow-style pr-2 white--text"
          >{{isShowMapTools === true ? "＞":"＜"}}</span>
        </div>
        <div class="control_plate_bg mt-0 pt-0">
          <v-alert
            border="left"
            color="blue-grey darken-1"
            dark
          >
            Map Tools
          </v-alert>
          <div class="mx-4">
            <div class="cesium-style">
              <h3 class="yellow lighten-5">Cesium 效果</h3>
              <div class="mt-2">
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
                <div class="mt-2">
                  <v-switch
                    class="mt-0"
                    color="blue"
                    v-model="switch3"
                    :hide-details="true"
                    :label="'大巨蛋淹水區域'"
                    @change="showFloodedAreaFunc(switch3, 'big_egg')"
                  ></v-switch>
                  <div class="d-flex align-center my-2">
                    <span class="mx-2">海拔：{{(+(floodedList['big_egg'].height)).toFixed(2)}} m</span>
                    <v-btn x-small dark fab color="green" @click="pluseFloodAreaFunc('big_egg')">
                      <v-icon color="white">mdi-pause-circle-outline</v-icon>
                    </v-btn>
                    <v-btn class="ml-2" color="red" x-small dark fab @click="cameraFlyToFunc('big_egg')">
                      <v-icon color="white">mdi-airplane-takeoff</v-icon>
                    </v-btn>
                  </div>
                </div>
                <div class="mt-2">
                  <v-switch
                    class="mt-0"
                    color="blue"
                    v-model="switch4"
                    :hide-details="true"
                    :label="'中正紀念堂淹水區域'"
                    @change="showFloodedAreaFunc(switch4, 'memorial_hall')"
                  ></v-switch>
                  <div class="d-flex align-center my-2">
                    <span class="mx-2">海拔：{{(+(floodedList['memorial_hall'].height)).toFixed(2)}} m</span>
                    <v-btn x-small dark fab color="green" @click="pluseFloodAreaFunc('memorial_hall')">
                      <v-icon color="white">mdi-pause-circle-outline</v-icon>
                    </v-btn>
                    <v-btn class="ml-2" color="red" x-small dark fab  @click="cameraFlyToFunc('memorial_hall')">
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
                <div class="mb-4">
                  <v-btn
                    color="teal" 
                    @click="cameraFlyToFunc('origin')"
                  >
                    <span class="white--text">返回初始視角</span> 
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BasicProgressbarVue 
        v-if="isLoading"
        :dataSize="200"
        
      />
    </div>
  </div>
</template>
<script>
import customApi from "@/mixins/custom-api.js"
import customCesium from "@/mixins/custom-cesium.js"
import wgProj4 from "@/mixins/wg-proj4.js"
import weather from '@/assets/cesium-object/weather.js'
import floodedLists from '@/assets/cesium-object/floodedList.js'
import BasicProgressbarVue from "@/components/progressbar/BasicProgressbar.vue"

export default {
  name: "MarkerMap",
  components: {
    BasicProgressbarVue
  },
  mixins: [customApi, wgProj4, customCesium],
  data: () => ({
    originalPosition: {
      lon: 121.556,
      lat: 25.035,
      height: 800
    },
    map: {
      mapTargetId: "MarkerMap",
      lon: 121.556,
      lat: 25.035,
    },
    layerName: "DataPoint",
    styleRemark: "dataIcon",
    mapSource: "",
    popupCol: [],
    switchLayer: {
      count: 0,
      item: {
        name: "",
        type: "",
        value: 112
      }
    },
    dataLoading: false,
    interval: null,
    ol3dData: {
      ol3d: "",
      scene: "",
    },
    switch1: false,
    buildingState: false,
    switch3: false,
    switch4: false,
    testToggle: false,
    terrain: null,
    isShowMapTools: false,
    positionStyle: 'transform: translateX(89%); height: 50%; top:22%;',
    mapRadio: 'hybrid',
    viewSwitch: true,
    weatherGroup: 'Cloudy',
    weatherLists: ['Cloudy', 'Rain', 'Fog', 'Snow'],
    showBuildingAreaState: {
      isSetBuilding: null,
      point: [0,0,0,0]
    },
    upLat: 0,
    bottomLat: 0,
    leftLon: 0,
    rightLon: 0,
    cesiumViewer: null,
    cesiumScene: null,
    isLoading: true,
    floodedList: null,
    test: 0,
  }),
  beforeMount() {
    this.floodedList = floodedLists
  },
  mounted: async function() {
    await this.initOriginCesium()
    this.doRoadingFunc(5000)
    // if (!this.checkMapIsExist(this.map.mapTargetId)) this.wrapInitMap()
    // this.ol3dData = this.initCesium(this.map.mapTargetId)
    // this.setFullScreenControl(this.map.mapTargetId)
    // 開啟3D地圖
    // this.viewSwitchFunc(true)
    // this.addBuildingFunc(true)
  },
  methods: {
    viewSwitchFunc(state){
      this.toggle3Dmap(this.ol3dData.ol3d, state)
    },
    collapseFunc(){
      this.isShowMapTools = !this.isShowMapTools
      if(this.isShowMapTools) {
        this.positionStyle = ''
      } else {
        this.positionStyle = "transform: translateX(89%); height: 50%; top:22%;"
      }
    },
    showFloodedAreaFunc(state, name){
      let item = this.floodedList[name]
      if(state) {
        if(this.floodedList[name].cesiumItem === null) {
          this.floodedList[name].cesiumItem = this.addedFloodedPolygon(item, name)
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
    cameraFlyToFunc(type, buildingLocation){
      let position = ""
      if(type === 'origin') {
        position = this.originalPosition
      } else if (type === 'building') {
        position = buildingLocation
      } else {
        position = this.floodedList[type].cameraPosition
      }
      this.cameraFlyTo(this.cesiumScene, position)
    },
    addBuildingFunc(){
      let state = this.buildingState
      if(state === true) {
        if(this.showBuildingAreaState.isSetBuilding === null) {
          this.showBuildingAreaState.isSetBuilding = this.addBuilding()
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
    doRoadingFunc(time){
      this.isLoading = true
      setTimeout(() => {
        this.isLoading = false  
      }, time)
    }
  },
  watch: {
    mapRadio(){
      this.setBaseSourceByBaseSourceId(this.map.mapTargetId,this.mapRadio)
      this.changeCesiumSource(this.ol3dData.ol3d, this.mapRadio)
    },
    weatherGroup(){
      this.removeWeather(this.cesiumScene)
      if(this.weatherGroup !== 'Cloudy') {
        this.addWeather(this.cesiumScene, weather[this.weatherGroup], this.weatherGroup)
      }
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
  right: -10px;
}
.control_plate_bg {
  background-color: rgba(255, 255, 255, 0.904);
  height: 100%;
  overflow-y: scroll;
}
.collapse {
  transition: 1s all;
  background-color: rgba(84,110,122,0.8);
  height: 100%;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
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
.warningBox {
  display: inline-block;
  position: absolute;
  left: 20px;
  bottom: 20px;
  z-index: 2;
}
.dashBoardBox {
  display: inline-block;
  position: absolute;
  left: 50px;
  top: 10px;
  background-color: red;
  z-index: 2;
}
.warning td {
  white-space: nowrap;
}
.dashboardBtn {
  bottom: 10px;
  top: initial;
  left: 50%;
  margin-left: -55px;
}
#alertBox {
  z-index: 3;
}
#wrapMap,
#MarkerMap {
  width: 100%;
  height: 100%;
}
#wrapMap {
  position: relative;
}
.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 10px;
  transform: translateX(-50%);
}
.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 50%;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 50%;
  margin-left: -11px;
}
.draggableContainer {
  position: absolute;
  right: 10px;
  top: 10px;
}
.draggableContainerDashboard {
  position: absolute;
  left: 50px;
  top: 10px;
}
.draggableContainerDashboardCursor {
  position: absolute;
  left: 50px;
  top: 10px;
}
.draggableContainerWarning {
  position: absolute;
  left: 10px;
  bottom: 10px;
}
.floodLegendStyle{
  position: absolute;
  right: 0px;
  bottom: 70px;
}
</style>
