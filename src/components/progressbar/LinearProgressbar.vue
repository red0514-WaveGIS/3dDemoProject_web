<template>
  <v-progress-linear
    indeterminate
    :color="dataColor"
    height="20"
  >
    <template>
      Loading...
    </template>
  </v-progress-linear>
</template>

<script>
export default {
  name: "LinearProgressbar",
  props: {
    dataColor: {
      default: 'yellow',
      type: String
    }
  },
}
</script>

<style scoped>
.v-progress-linear{
    position: absolute !important;
    bottom: 0;
    left: 0;
    border-radius: 3px;
}
</style>