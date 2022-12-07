import county from "@/assets/county"
import allCities from "@/assets/allCities.js"

export default {
  data: () =>({
    pointList: {
      layerName: 'water',
      items: [
        { st_name: '水位計1', layerName: 'water', icon: 'waterVolume' , point: [121.55168468094935,25.067828675529395]},
        { st_name: '水位計2', layerName: 'water', icon: 'waterVolume' , point: [121.55902125074843,25.044457577838035]},
        { st_name: '水位計3', layerName: 'water', icon: 'waterVolume' , point: [121.55601373602603,25.049388808910535]},
        { st_name: '水位計4', layerName: 'water', icon: 'waterVolume' , point: [121.55601373602603,25.04257419772236]},
        { st_name: '水位計5', layerName: 'water', icon: 'waterVolume' , point: [121.54892467459747,25.03771799453045]},
        { st_name: '水位計6', layerName: 'water', icon: 'waterVolume' , point: [121.57200189489834,25.09359247819668]},
      ]
    }, 
  }),
  methods: {
    custumPointFunc(mapId, layerName) {
      if(layerName.indexOf('water') > -1) {
        for (let el of this.pointList.items) {
          let centerPointer = this.EPSG4326ToEPSG3857(el.point)
          this.setPointFeature(mapId, centerPointer, el.icon, el.layerName, el)
        }
      }
    },
    customPolygonFunc(mapId, layerName) {
      let tempS = this.initVectorSource()
      if(layerName.indexOf('cityArea') > -1) {
        let features = this.getFeaturesByKml(county)
        tempS = this.initVectorSource()
        features.forEach(feature=>{
          let cityName = feature.getProperties().description.substring(11,14)
          let line = allCities.map(x=>x.name).indexOf(cityName)
          feature.set("layerName", layerName)
          feature.set("city", allCities[line].name)
          feature.set("randomColor", allCities[line].randomColor)
          this.setCustomStyleFeature(feature, "cityCountryArea")
          tempS.addFeature(feature)
        })
        this.initVectorLayer(mapId,layerName,tempS)
        // 讓該圖層覆蓋過其他的圖層icon
        this.layers[mapId][layerName].setZIndex(-1)
        this.layers[mapId]["baseLayer"].setZIndex(-2)
      } else if (layerName.indexOf('colseRoad') > -1) {
        console.log(layerName)



        // for(let feature of this.getFeaturesByKml(roadInfo)){
        //   this.setCustomStyleFeature(feature, item.icon)
        //   features.push(feature)
        // }






      }
      // this.getFloodForecast_list(obj.level)
      // .then(res=>{
      //   let resData = res.data
      //   let tempS = this.initVectorSource()
      //   for(let el of resData) {
      //     let features = this.getFeaturesByKml(el.kml)
      //     features.forEach(feature=>{
      //       let roadcontrol = [ 
      //         { name:'名稱', value: '內容'},
      //         { name: "等級", value: feature.getProperties().name},
      //         { name: "圖層", value: layerName},
      //       ]
      //       this.popInfo[feature.getProperties().name + el.uid] = roadcontrol
      //       feature.set('styleRemark', 'floodForecast')
      //       feature.set('uid', feature.getProperties().name + el.uid)
      //       tempS.addFeature(feature)
      //     })
      //   }
      //   this.initVectorLayer(this.map.mapTargetId,layerName,tempS)
      // })
      // .catch(err=>{
      //   console.log(err)
      // })
      // .finally(()=>{
      //   this.$store.commit("setDataLoading", { status: false })
      //   this.floodLegendIsShow = true
      // })

      console.log(mapId)
      console.log(layerName)



      // let layer = this.getLayerByLayerName(mapId, item.type)
      // if(layer != undefined && features.length > 0) {
      //   layer.getSource().addFeatures(features)
      // }



    }
  }
}