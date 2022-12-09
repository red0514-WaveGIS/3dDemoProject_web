<template>
    <v-app-bar
      app
      :color="topBar.color"
      :dark="topBar.dark"
      :elevation="topBar.elevation"
      :dense="topBar.dense"
      class="topBar"
    >
      <v-img
        class="mx-2"
        src="@/assets/logo.svg"       
        max-width="50"
        contain
      ></v-img>
      <v-toolbar-title class="topBarTitle" v-if="topBar.title">{{topBar.title}}</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
</template>

<script>
export default {
  name: 'TopAppBar',
  props: ['topBar'],
    data: () => ({
      userName: "",
  }),
  methods: {
  }
}
</script>