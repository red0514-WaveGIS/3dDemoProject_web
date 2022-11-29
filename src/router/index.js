import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store/index.js'
import { publicPath } from '@/../vue.config.js'

const files = require.context('@/layouts',true,/\.vue$/)
const modules = []

const excludeLayoutName = ['login','index','error','cctv']
files.keys()
.filter(key => !excludeLayoutName.includes(key.split('/').pop().replace(/\.\w+$/, '')))
.forEach(key => {
  const layoutPath = key.split('.')[1]
  const layoutName = key.split('/').pop().replace(/\.\w+$/, '')
  const layoutModule = files(key)
  if(layoutName == 'MarkerMap'){
    modules.push({
      path: '/',
      name: 'root',
      component: layoutModule.default || layoutModule
    })
    modules.push({
      path: '/index',
      name: 'home',
      component: layoutModule.default || layoutModule
    })
  }

  modules.push({
    path: layoutPath,
    name: layoutName,
    component: layoutModule.default || layoutModule
  })

})
Vue.use(Router)
const router = new Router({
  mode: 'history',
  base: publicPath,
  routes: modules,
})

export default router

router.beforeEach((to, from, next) => {
  // let routerPath = to.path
  // if(routerPath != "/redirect") {
    store
  //   if(!store.state.userAuthPage.includes(routerPath)) {
  //     return next('/redirect')
  //   }
  // }
  const query = Object.keys(to.query)
  for (let key of query) {
    const param = to.query[key]
    const illegal = [
      /<(no)?script[^>]*>.*?<\/(no)?script>/gim,
      /eval\((.*?)\)/gim,
      /expression\((.*?)\)/gim,
      /(javascript:|vbscript:|view-source:)+/gim,
      /<("[^"]*"|'[^']*'|[^'">])*>/gim,
      /(window\.location|window\.|\.location|document\.cookie|document\.|alert\(.*?\)|window\.open\()+/gim,
      /<+\s*\w*\s*(oncontrolselect|oncopy|oncut|ondataavailable|ondatasetchanged|ondatasetcomplete|ondblclick|ondeactivate|ondrag|ondragend|ondragenter|ondragleave|ondragover|ondragstart|ondrop|οnerrοr=|onerroupdate|onfilterchange|onfinish|onfocus|onfocusin|onfocusout|onhelp|onkeydown|onkeypress|onkeyup|onlayoutcomplete|onload|onlosecapture|onmousedown|onmouseenter|onmouseleave|onmousemove|onmousout|onmouseover|onmouseup|onmousewheel|onmove|onmoveend|onmovestart|onabort|onactivate|onafterprint|onafterupdate|onbefore|onbeforeactivate|onbeforecopy|onbeforecut|onbeforedeactivate|onbeforeeditocus|onbeforepaste|onbeforeprint|onbeforeunload|onbeforeupdate|onblur|onbounce|oncellchange|onchange|onclick|oncontextmenu|onpaste|onpropertychange|onreadystatechange|onreset|onresize|onresizend|onresizestart|onrowenter|onrowexit|onrowsdelete|onrowsinserted|onscroll|onselect|onselectionchange|onselectstart|onstart|onstop|onsubmit|onunload)+\s*=+/gim
    ]
    for (let reg of illegal) {
      if (reg.test(param.toLowerCase())) {
        console.log('非正確網址')
        next({ path: to.path, query: {} })
        return
      }
    }
  }
  next()
})