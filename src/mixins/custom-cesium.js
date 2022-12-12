import * as Cesium from 'cesium';
import * as turf from '@turf/turf'


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
    initOriginCesium () {
      window['Cesium'] = Cesium
      Cesium.Ion.defaultAccessToken = this.token;
      let terrainModels = Cesium.createWorldTerrain();
      const viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: terrainModels,
      })
      // https://community.cesium.com/t/cant-run-scripts-in-infobox/11956/2
      viewer.infoBox.frame.removeAttribute("sandbox")
      viewer.infoBox.frame.src = "about:blank"
      viewer.scene.globe.depthTestAgainstTerrain = true

      this.hideTimer(viewer)
      this.cameraFlyTo(viewer.scene, this.originalPosition)
      
      this.cesiumViewer = viewer
      this.cesiumScene = viewer.scene
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
    async addedFloodedPolygon(item,name) {
      // 淹水區域座標
      let floodedAreaPoint = item.areaPoint
      let {highest, lowest}= await this.getHeighestLowest(floodedAreaPoint)
      // 加入動態高度
      let height = 0
      let isActive = item.active
      let isPause = true
      let currentThis = this
      if(isActive) {
        height = new Cesium.CallbackProperty(function () {
          if(currentThis.floodedList[name].isPause) {
            return item.height
          } else {
            if(isPause) {
              if(item.height > item.heightest) {
                isPause = false
              }
              item.height += 0.05
            } else {
              if(item.height < item.lowest) {
                isPause = true
              }
              item.height -= 0.05
            }
            currentThis.floodedList[name].height = item.height
            return item.height
          }
        }, false)
      } else {
        height = item.height
      }
      // 加入形狀
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
          },
          description: `
            <div style="padding: 10px; height:400px;">
              <h3 style="color:red">${item.areaName}<h3>
              <h3 style="color:skyblue">最高海平面高度 ${highest} cm<h3>
              <h3 style="color:skyblue">最低海平面高度 ${lowest} cm<h3>
              <img src="${item.src}" width="400" heigh="auto">
            </div>
          `
      }
      this.cesiumViewer.entities.add(entity)
      return this.cesiumViewer.entities
    },
    async getHeighestLowest(floodedAreaPoint){
      let firstPoint = [floodedAreaPoint[0],floodedAreaPoint[1]]
      let twoSeatTemp = []
      let realSourcePoint = []
      for(let num in floodedAreaPoint) {
        if(num % 2 === 0) {
          twoSeatTemp[0] = floodedAreaPoint[num]
        } else {
          twoSeatTemp[1] = floodedAreaPoint[num]
        }
        if(twoSeatTemp.length === 2) {
          realSourcePoint.push(twoSeatTemp)
          twoSeatTemp = []
        }
      }
      realSourcePoint.push(firstPoint)
      const turfPolygon = turf.polygon([realSourcePoint]);
      const turfExtent = turf.bbox(turfPolygon)
      const turfSamplePoints=turf.pointGrid(turfExtent,0.003,{
          units:'kilometers',
          mask: turfPolygon,
      })
      const cesiumSamplePoints = [];
      for (let i = 0; i < turfSamplePoints.features.length; i++) {
        const coord = turfSamplePoints.features[i].geometry.coordinates;
        cesiumSamplePoints.push(Cesium.Cartographic.fromDegrees(coord[0],coord[1]));
      }

      let highest = 0
      let lowest = 8888
      let promise = Cesium.sampleTerrainMostDetailed(this.cesiumViewer.terrainProvider,cesiumSamplePoints)
      await promise.then(function(data){
        data.forEach(point=>{
          if (point.height>highest) {
            highest = point.height.toFixed(2);
          }
          if (point.height<lowest) {
            lowest = point.height.toFixed(2);
          }
        })
      })
      return {
        highest, lowest
      }
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
    hideTimer(viewer) {
      viewer.animation.container.style.visibility = 'hidden'
      viewer.timeline.container.style.visibility = 'hidden'
      viewer.forceResize();
    },
  },
}