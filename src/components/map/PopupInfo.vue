<template>
  <v-card elevation="0">
    <v-data-table
      :headers="[
        { value: 'name', class: 'nowrapTable', cellClass: 'nowrapTable' },
        { value: 'value', class: 'nowrapTable', cellClass: 'nowrapTable' },
      ]"
      :items="popupContent"
      dense
      hide-default-header
      hide-default-footer
      @click:row="clickPopupContent"
      class="ol-popup-content"
    >

      <template v-slot:item.value="{ item }" >
        <div v-if="item.img === true" class="d-flex">
          <div class="imgContainer">
            <v-img
              :key="firstCacheKey" 
              :src="item.value + `?${firstCacheKey}`" 
              width="300" 
              height="180"
            ></v-img>
            <div class="fullscreenBtn" @click="fullscreenHandler()">
              <v-icon color="white">mdi-fullscreen</v-icon>
            </div>
          </div>
        </div>
        <td 
          v-else-if="item.value === '近期無資料'"
          title="搜尋更早期資料請至資料查詢頁面 (或點擊後進入)"
          @click="goToPage"
        >
          <span class="primary--text text-decoration-underline cursor">{{item.value}}</span>
        </td>
        <td v-else>{{item.value}}</td>
      </template>

      <template v-slot:header>
        <td colspan="2" class="text-center">{{ name }}</td>
      </template>
    </v-data-table>
  </v-card>
</template>
<script>
import wgOl from "@/mixins/wg-ol.js"
export default {
  mixins: [wgOl],
  props: ["popupContent", "name"],
  data: () =>({
    enable: false,
    imgDialog: false,
    currentImg: [],
    currentImgTitle: "",
    firstCacheKey: +new Date(),
    interval: ""
  }),
  created() {
    this.setReflash()
  },
  methods: {
    goToPage(){
      this.$router.push({ path: '/prep/CesiumMap' })
      this.$store.commit("setLinkTitle", { title: 'Cesium原始地圖' })
    },
    clickPopupContent(item) {
      //把點的資料傳回去給父組件
      if(item.img == true) {
        this.imgDialog = true
        this.currentImg = item.value
        this.currentImgTitle = item.name
      }
      this.$emit('triggerClickFn', item)
    },
    setReflash(){
      this.interval = setInterval(() => {
        this.firstCacheKey = +new Date()
      }, 30000)
    },
    fullscreenHandler(){
      let imgInfo = {
        key: this.popupContent[1].value,
        title: this.popupContent[2].value,
        url: this.popupContent[7].value
      }
      this.$emit('fullscreenHandler', imgInfo)
    }
  },
  destroyed() {
    clearInterval(this.interval);
  },
  watch: {
    table: function() {
      if(this.table&&typeof(this.table)=="string") {
        this.enable = true
      }else{
        this.enable = false
      }
    }
  },
}
</script>
<style scoped>
#popup-content {
  width: 100%;
  height: 100%;
}
.cursor {
  cursor: pointer;
}
.ol-popup-content {
  position: absolute;
  -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
  filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 300px;
  display: none;
  max-height: 300px;
  max-width: 430px;
  overflow-y: auto;
  min-height: 80px;
}
.ol-overlay-container .ol-popup-content{
  display: block;
}
.ol-popup-box:after, .ol-popup-box:before {
  bottom: 0;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
  left: 0;
  margin-left: -9px;
  margin-bottom: -9px;
}
.ol-popup-box:after {
  border-top-color: white;	
  border-width: 11px;	
}
.ol-popup-box:before {
  border-top-color: #cccccc;
  border-width: 12px;
}
</style>
