<template>
    <v-app-bar
      app
      :color="topBar.color"
      :dark="topBar.dark"
      :elevation="topBar.elevation"
      :dense="topBar.dense"
      class="topBar"
    >
       <v-app-bar-nav-icon
        @click.stop="$emit('navIconClick')"
      ></v-app-bar-nav-icon>
        <v-img
        class="mx-2"
        src="@/assets/logo.svg"       
        max-width="50"
        contain
      ></v-img>
      <v-toolbar-title class="topBarTitle" v-if="topBar.title">{{topBar.title}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- <div class="px-4">
        <span>{{userName}}</span>
      </div> -->
      <!-- <v-btn
        @click.stop="$emit('navChangePage')"
        color='deep-orange darken-4'
        depressed
        rounded
      >
        <v-icon left>mdi-logout-variant</v-icon>
        登出
      </v-btn> -->
    </v-app-bar>
</template>

<script>
export default {
  name: 'TopAppBar',
  props: ['topBar'],
    data: () => ({
      userName: "",
  }),
  beforeMount(){
    this.userName = this.$store.state.userInfo.username
  },
  methods: {
  }
}
</script>