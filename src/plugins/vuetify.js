import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

// Translation provided by Vuetify (javascript)
import zhHant from 'vuetify/es5/locale/zh-Hant'

Vue.component('my-component', {
  methods: {
    changeLocale () {
      this.$vuetify.lang.current = 'zhHant'
    },
  },
})




export default new Vuetify({
  lang: {
    locales: { zhHant },
    current: 'zhHant',
  },
  theme: {
    themes: {
      light: {
        primary: '#0A95FF',
        secondary: '#FAD47F',
        accent: '#8c9eff',
        error: '#b71c1c',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
      },
      dark: {
        primary: colors.blue.lighten3,
      },
    },
  },
});
