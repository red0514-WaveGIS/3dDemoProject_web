<template>
  <div id="wrapMap">
    <div id="BaseMap"></div>
  </div>
</template>

<script>
import wgOl from "@/mixins/wg-ol.js"
export default {
  mixins: [wgOl],
  props: ["ipDetailInfo","baseMapTempIsShow"],
  data: () => ({
    mapTargetId: "BaseMap",
    name: "",
  }),
  created: function() {
    if (!this.checkMapIsExist(this.mapTargetId)) {
      setTimeout(() => {
        this.wrapInitMap()
      }, 1000)
    }
  },
  methods: {
    wrapInitMap: function() {
      this.initMap(this.mapTargetId, this.EPSG4326ToEPSG3857([this.ipDetailInfo.longitude, this.ipDetailInfo.latitude]))
      this.setPointFeature(this.mapTargetId, this.EPSG4326ToEPSG3857([this.ipDetailInfo.longitude, this.ipDetailInfo.latitude]), 'ipPosition', 'defaultLayerName', this.ipDetailInfo)
    },
    onResize: function() {
      if (!this.checkMapIsExist(this.mapTargetId)) {
        this.wrapInitMap()
      }
      this.reloadMap(this.mapTargetId)
    },
  },
  watch: {
    baseMapTempIsShow: function() {
      if(this.baseMapTempIsShow) {
        this.clearAllFeatureByLayerName(this.mapTargetId, "defaultLayerName")
        let location = [this.ipDetailInfo.longitude, this.ipDetailInfo.latitude]
        this.setPointFeature(this.mapTargetId, this.EPSG4326ToEPSG3857([this.ipDetailInfo.longitude, this.ipDetailInfo.latitude]), 'ipPosition', 'defaultLayerName', this.ipDetailInfo) 
        this.setViewCenter(this.mapTargetId,this.EPSG4326ToEPSG3857(location))
        setTimeout(() => {
          this.setViewZoom(this.mapTargetId, 13)
        }, 300)
      }
    },
  },
}
</script>
<style scoped>
  #BaseMap{
    width: 100%;
    height: 400px;
  }
  #wrapMap {
    width: 100%;
    height: 400px;
  }
  @media screen and (max-width:550px){
    #BaseMap{
      height: 300px;
    }
    #wrapMap {
      height: 300px;
    }
  }
</style>
