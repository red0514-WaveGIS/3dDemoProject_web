<template>
  <table id="popup-table" >
    <tr>
      <th>Key</th>
      <th>Value</th>
    </tr>
    <tr v-for="item in tableItems" :key="item.name">
      <td>{{ item.name }}</td>
      <td>{{ item.value }}</td>
    </tr>
    <tr>
      <td colspan="2">
        <div class="d-flex justify-center my-2">
          <v-btn class="mx-2" dark small color="success" @click="$emit('showFloodSimulation')"><v-icon left>mdi-home-flood</v-icon>顯示淹水模擬圖</v-btn>
          <v-btn class="mx-2" dark small color="info" @click="$emit('showMapFloodSimulation')"><v-icon left>mdi-water-alert</v-icon>顯示3D淹水模擬</v-btn>
        </div>
      </td>
    </tr>
  </table>
</template>

<script>
  import popupItems from "@/mixins/popupItems.js"
  export default {
    mixins:[popupItems],
    props: ["items","itemType"],
    data: () => ({
      
    }),
    methods: {
      
    },
    computed: {
      tableItems(){
        let tableItems = []
        if(!Array.isArray(this.items)){
          this.popInfo[this.itemType].forEach(item=>{
            let name = item.name
            let value = this.items[item.col]
            tableItems.push({name: name, value: value})
          })
        } else {
          tableItems = []
        }
        return tableItems
      },
    },
    watch: {
      items(){
        console.log(this.items)
      }
    }
  }
</script>

<style scoped>
  #popup-table{
    border-collapse: collapse;
    border: 1px solid black;
    width: 100%;
  }
  th {
    background-color: #96D4D4;
  }
  th, td {
    border: 1px solid black;
    padding: 2px;
  }
</style>