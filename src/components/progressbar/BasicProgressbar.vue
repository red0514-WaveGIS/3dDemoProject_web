<template>
  <v-progress-circular
    :size="dataSize"
    :width="dataWidth"
    :color="dataColor"
    indeterminate
  >
    <template>
      <h1 class="white--text">Loading...</h1>
    </template>
  </v-progress-circular>
</template>

<script>
export default {
  props: {
    dataSize: {
      default: 100,
      type: Number
    },
    dataWidth: {
      default: 12,
      type: Number
    },
    dataColor: {
      default: 'amber darken-3',
      type: String
    }
  },
}
</script>

<style scoped>
.v-progress-circular{
    position: absolute !important;
    left: 50%;
    top: 50%;
    margin-left: -50px;
    transform: translateY(-50%);
}
</style>