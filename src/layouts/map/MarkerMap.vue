<template>
  <div>
    <div class="mapBox">
      <div id="wrapMap">
        <div id="MarkerMap"></div>
        <div id="popup" class="ol-popup">
          <PopupInfo 
            :popupContent="popupCol" 
          ></PopupInfo>
        </div>
      </div>
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
            <div class="map-style">
              <h3>地圖類型選擇</h3>
              <v-switch
                color="green"
                v-model="viewSwitch"
                class="mt-2"
                :hide-details="true"
                :label="`${viewSwitch === false ? '2D':'3D'}地圖`"
                @change="viewSwitchFunc(viewSwitch)"
              ></v-switch>
              <v-radio-group
                v-model="mapRadio"
                column
              >
                <v-radio
                  label="Google標準地圖"
                  color="red"
                  value="standardRoadMap"
                ></v-radio>
                <v-radio
                  label="Google衛星地圖"
                  color="red darken-3"
                  value="hybrid"
                ></v-radio>
                <v-radio
                  label="Google純衛星地圖"
                  color="indigo"
                  value="satelliteOnly"
                ></v-radio>
              </v-radio-group>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="openlayers-style">
              <h3>Openlayers 點位功能</h3>
              <Treeview
                @openLayerName="openLayerName"
                @closeLayerName="closeLayerName"
              /> 
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="cesium-style">
              <h3>Cesium 效果功能</h3>
              <div class="mt-2">
                <div class="mt-2">
                  <v-switch
                    class="mt-0"
                    color="green"
                    v-model="buildingState"
                    :hide-details="true"
                    :label="`${buildingState === false ? '顯示':'隱藏'}3D建築`"
                    @change="addBuildingFunc(buildingState)"
                  ></v-switch>
                </div>
                <div class="mt-2 d-flex align-center">
                  <v-switch
                    class="mt-0"
                    color="blue"
                    v-model="switch3"
                    :hide-details="true"
                    :label="'大巨蛋淹水區域'"
                    @change="showFloodedAreaFunc(switch3, 'big_egg')"
                  ></v-switch>
                  <v-btn class="ml-4" color="red" x-small dark fab >
                    <v-icon color="white" @click="cameraFlyToFunc(floodedList['big_egg'].cameraPosition)">mdi-airplane-takeoff</v-icon>
                  </v-btn>
                </div>
                <div class="mt-2 d-flex">
                  <v-switch
                    class="mt-0"
                    color="blue"
                    v-model="switch4"
                    :hide-details="true"
                    :label="'中正紀念堂淹水區域'"
                    @change="showFloodedAreaFunc(switch4, 'memorial_hall')"
                  ></v-switch>
                  <v-btn class="ml-4" color="red" x-small dark fab >
                    <v-icon color="white" @click="cameraFlyToFunc(floodedList['memorial_hall'].cameraPosition)">mdi-airplane-takeoff</v-icon>
                  </v-btn>
                </div>
                <v-divider></v-divider>
                <h3 class="mt-2">Weather Simulation</h3>
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
                <v-btn
                  class="mt-4"
                  color="teal" 
                  @click="cameraFlyToFunc(originalPosition)"
                >
                  <span class="white--text">返回初始視角</span> 
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import PopupInfo from "@/components/map/PopupInfo.vue"
import customApi from "@/mixins/custom-api.js"
import wgOl from "@/mixins/wg-ol.js"
import cesiumPlugin from "@/mixins/ol-cesium.js"
import wgProj4 from "@/mixins/wg-proj4.js"
import custumMap from "@/mixins/custum-map.js"
import Treeview from '@/components/vuetify-tools/Treeview.vue'
import weather from '@/assets/cesium-object/weather.js'
import floodedList from '@/assets/cesium-object/floodedList.js'

export default {
  name: "MarkerMap",
  components: {
    PopupInfo, Treeview
  },
  mixins: [customApi, wgOl, wgProj4, cesiumPlugin, custumMap],
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
    buildings: null,
    terrain: null,
    floodedList: {
      big_egg: {
        areaName: '大巨蛋',
        height: 15,
        heightest: 40,
        lowest: 15,
        areaPoint: [
          121.5579520324756,25.04493581866319,
          121.55781944944574,25.0415166137583, 
          121.56433540179435, 25.041329645403497, 
          121.56667955480331, 25.045256324457515, 
          121.56479249163466, 25.04469541048406, 
          121.56238948850107, 25.04493585452839, 
          121.55891028902674, 25.04500261794834, 
        ],
        cesiumItem: null,
        active: true,
        cameraPosition: {
          lon: 121.55931651430299,
          lat: 25.031606648776876,
          height: 800
        }
      },
      memorial_hall: {
        areaName: '中正紀念堂',
        height: 15,
        heightest: 40,
        lowest: 15,
        areaPoint: [
          121.51775259572933, 25.038465374569633, 
          121.51669942171664, 25.034813667319295, 
          121.52251213212672, 25.03226291284592, 
          121.52405138645013, 25.035639439775327,
        ],
        cesiumItem: null,
        active: true,
        cameraPosition: {
          lon: 121.52093034329343,
          lat: 25.02601413412601,
          height: 800
        }
      }
    },
    isShowMapTools: true,
    positionStyle: '',
    mapRadio: 'hybrid',
    viewSwitch: true,
    weatherGroup: 'Cloudy',
    weatherLists: ['Cloudy', 'Rain', 'Fog', 'Snow']
  }),
  mounted: async function() {
    if (!this.checkMapIsExist(this.map.mapTargetId)) this.wrapInitMap()
    this.ol3dData = this.initCesium(this.map.mapTargetId)
    this.setFullScreenControl(this.map.mapTargetId)
    // 開啟3D地圖
    this.viewSwitchFunc(true)
    // this.addBuildingFunc(true)
  },
  methods: {
    viewSwitchFunc(state){
      this.toggle3Dmap(this.ol3dData.ol3d, state)
    },
    collapseFunc(){
      this.isShowMapTools = !this.isShowMapTools
      if(this.isShowMapTools) {
        this.positionStyle = ""
      } else {
        this.positionStyle = 'transform: translateX(84%); height: 50%; top:22%;'
      }
    },
    showFloodedAreaFunc(state, name){
      let item = floodedList[name]
      if(state) {
        if(floodedList[name].cesiumItem === null) {
          floodedList[name].cesiumItem = this.addedFloodedPolygon(this.ol3dData.ol3d, item)
        } else {
          for(let entity of floodedList[name].cesiumItem._entities._array) {
            if(entity._name === item.areaName) {
              entity._show = state
            }
          }
        }
      } else {
        for(let entity of floodedList[name].cesiumItem._entities._array) {
          if(entity._name === item.areaName) {
            entity._show = state
          }
        }
      }
    },
    // showStaticFloodedAreaFunc(state){
    //   let item = floodedList['memorial_hall']
    //   if(state) {
    //     if(floodedList['memorial_hall'].cesiumItem === null) {
    //       floodedList['memorial_hall'].cesiumItem = this.addedFloodedPolygon(this.ol3dData.ol3d, item)
    //     } else {
    //       floodedList['memorial_hall'].cesiumItem.show = state
    //     }
    //   } else {
    //     floodedList['memorial_hall'].cesiumItem.show = state
    //   }

    // },
    cameraFlyToFunc(postion){
      this.cameraFlyTo(this.ol3dData.scene, postion)
    },
    addBuildingFunc(state){
      if(state === true) {
        if(this.buildings === null) {
          this.buildings = this.addBuilding(this.ol3dData.scene)
        } else {
          this.hideBuilding(this.buildings, state)
        }
      } else {
        this.hideBuilding(this.buildings, state)
      }
    },
    wrapInitMap: function() {
      this.initMap(this.map.mapTargetId, this.EPSG4326ToEPSG3857([this.map.lon, this.map.lat]))
      this.setOverlayMap("MarkerMap", "pop", "popup")
      // this.setInfoPopup()
    },
    seletedMapSource: function(selected) {
      this.mapSource = selected
    },
    closeLayerName: function(selected) {
      selected.forEach(l => {
        this.setLayerStatus(false,l)
      })
    },
    openLayerName: function(selected) {
      selected.forEach(l => {
        this.setLayerStatus(true,l)
      })
    },
    // 圖層開關
    setLayerStatus: async function(status,obj) {
      let layerName = obj.layerName
      let type = obj.type
      // let styleRemark
      if(status) {
        if(this.getLayerByLayerName(this.map.mapTargetId,layerName) === undefined) {
          switch (type) {
            case 'point':
              this.custumPointFunc(this.map.mapTargetId, layerName)
              break;
            case 'polygon':
              this.customPolygonFunc(this.map.mapTargetId, layerName)
              break;
          }
        } else {
          this.setLayerVisibleByLayerName(this.map.mapTargetId,layerName,status)
        }
      } else {
        this.setLayerVisibleByLayerName(this.map.mapTargetId,layerName,status)
      }
    },
    setInfoPopup: function() {
      // let currentThis = this
      this.setFeatureClickEvent(this.map.mapTargetId, "pop", {
        hasFeature: function(elementId, feature) {
          console.log(elementId)
          console.log(feature)
          // 用 styleRemark 判斷
          // let pupupStyleRemark = feature.getProperties().styleRemark
          // let popInfoName
          // switch (pupupStyleRemark) {
          //   case 'waterVolume':
          //     popInfoName = feature.getProperties().featureRemark.st_no
          //     if(currentThis.popInfo[popInfoName]) {
          //       currentThis.popupCol = currentThis.popInfo[popInfoName]
          //     }
          //     break;
          //   case 'waterSpeed':
          //     popInfoName = feature.getProperties().featureRemark.uid
          //     if(currentThis.popInfo[popInfoName]) {
          //       currentThis.popupCol = currentThis.popInfo[popInfoName]
          //     }
          //     break;
          //   case 'soilSand':
          //     popInfoName = feature.getProperties().featureRemark.uid
          //     if(currentThis.popInfo[popInfoName]) {
          //       currentThis.popupCol = currentThis.popInfo[popInfoName]
          //     }
          //     break;
          //   case 'cctvPoint':
          //     popInfoName = feature.getProperties().featureRemark.cctv_no
          //     if(currentThis.popInfo[popInfoName]) {
          //       currentThis.popupCol = currentThis.popInfo[popInfoName]
          //     }
          //     break;
          //   case 'floodForecast':
          //     popInfoName = feature.getProperties().uid
          //     if(currentThis.popInfo[popInfoName]) {
          //       currentThis.popupCol = currentThis.popInfo[popInfoName]
          //     }
          //     break;
          //   case 'riverBed':
          //     popInfoName = feature.getProperties().featureRemark.st_no
          //     if(currentThis.popInfo[popInfoName]) {
          //       currentThis.popupCol = currentThis.popInfo[popInfoName]
          //     }
          //     break;
          //   case 'trackingParticle':
          //     popInfoName = feature.getProperties().featureRemark.st_no
          //     if(currentThis.popInfo[popInfoName]) {
          //       currentThis.popupCol = currentThis.popInfo[popInfoName]
          //     }
          //     break;
          // }
        },
      })
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
    }
  },
  watch: {
    mapRadio(){
      this.setBaseSourceByBaseSourceId(this.map.mapTargetId,this.mapRadio)
      this.changeCesiumSource(this.ol3dData.ol3d, this.mapRadio)
    },
    weatherGroup(){
      this.removeWeather(this.ol3dData)
      if(this.weatherGroup !== 'Cloudy') {
        this.addWeather(this.ol3dData, weather[this.weatherGroup], this.weatherGroup)
      }
    }
  }
}
</script>
<style>
.mapBox {
  width: 100%;
  height: calc(100vh - 64px);
  display: inline-block;
  position: absolute;
  z-index: 1;
  left: 0;
  top: 0;
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
