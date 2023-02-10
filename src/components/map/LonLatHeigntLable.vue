<template>
  <div class="container">
    <p class="mb-0 text-center">
      Longitude: {{ toFixedFunc.lon }}, Latitude: {{ toFixedFunc.lat }}, Height: {{ toFixedFunc.height }}
    </p>
  </div>
</template>

<script>
  export default {
    props: ["lonLatHeightData"],
    data: ()=> ({

    }),
    computed: {
      toFixedFunc(){
        let tempObj = {
          lon: 0,
          lat: 0,
          height: 0
        }
        tempObj.lon = this.lonLatHeightData.lon.toFixed(4) 
        tempObj.lat = this.lonLatHeightData.lat.toFixed(4) 
        tempObj.height = this.lonLatHeightData.height.toFixed(2) 
        return tempObj
      }
    }
  }
</script>

<style scoped>
  .container{
    position: absolute;
    bottom: 4px;
    right: 40px;
    width: 420px;
    background-color: rgb(106, 170, 170);
    border-radius: 40px;
    color: white;
    padding: 8px;
  }
</style>