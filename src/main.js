import Vue from 'vue'

import Cookies from 'js-cookie'
import 'babel-polyfill'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css
import '@/styles/common.css' // global css element-ui

import App from './App'
import router from './router'
import store from './store'
import * as filters from './filters'
import i18n from './lang' // Internationalization
import './icons' // icon
import './permission' // permission control
import './mock' // simulation data
import './assets/css/font-awesome.css'
import './utils/jquery-1.12.4.min.js'
Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

Vue.config.productionTip = false

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

router.beforeEach((from, to, next) => {
  // if (from.path === '/dataBaseManage') {
  //  store.getters.sidebar.opened = false
  // } else {
  //  // console.log(store)
  //  store.getters.sidebar.opened = true
  // }
  if (!Cookies.get('sidebarStatus')) {
    if (from.path === '/dataBaseManage') {
      store.getters.sidebar.opened = false
    } else {
      // console.log(store)
      store.getters.sidebar.opened = true
    }
  }
  next()
})

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
