<template>
  <v-dialog
    v-model="notFoundDailogIsOpen"
    persistent
    transition="dialog-bottom-transition"
    max-width="600"
  >
    <v-card>
      <v-card-title class="pink text-h5 white--text">
        <h3>DATA NOT FOUND</h3>
        <v-spacer></v-spacer>
        <v-btn fab x-small color="red" @click="closeFunc"><v-icon color="white">mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-img src="@/assets/data_not_found.png"></v-img>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  name: "NotFoundDialog",
  props:['notFoundDailogIsOpen'],
  data: () => ({

  }),
  methods: {
    closeFunc(){
      this.$emit('triggerClose', this.notFoundDailogIsOpen)
    }
  }
}
</script>
