<template>
  <div class="mapBox">
    <div id="cesiumContainer"></div>
  </div>
</template>
<script>
import cesiumPlugin from "@/mixins/ol-cesium.js"
export default {
  name: "cesiumMap",
  mixins: [cesiumPlugin],
  data() {
    return {};
  },
  mounted() {
    // this.initOriginCesium()
  },
};
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
</style>
