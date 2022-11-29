import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    userInfo: {},
    userAuthPage: [],
    linkTitle: "3D地圖平台",
    dataLoading: false,
    selectedItemStatus: {},
  },
  mutations: {
    setUserInfo (state, { user }) {
      state.userInfo = user
    },
    setUserAuthPage (state, { pageArr }) {
      state.userAuthPage = pageArr
    },
    setLinkTitle( state, { title } ){
      state.linkTitle = title
    },
    setDataLoading( state, { status } ){
      state.dataLoading = status
    },
    setSelectedItemStatus( state, { item } ){
      state.selectedItemStatus = item
    },
  },
})

export default store