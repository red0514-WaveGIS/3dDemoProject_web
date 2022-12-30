<template>
  <v-app id="mainContainer">
    <!-- <LeftNavDrawerTree
      :leftNavDrawer="leftNavDrawer"
      @navChildClick="goToPage"
    ></LeftNavDrawerTree> -->
    <TopAppBar
      :topBar="topBar"
    ></TopAppBar>
    <v-main class="mainBg">
      <v-container fluid>
        <v-fade-transition mode="out-in">
          <router-view />
        </v-fade-transition>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import NavConfig from '@/config/nav.config.json'
import TopAppBar from '@/components/app-bar/TopAppBar.vue'
export default {
  name: 'index',
  components: {
    TopAppBar,
  },
  data: () => ({
    leftNavDrawer: {
      model: false,
      width: 280,
      items: NavConfig.items,
      home: NavConfig.home,
      showHome: false,
      color: 'blue-grey darken-3',
      dark: true
    },
    topBar: {
      color: 'blue-grey darken-3',
      elevation: 0,
      dense: false,
      title: NavConfig.home.text,
      dark: true
    },
    privileges: [],
  }),
  mounted: function () {
    // 鎖右鍵
    document.oncontextmenu = new Function("return false")
  },
  methods: {
    goToPage(item){
      if(item.blank){
        window.open(item.href, '_blank');
      }else{        
        if(item.href != this.$route.path) {
          this.leftNavDrawer.model = false
          this.$router.push({ path: item.href })
          this.$store.commit("setLinkTitle", { title: item.text })
        }
      }
    },
  }
}
</script>


