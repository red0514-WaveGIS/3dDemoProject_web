<template>
  <v-dialog
    v-model="imgDailogIsOpen"
    persistent
    transition="dialog-bottom-transition"
    max-width="800"
  >
    <v-card>
      <v-card-title class="cyan text-h5 white--text">
        <h3>淹水模擬圖</h3>
        <v-spacer></v-spacer>
        <v-btn fab x-small color="red" @click="closeFunc"><v-icon color="white">mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-card-text> 
        <div>
          <h5>經緯度：{{turnCurrentUrl.lonLat}}</h5>
          <v-row>
            <v-col cols="6">
              <div class="originalUrl">
                <h4>OriginalUrl:</h4>
                <v-img 
                  :src= turnCurrentUrl.originalUrl
                  width="400"
                ></v-img>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="floodUrl">
                <h4>FloodUrl:</h4>
                <v-img 
                  :src= turnCurrentUrl.floodUrl
                  width="400"
                ></v-img>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  props:['imgDailogIsOpen', 'turnCurrentUrl'],
  data: () => ({

  }),
  methods: {
    closeFunc(){
      this.$emit('triggerClose', this.imgDailogIsOpen)
    }
  }
}
</script>
