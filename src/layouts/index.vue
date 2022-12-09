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
    // 依據不同 privilege 生成不同 nav
    // let tempPrivileges = this.$store.state.userInfo
    // let temp = []
    // let system = []
    // let systemManager = []
    // for(let navItem of NavConfig.items) {
    //   for(let userItem of tempPrivileges.privileges) {
    //     if(userItem.name === navItem.text) {
    //       temp.push(navItem)
    //     }
    //     if(userItem.name === "使用者紀錄" || userItem.name === "感測器管理" || userItem.name === "使用者管理" || userItem.name === "權限管理") {
    //       let has = system.indexOf(userItem.name)
    //       if (has=== -1) {
    //         system.push(userItem.name)
    //       }
    //     }
    //   }
    //   if(navItem.text === "系統管理") {
    //     systemManager.push(navItem)
    //   }
    // }
    // let children = []
    // if(system.length > 0) {
    //   system.forEach(el=>{
    //     systemManager[0].children.forEach(item=>{
    //       if(el === item.text) {
    //         children.push(item)
    //       }
    //     })
    //   })
    //   systemManager[0].children = children
    // }

    // this.leftNavDrawer.items = temp
  },
  methods: {
    doLogout: function () {
      sessionStorage.clear()
      this.logout()
      delete this.$http.defaults.headers.common["Authorization"]
    },
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
  },
  computed: {
    linkTitle: function () {
       return this.$store.state.linkTitle
    }
  }
}
</script>


