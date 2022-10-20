import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'

import './assets/css/global.css'
import './assets/iconfont/iconfont.css'
import './assets/font/iconfont.css'

// 配置axios
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8080/api/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)

// const cors = require('cors')
// App.use(cors())
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
