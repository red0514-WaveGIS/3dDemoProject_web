<template>
  <v-progress-linear
    indeterminate
    :color="dataColor"
    height="10"
  >
    <template>
      <small>Loading...</small>
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
    top: 10px;
    left: 0;
    border-radius: 3px;
    z-index: 2;
}
</style>