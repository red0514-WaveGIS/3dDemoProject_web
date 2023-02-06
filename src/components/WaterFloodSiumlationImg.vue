<template>
  <v-card>
    <v-card-text> 
      <div>
        <v-chip
          class="my-2"
          color="cyan"
          text-color="white"
        >
          <v-icon left>
            mdi-earth
          </v-icon>
          {{turnCurrentUrl.lonLat===""? "(Lon, Lat)":turnCurrentUrl.lonLat}}
        </v-chip>
        <v-row>
          <v-col cols="6">
            <div class="originalUrl">
              <h4>Before</h4>
              <v-img 
                :src= turnCurrentUrl.originalUrl
                width="400"
              ></v-img>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="floodUrl">
              <h4>After</h4>
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
</template>

<script>
  export default {
    props:['turnCurrentUrl'],
    data: () => ({

    }),
    watch:{
      turnCurrentUrl(){
        console.log(this.turnCurrentUrl)
      }
    }
  }
</script>