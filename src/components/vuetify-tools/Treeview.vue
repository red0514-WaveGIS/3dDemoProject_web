<template>
  <v-treeview
    selectable
    selected-color="red"
    :items="items"
    v-model="treeItemState"
    return-object
  ></v-treeview>
</template>

<script>
  export default {
    data: () => ({
      treeItemState: [],
      items: [
        {
          id: 1,
          name: '水位計',
          children: [
            { id: 2, name: '水位計1', layerName: 'water', type:'point', state: false},
          ],
        },
        // {
        //   id: 5,
        //   name: '封閉路段',
        //   children: [
        //     {
        //       id: 6,
        //       name: '路段1', 
        //       layerName: 'closeRoad', 
        //       type:'line',
        //       state: false
        //     },
        //   ],
        // },
        // {
        //   id: 15,
        //   name: '各縣市界線圖',
        //   layerName: 'cityArea', 
        //   type:'polygon', 
        //   state: false
        // },
      ],
    }),
    methods: {

    },
    watch: {
      treeItemState: function(newLayer, oldLayer) {
        for(let el of newLayer) {
          el.state = true
        }
        for(let el of oldLayer) {
          el.state = false
        }
        if(oldLayer.length > 0) {
          this.$emit('closeLayerName',oldLayer)
        }
        if(newLayer.length > 0) {
          this.$emit('openLayerName',newLayer)
        }
        
      },
    }
  }
</script>