import * as Cesium from '../../node_modules/cesium/Source/Cesium.js';
// import "cesium/widgets.css"
import OLCesium from 'ol-cesium';

export default {
  data: () => ({
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNTFkYWFlNi03NmJkLTQ4NTYtYTdmZC01ZWFiMmYyN2UwNzYiLCJpZCI6MTE0NzQ5LCJpYXQiOjE2NjgzOTQ2OTh9.CpaV1PVZonfT71zS8iIkv5lzU8mEmDspL4GVEKj8qy8',
    cesiumBaseSources: {
      standardRoadMap: new Cesium.UrlTemplateImageryProvider({
        url : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        credit : 'standardRoadMap',
      }),
      hybrid: new Cesium.UrlTemplateImageryProvider({
        url : 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        credit : 'hybrid',
      }),
      satelliteOnly: new Cesium.UrlTemplateImageryProvider({
        url : 'https://mt1.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}',
        credit : 'satelliteOnly',
      })
    },
    originalPosition: {
      lon: 121.556,
      lat: 25.035,
      height: 800
    }, 
  }),
  methods: {
    initCesium(targetId) {
      window['Cesium'] = Cesium
      Cesium.Ion.defaultAccessToken = this.token;
      const ol2Map = this.maps[targetId]
      const ol3d = new OLCesium({
        map: ol2Map,
        time() {
          return Cesium.JulianDate.now();
        },
      }); // ol2dMap is the ol.Map instance
      const scene = ol3d.getCesiumScene()

      // 加入地形
      this.addTerrain(scene)

      // 地上物定位
      scene.globe.depthTestAgainstTerrain = true

      // 視角移動
      this.cameraFlyTo(scene, this.originalPosition)

      // 回存ol-cesium資料
      let data = {
        scene: scene,
        ol3d: ol3d
      }
      return data
    },
    changeCesiumSource(ol3d, newSourceName){
      ol3d.getCesiumScene().imageryLayers._layers = ol3d.getCesiumScene().imageryLayers._layers.map(el=> {
        if(el._imageryProvider._credit === undefined) {
          el.name = null
          return el
        } else {
          el.name = el._imageryProvider._credit._html
          return el
        }
      })
      if(ol3d.getCesiumScene().imageryLayers._layers.length === 2) {
        ol3d.getCesiumScene().imageryLayers.addImageryProvider(this.cesiumBaseSources[newSourceName])
        ol3d.getCesiumScene().imageryLayers._layers[2].name = newSourceName
      }
      ol3d.getCesiumScene().imageryLayers._layers.forEach(el=> el.show = false )
      let has = ol3d.getCesiumScene().imageryLayers._layers.map(el=> el.name).indexOf(newSourceName)

      if(has !== -1) {
        ol3d.getCesiumScene().imageryLayers._layers[has].show = true
      } else {
        ol3d.getCesiumScene().imageryLayers.addImageryProvider(this.cesiumBaseSources[newSourceName])
      }
    },
    toggle3Dmap(ol3d, state){
      ol3d.setEnabled(state)
    },
    addBuilding(){
      const osmBuildingsTileset = Cesium.createOsmBuildings({
        style: new Cesium.Cesium3DTileStyle({
          color : {
            conditions : [
              ["${feature['addr:city']} === '臺北市'", "color('#13293D')"],
              ['true', 'color("white", 1.0)']
            ]
          },
          show: null,
        }),
      })
      // console.log(osmBuildingsTileset)
      let sceneBuilding = this.cesiumScene.primitives.add(osmBuildingsTileset)

      // const sceneBuilding = scene.primitives.add(osmBuildingsTileset)
      return sceneBuilding
    },
    adjustShowBuildingArea(sceneBuilding){
      if(sceneBuilding.isSetBuilding !== null) {
        sceneBuilding.isSetBuilding.style = new Cesium.Cesium3DTileStyle({
          color : {
            conditions : [
              ['true', 'color("red", 1.0)']
            ]
          },
          show: this.setShowBuildingConditionString(
            sceneBuilding.point[0],
            sceneBuilding.point[1],
            sceneBuilding.point[2],
            sceneBuilding.point[3],
          )
        })
      }
    },
    resetShowBuildingArea(sceneBuilding){
      if(sceneBuilding.isSetBuilding !== null) {
        sceneBuilding.isSetBuilding.style = new Cesium.Cesium3DTileStyle({
          color : {
            conditions : [
              ['true', 'color("white", 1.0)']
            ]
          },
        })
      }
    },
    setShowBuildingConditionString(up, bottom, left, right){
      let conditions = `\${feature['cesium#longitude']} > ${left} && \${feature['cesium#longitude']} < ${right} && \${feature['cesium#latitude']} < ${up} && \${feature['cesium#latitude']} > ${bottom}`
      return conditions
    },
    hideBuilding(building, state){
      building.show = state
    },
    addedFloodedPolygon(item) {
      // 淹水區域座標
      let floodedAreaPoint = item.areaPoint

      // 加入動態高度
      let height = 0
      let isActive = item.active
      if(isActive) {
        height = new Cesium.CallbackProperty(function () {
          if(isPluse) {
            if(item.height > item.heightest) {
              isPluse = false
            }
            item.height += 0.1
          } else {
            if(item.height < item.lowest) {
              isPluse = true
            }
            item.height -= 0.1
          }
          return item.height
        }, false)
      } else {
        height = item.height
      }
      // 加入形狀
      let isPluse = true
      let materialType = Cesium.Color.DEEPSKYBLUE.withAlpha(0.7)
      let entity = {
          name: item.areaName,
          polygon : {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(floodedAreaPoint),
            extrudedHeight: height, 
            material: materialType,
            closeTop: true,  // 頂部是否密合
            closeBottom: true,  // 底部是否密合
            outline: true,
            outlineColor: materialType,
          },
          label: {
            text: item.areaName,
            font : '14pt monospace',
            outlineWidth : 2,
            show: true
          }
      }
      this.cesiumViewer.entities.add(entity)
      return this.cesiumViewer.entities
    },
    addTerrain(scene){
      // 加入3D地形 Cesium的 DEM圖層
      const terrainProvider = new Cesium.createWorldTerrain()

      // 使用 NGINX的DEM切片數據
      // const terrainProvider = new Cesium.createWorldTerrain({
      //   url: 'http://192.168.1.243:8000/terrain/NxZ4xz2h',
      // })

      scene.terrainProvider = terrainProvider;
      return terrainProvider
    },
    addPoint(ol3d){
      // 點位座標
      let floodedAreaPoint = [
        121.5579520324756,25.04493581866319,
      ]
      // 加入點位
      let entity = {
        position: Cesium.Cartesian3.fromDegrees(floodedAreaPoint),
        billboard: {
          image: "@/assets/gis/speed_normal.png",
        },
      }
      console.log(entity)
      ol3d.getDataSourceDisplay().defaultDataSource.entities.add(entity)
    },
    addWeather(scene, weather, name){
      scene.postProcessStages.add(new Cesium.PostProcessStage({
        name: name,
        fragmentShader: weather,
      }))
    },
    removeWeather(scene){
      scene.postProcessStages.removeAll();
    },
    cameraFlyTo(scene, position){
      scene.camera.flyTo({
          destination : Cesium.Cartesian3.fromDegrees(position.lon, position.lat, position.height),
          orientation : {
          heading : Cesium.Math.toRadians(10),
          pitch : Cesium.Math.toRadians(-45),
        }
      });
    },
    setGetLonLatCallback() {

    },
    // ORIGINAL CESIUM FUNCTION ===================================================================
    initOriginCesium () {
      window['Cesium'] = Cesium
      Cesium.Ion.defaultAccessToken = this.token;
      const viewer = new Cesium.Viewer('cesiumContainer', {terrainProvider: Cesium.createWorldTerrain(),})
      
      // https://community.cesium.com/t/cant-run-scripts-in-infobox/11956/2
      viewer.infoBox.frame.removeAttribute("sandbox")
      viewer.infoBox.frame.src = "about:blank"
      viewer.scene.globe.depthTestAgainstTerrain = true


      // viewer.scene.primitives.add(Cesium.createOsmBuildings({
      //   style: new Cesium.Cesium3DTileStyle({
      //     color: {
      //       conditions: [
      //         ["${feature['building']} === 'school'", "color('#00FF00')"],
      //         [true, "color('#ffffff')"]
      //       ]
      //     }
      //   })
      // }))
      
      this.cameraFlyTo(viewer.scene, this.originalPosition)
      this.cesiumViewer = viewer
      this.cesiumScene = viewer.scene
    }
  }
}