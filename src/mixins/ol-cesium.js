import * as Cesium from '../../node_modules/cesium/Source/Cesium.js';
// import "cesium/widgets.css"
import OLCesium from 'ol-cesium';
import floodedArea from '../assets/floodedArea'

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
    } 
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
        }
      }); // ol2dMap is the ol.Map instance
      const scene = ol3d.getCesiumScene()

      // 加入地形
      this.addTerrain(scene)

      // 地上物定位
      scene.globe.depthTestAgainstTerrain = true;
      
      // 視角移動
      this.cameraFlyTo(scene)

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
    addBuilding(scene){
      const sceneBuilding = scene.primitives.add(Cesium.createOsmBuildings({
        style: new Cesium.Cesium3DTileStyle({
          color: {
            conditions: [
              [true, "rgb(255,255,255)"]
            ]
          }
        })
      }))
      return sceneBuilding
    },
    hideBuilding(building, state){
      building.show = state
    },
    addPolygon (ol3d) {
      // 使用引入KML
      let coordinate = []
      this.getFeaturesByKml(floodedArea).forEach(feature=>{
        coordinate = feature.getGeometry().getCoordinates()[0].map(coordi=>{
          return this.EPSG3857ToEPSG4326([coordi[0], coordi[1]])
        })
      })
      let floodedAreaPoint = []
      for(let el of coordinate) {
        floodedAreaPoint.push(el[0])
        floodedAreaPoint.push(el[1])
      }
      
      // 加入形狀
      let entity = {
          name: 'red',
          polygon : {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(floodedAreaPoint),
            extrudedHeight: 1000,  // 拉伸高度(m)
            // material: new Cesium.CallbackProperty(function (){
            //   return Cesium.Color.DEEPSKYBLUE.withAlpha(0.7)
            // }, false),
            material: Cesium.Color.DEEPSKYBLUE.withAlpha(0.7),
            closeTop: true,  // 頂部是否密合
            closeBottom: true,  // 底部是否密合
            outline: true,
            outlineColor: Cesium.Color.DEEPSKYBLUE.withAlpha(0.7)
          },
          Label: {
            text: 'red',
            font : '14pt monospace',
            outlineWidth : 2,
            show: true
          }
      }
      ol3d.getDataSourceDisplay().defaultDataSource.entities.add(entity)
    },
    addedFloodedPolygon(ol3d, item) {
      // 淹水區域座標
      let floodedAreaPoint = item.areaPoint
      // 加入形狀
      let isPluse = true
      let entity = {
          name: item.areaName,
          polygon : {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(floodedAreaPoint),
            extrudedHeight: new Cesium.CallbackProperty(function () {
              if(isPluse) {
                if(item.height > 40) {
                  isPluse = false
                }
                item.height += 0.1
              } else {
                if(item.height < 15) {
                  isPluse = true
                }
                item.height -= 0.1
              }
              return item.height
            }, false), 
            material: Cesium.Color.DEEPSKYBLUE.withAlpha(0.7),
            closeTop: true,  // 頂部是否密合
            closeBottom: true,  // 底部是否密合
            outline: true,
            outlineColor: Cesium.Color.DEEPSKYBLUE.withAlpha(0.7),
          },
          label: {
            text: item.areaName,
            font : '14pt monospace',
            outlineWidth : 2,
            show: true
          }
      }
      ol3d.getDataSourceDisplay().defaultDataSource.entities.add(entity)
      return ol3d.getDataSourceDisplay().defaultDataSource.entities
    },
    addTerrain(scene){
      // 加入3D地形
      const terrainProvider = new Cesium.createWorldTerrain()
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
    cameraFlyTo(scene){
      scene.camera.flyTo({
          destination : Cesium.Cartesian3.fromDegrees(121.556, 25.035, 800),
          orientation : {
          heading : Cesium.Math.toRadians(10),
          pitch : Cesium.Math.toRadians(-45),
        }
      });
    },
    // initOriginCesium () {
    //   const viewer = new Cesium.Viewer('cesiumContainer', {
    //       terrainProvider: Cesium.createWorldTerrain({
    //         requestVertexNormals : true
    //       }),
    //       selectionIndicator: false,
    //       shadows: true,
    //       shouldAnimate: true,
    //     });
    //     viewer.scene.primitives.add(Cesium.createOsmBuildings())

    //     viewer.camera.flyTo({
    //       destination : Cesium.Cartesian3.fromDegrees(121.556, 25.035, 800),
    //       orientation : {
    //       heading : Cesium.Math.toRadians(0),
    //       pitch : Cesium.Math.toRadians(-45),
    //     }
    //   });
    // }
  }
}