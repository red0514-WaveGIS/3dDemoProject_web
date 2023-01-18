import * as Cesium from 'cesium';
import * as turf from '@turf/turf'
import { setTimeout } from 'core-js';
// import buildingNum from '@/assets/nlscDada';


export default {
  data: () => ({
    // red' s cesium ION
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNTFkYWFlNi03NmJkLTQ4NTYtYTdmZC01ZWFiMmYyN2UwNzYiLCJpZCI6MTE0NzQ5LCJpYXQiOjE2NjgzOTQ2OTh9.CpaV1PVZonfT71zS8iIkv5lzU8mEmDspL4GVEKj8qy8',
    cesiumBaseSources: {
      standardRoadMap: new Cesium.UrlTemplateImageryProvider({
        url : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        credit : 'standardRoadMap',
        name: 'Google標準地圖',
      }),
      somehowAlteredRoadMap: new Cesium.UrlTemplateImageryProvider({
        url : 'https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}',
        credit : 'somehowAlteredRoadMap',
        name: 'Google標準地圖2',
      }),
      hybrid: new Cesium.UrlTemplateImageryProvider({
        url : 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        credit : 'hybrid',
        name: 'Google衛星地圖',
      }),
      satelliteOnly: new Cesium.UrlTemplateImageryProvider({
        url : 'https://mt1.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}',
        credit : 'satelliteOnly',
        name: 'Google純衛星地圖'
      }),
      terrain: new Cesium.UrlTemplateImageryProvider({
        url : 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
        credit : 'terrain',
        name: 'Google等高線地圖'
      })
    },
  }),
  methods: {
    async initOriginCesium () {
      // Browser 相關 initialize 設定
      document.oncontextmenu = new Function("return false")
      window.CESIUM_BASE_URL = './'
      window['Cesium'] = Cesium
      
      // Cesium 相關設定
      Cesium.Ion.defaultAccessToken = this.token // 帶入token
      
      //加入地形
      // let terrainModels = Cesium.createWorldTerrain({
      //   requestVertexNormals : true
      // })

      // 資料來源 2022年版全臺灣及部分離島20公尺網格數值地形模型DTM資料 https://data.gov.tw/dataset/160361
      // 內部 1485763 (金門), 1485755(全部)
      let terrainModels = new Cesium.CesiumTerrainProvider({
        url : Cesium.IonResource.fromAssetId(1485755),
        requestVertexNormals : true,
      })
      console.log(terrainModels)
      // Cesium' s Instance initialize 設定
      const viewer = new Cesium.Viewer('cesiumContainer', {
        imageryProvider: this.cesiumBaseSources["satelliteOnly"], // 加入地圖影像
        terrainProvider: terrainModels, // 加入地圖地形
        baseLayerPicker: false, // 隱藏 default 圖層選擇器
        navigationHelpButton: false, // 隱藏 default 導覽按鈕
        shouldAnimate: true,
      })

      // Viewer相關設定
      // https://community.cesium.com/t/cant-run-scripts-in-infobox/11956/2
      viewer.infoBox.frame.removeAttribute("sandbox")
      viewer.infoBox.frame.src = "about:blank"
      this.hideTimer(viewer)

      // Viewer.scene
      viewer.scene.globe.depthTestAgainstTerrain = true 
      viewer.scene.globe.baseColor = Cesium.Color.TEAL // 改變球體底部顏色
      // viewer.scene.skyAtmosphere.show = false // 隱藏大氣層
      // viewer.scene.faxx = true;
      // viewer.scene.postProcessStages.fxaa.enabled = true;
      // viewer.scene.debugShowFramesPerSecond = true;

      // 加載並完成所有 initialize 後， 附值給全域使用
      this.Cesium = Cesium
      this.cesiumViewer = viewer
      
      // Set initial position
      this.cameraFlyTo(viewer, this.originalPosition)
    },
    async addIonEntity(viewer){
      const positionProperty = new Cesium.SampledPositionProperty()
      const timeSpan = 30
      const totalSeconds = timeSpan * (this.importKmlList[2].positions.length - 1)
      const start = Cesium.JulianDate.fromIso8601("2022-12-04T21:10:00Z")
      const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate())
      
      viewer.clock.startTime = start.clone()
      viewer.clock.stopTime = stop.clone()
      viewer.clock.currentTime = start.clone()
      viewer.timeline.zoomTo(start, stop)
      viewer.clock.multiplier = 50
      viewer.clock.shouldAnimate = true

      this.importKmlList[2].positions.forEach((position,index)=>{
        const time = Cesium.JulianDate.addSeconds(start, index * timeSpan, new Cesium.JulianDate())
        positionProperty.addSample(time, position)
      })

      const airplaneUri = '../ionModule/CesiumMilkTruck.glb'
      const airplaneEntity = {
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({ 
            start: start, 
            stop: stop 
          })
        ]),
        position: positionProperty,
        model: { 
          uri: airplaneUri,
        },
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        path: new Cesium.PathGraphics({ width: 5 }),
      }
      viewer.entities.add(airplaneEntity)

      // viewer.trackedEntity = airplaneEntity
    },
    setDragDropFunc(viewer){
      viewer.extend(Cesium.viewerDragDropMixin, {
        clearOnDrop: true,
        flyToOnDrop: true,
        clampToGround : true
      })
      
      viewer.dataSources.dataSourceAdded.addEventListener(function() {
        if (viewer.dataSources.length > 1) {
          for (let i = 0; i < viewer.dataSources.length - 1; i++) {
            viewer.dataSources.remove(viewer.dataSources.get(i));
          }
        }
      })
    },
    async addKmlFileFunc(viewer,path,name){
      let options = {
        camera: viewer.scene.camera,
        canvas: viewer.scene.canvas,
        clampToGround: true, //開啟貼地
      }
      let index = null
      this.importKmlList.forEach((el,i)=>{
        if(el.name === name) {
          index = i
        }
      })
      await Cesium.KmlDataSource.load(path,options)
      .then(kmlData=>{
        let values = kmlData.entities.values
        for (let i = 0; i < values.length; i++) {
          if(Cesium.defined(values[i].polyline)) {
            values[i].polyline.clampToGround = true
            values[i].polyline.arcType = Cesium.ArcType.GEODESIC;
            this.importKmlList[index].positions = values[i].polyline.positions.getValue()
          }
        }
        viewer.dataSources.add(kmlData)
      })
    },
    setFeatureClickEvent(viewer){
      let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      let entity = viewer.entities.add({
        label : {
          show : false
        }
      })

      let ellipsoid = viewer.scene.globe.ellipsoid
      let longitudeString = null
      let latitudeString = null
      let height = null
      let cartesian = null
      let currentThis = this

      // Set right click event
      handler.setInputAction(function(movement) {
        cartesian = viewer.camera.pickEllipsoid(movement.position, ellipsoid)
        if (cartesian) {
          //將笛卡爾座標轉換為地理座標
          let cartographic = ellipsoid.cartesianToCartographic(cartesian)
          //將弧度轉為度的十進位制度表示
          longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4)
          latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4)
          //獲取相機高度
          height = Math.ceil(viewer.camera.positionCartographic.height)
          entity.position = cartesian
          // entity.label.show = true
          entity.label.text = '(' + longitudeString + ', ' + latitudeString + "," + height + ')'
          currentThis.currentPositionInfo.lonLat = entity.label.text._value

          currentThis.doRoadingFunc(null, true)

          currentThis.getFloodedImage(+latitudeString, +longitudeString)
          .then(res=>{
            let resData = res.data 
            currentThis.currentPositionInfo.originalUrl = resData.originalUrl
            currentThis.currentPositionInfo.floodUrl = resData.floodUrl
            setTimeout(()=>{
              currentThis.doRoadingFunc(null, false)
              currentThis.imgDailogIsOpen = true
            },5000)
          })
          .catch(err=>{
            console.log(err)
            currentThis.doRoadingFunc(null, false)
            currentThis.notFoundDailogIsOpen = true
          })
        }else {
          entity.label.show = false;
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK) // Right click

      // Set scroll wheel event
      handler.setInputAction(async function() {
        // console.log(wheelment)
        
      }, Cesium.ScreenSpaceEventType.WHEEL) // scroll wheel

      // Set left click event
      handler.setInputAction(function(movement) {
        if(currentThis.floodedSimulation) {
          let ray = viewer.camera.getPickRay(movement.position)
          let cartesian3 = viewer.scene.globe.pick(ray, viewer.scene)

          let cartographic = ellipsoid.cartesianToCartographic(cartesian3)
          let lon = Cesium.Math.toDegrees(cartographic.longitude)
          let lat = Cesium.Math.toDegrees(cartographic.latitude)
          let geoDetail = {
            lon: lon,
            lat: lat,
            height: cartographic.height,
          }
          
          // 獲取中心點向外擴4點
          let pointAroundSquare = currentThis.getBoundingBox(lat, lon, 100)    
          for(let el of currentThis.floodedBoxes) {
            viewer.entities.removeById(el.id)
          }
          let entity = currentThis.addedFloodedPolygonWithLatLon(viewer, pointAroundSquare, geoDetail)
          currentThis.floodedBoxes = []
          currentThis.floodedBoxes.push(entity.flooded)
          currentThis.floodedBoxes.push(entity.flag)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK) // left click
    },
    addBuilding(viewer){
      // 引入內政部國土測繪中心 三維建物服務 (以台北市為例)
      // await fetch(`/api/3dtiles/building/tiles3d/${buildingNum["臺北市"].num}/tileset.json`)
      // .then(response => response.json())
      // .then(data=>{
      //   console.log(data)
      // })
      // .catch(err=>{
      //   console.log(err)
      // })

      // let sceneBuilding

      // let sceneBuilding = viewer.scene.primitives.add(
      //   new Cesium.Cesium3DTileset({
      //     url: `/api/3dtiles/building/tiles3d/${buildingNum["臺北市"].num}/tileset.json`,
      //   })
      // )

      const osmBuildingsTileset = Cesium.createOsmBuildings({
        style: new Cesium.Cesium3DTileStyle({
          color : {
            conditions : [
              ["${feature['building']} === 'stadium'", "color('#FF007F')"],
              ["${feature['building']} === 'university'", "color('#F8FF75')"],
              ['true', 'color("white", 1.0)']
            ]
          },
          show: null,
        }),
      })
      let sceneBuilding = viewer.scene.primitives.add(osmBuildingsTileset)
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
    async addedFloodedPolygon(viewer,item,name) {
      // 淹水區域座標
      let floodedAreaPoint = item.areaPoint
      let {highest, lowest}= await this.getHeighestLowestWithTurf(floodedAreaPoint)
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
              currentThis.weatherGroup = "Rain"
              item.height += 0.05
            } else {
              if(item.height < item.lowest) {
                isPause = true
              }
              currentThis.weatherGroup = "Cloudy"
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
      viewer.entities.add(entity)
      return viewer.entities
    },
    addedFloodedPolygonWithLatLon(viewer, floodedAreaPoint, geoDetail){
      let heights = geoDetail.height
      let heightest = heights + 5
      let lowest = heights - 2
      let value = lowest
      let increase = false
      let lonlat = geoDetail.lon + geoDetail.lat
      let cartesian3 = Cesium.Cartesian3.fromDegrees(geoDetail.lon, geoDetail.lat)
      let currentThis = this
      let height = new Cesium.CallbackProperty(function () {
        if(increase) {
          value += 0.05
          if(value >= heightest) {
            // alert('達點位上升5m水位')
            increase = false
          }
        } else {
          value -= 0.05
          if(value <= lowest) {
            increase = true
          }
        }
        currentThis.targetFloodedHeight = value.toFixed(2)
        return value
      }, false)
      let areaName = `${geoDetail.lon.toFixed(2)}, ${geoDetail.lat.toFixed(2)}, ${geoDetail.height.toFixed(2)}`
      // 加入淹水區域
      let materialType = Cesium.Color.DEEPSKYBLUE.withAlpha(0.7)
      let entity = {
          id: lonlat,
          name: areaName,
          position: cartesian3,
          label: {
            text: areaName,
            font: '16px sans-serif', // 字體大小
            style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 字體樣式
            fillColor: new Cesium.Color.fromCssColorString("#D8637D"), // 字體填充色
            outlineWidth: 2,  // 字體外圍線寬度（同樣也有顏色可設置）
            outlineColor: new Cesium.Color.fromCssColorString("#000000"),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直位置
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            pixelOffset: new Cesium.Cartesian2(0, 30),  // 中心位置
            disableDepthTestDistance: Number.POSITIVE_INFINITY // 被遮擋是否可見（也就是將這個Entity在場景中至頂）
          },
          polygon : {
            id: lonlat,
            hierarchy: Cesium.Cartesian3.fromDegreesArray(floodedAreaPoint),
            extrudedHeight: height, 
            material: materialType,
            closeTop: true,
            closeBottom: true,
            outline: true,
            outlineColor: materialType,
          },
          description: `
            <div style="padding: 10px; height:400px;">
              <h3 style="color:red">經緯度：${areaName}<h3>
            </div>
          `
      }
      viewer.entities.add(entity)
      
      // 加入flag標示點擊位置
      let url = "/api/3dproject/ionModule/flag.glb"
      let ionEntity = {
        id: lonlat + 1,
        position: cartesian3,
        model: { 
          uri: url,
          scale : 5, // 旗幟高度5公尺
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直位置
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          pixelOffset: new Cesium.Cartesian2(0, 15),  // 中心位置
          disableDepthTestDistance: Number.POSITIVE_INFINITY // 被遮擋是否可見（也就是將這個Entity在場景中至頂）
        },
      }

      viewer.entities.add(ionEntity)
      return {
        flooded: entity,
        flag: ionEntity
      }
    },
    async getHeighestLowestWithTurf(floodedAreaPoint){
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

      // 獲取該區域所有點位(間距0.0003km)
      const turfPolygon = turf.polygon([realSourcePoint])
      const turfExtent = turf.bbox(turfPolygon)
      const turfSamplePoints=turf.pointGrid(turfExtent,0.003,{
          units:'kilometers',
          mask: turfPolygon,
      })
      const cesiumSamplePoints = []

      // 獲取每一個點位的高度
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
    addWeather(scene, weather, name){
      scene.postProcessStages.add(new Cesium.PostProcessStage({
        name: name,
        fragmentShader: weather,
      }))
    },
    removeWeather(scene){
      scene.postProcessStages.removeAll();
    },
    changeLayersFunc(viewer, layerName){
      let layers = viewer.imageryLayers
      let baseLayer = layers.get(0)
      layers.remove(baseLayer)
      layers.addImageryProvider(this.cesiumBaseSources[layerName])
    },
    cameraFlyTo(scene, position, headings, pitchs, rolls){
      let heading = headings === null || headings === undefined ? 0 : headings
      let pitch = pitchs === null || pitchs === undefined ? -45 : pitchs
      let roll = rolls === null || rolls === undefined ? 0 : rolls

      scene.camera.flyTo({
          destination : Cesium.Cartesian3.fromDegrees(position.lon, position.lat, position.height),
          orientation : {
          heading : Cesium.Math.toRadians(heading), // up down
          pitch : Cesium.Math.toRadians(pitch), // left right
          roll: Cesium.Math.toRadians(roll), // left right
        }
      })
    },
    hideTimer(viewer) {
      viewer.animation.container.style.visibility = 'hidden'
      viewer.timeline.container.style.visibility = 'hidden'
      viewer.forceResize()
    },
    async addPointFunc(viewer, item){
      let st_name = item.st_name
      let st_no = item.st_no
      let src = "/api/3dproject/icons/rain_normal.png"
      if(item.status !== "正常") {
        src = "/api/3dproject/icons/raw_alert1.png"
      }

      // 經緯度轉換
      let lon = item.lon
      let lat = item.lat
      let cartesian3 = Cesium.Cartesian3.fromDegrees(lon, lat)
      let height = 0
      height = await this.getTerrainHeigh(cartesian3, height)
      const billboard = {
        id: st_no, // id
        position: cartesian3, // 位置
        label: {
          text: st_name, // 站名
          font: '16px sans-serif', // 字體大小
          style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 字體樣式
          fillColor: new Cesium.Color.fromCssColorString("#FFFF00"), // 字體填充色
          outlineWidth: 2,  // 字體外圍線寬度（同樣也有顏色可設置）
          outlineColor: new Cesium.Color.fromCssColorString("#ffffff"),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直位置
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          pixelOffset: new Cesium.Cartesian2(0, 15),  // 中心位置
          disableDepthTestDistance: Number.POSITIVE_INFINITY // 被遮擋是否可見（也就是將這個Entity在場景中至頂）
        },
        billboard: {
          id: st_no,
          image: src,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY // 被遮擋是否可見（也就是將這個Entity在場景中至頂）
        },
        // items屬性資料
        description: `
          <table border="1" padding="0" align="center" bordercolor="#000000" width="100%" bgcolor="#FFFFFF">
            <tr>
              <td bgcolor="#BECBD3" align="center" width="100px">
                <font color="black">站名</font>
              </td>
              <td>
                <font color="black">${st_name}</font>
              </td>
            </tr>
            <tr>
              <td bgcolor="#BECBD3" align="center" width="100px">
              <font color="black">設備類型</font>
              </td>
              <td>
                <font color="black">${item.device_type}</font>
              </td>
            </tr>
            <tr>
              <td bgcolor="#BECBD3" align="center" width="100px">
                <font color="black">海平面高度</font>
              </td>
              <td>
                <font color="black">${height}</font>
              </td>
            </tr>
            <tr>
              <td bgcolor="#BECBD3" align="center" width="100px">
                <font color="black">經緯度</font>
              </td>
              <td>
                <font color="black">(${lon}, ${lat})</font>
              </td>
            </tr>
            <tr>
              <td bgcolor="#BECBD3" align="center" width="100px">
                <font color="black">時間</font>
              </td>
              <td>
                <font color="black">${item.datatime}</font>
              </td>
            </tr>
            <tr>
              <td bgcolor="#BECBD3" align="center" width="100px">
                <font color="black">電量</font>
              </td>
              <td>
                <font color="black">${item.batteryvol}</font>
              </td>
            </tr>
            <tr>
              <td bgcolor="#BECBD3" align="center" width="100px">
                <font color="black">即時水位</font>
              </td>
              <td>
                <font color="black">${item.water_inner}</font>
              </td>
            </tr>
            <tr>
              <td bgcolor="#BECBD3" align="center" width="100px">
                <font color="black">狀態</font>
              </td>
              <td>
                <font color="black">${item.status}</font>
              </td>
            </tr>
          </table>
        `
      }
      viewer.entities.add(billboard)
    },
    async getTerrainHeigh(cartesian3, height){
      let ellipsoid = this.cesiumViewer.scene.globe.ellipsoid
      let cesiumSamplePoints = []
      let cartographic = ellipsoid.cartesianToCartographic(cartesian3)

      cesiumSamplePoints.push(cartographic); // lon lat
      let promise = await Cesium.sampleTerrainMostDetailed(
        this.cesiumViewer.terrainProvider,
        cesiumSamplePoints
      )
      height = promise[0].height.toFixed(2)
      return height
    },
    getBoundingBox(pLatitude, pLongitude, pDistanceInMeters) {
      function getBoundingBoxs(pLatitude, pLongitude, pDistanceInMeters) {
        let latRadian = pLatitude.toRad()
        let degLatKm = 110.574235
        let degLongKm = 110.572833 * Math.cos(latRadian)
        let deltaLat = pDistanceInMeters / 1000.0 / degLatKm
        let deltaLong = pDistanceInMeters / 1000.0 / degLongKm


        let topLat = pLatitude + deltaLat
        let bottomLat = pLatitude - deltaLat
        let leftLng = pLongitude - deltaLong
        let rightLng = pLongitude + deltaLong

        // let northWestCoords = topLat + ',' + leftLng
        // let northEastCoords = topLat + ',' + rightLng
        // let southWestCoords = bottomLat + ',' + leftLng
        // let southEastCoords = bottomLat + ',' + rightLng

        // let boundingBox = [northWestCoords, northEastCoords, southWestCoords, southEastCoords]

        let boundingBox = [leftLng,topLat,leftLng,bottomLat,rightLng,bottomLat,rightLng,topLat]
        return boundingBox
      }

      if (typeof(Number.prototype.toRad) === "undefined") {
        Number.prototype.toRad = function() {
        return this * Math.PI / 180;
       }
      }
      return getBoundingBoxs(pLatitude,pLongitude,pDistanceInMeters)
    }
  },
}