import axios from 'axios'
import store from '@/store'
import { getToken } from '@/utils/auth'
const instance = axios.create()

// instance.interceptors.request.use(config => {
//   if (store.getters.token) {
//     // 让每个请求携带token
//     config.headers['Authorization'] = 'Bearer ' + getToken()
//   }
//   return config
// })

function createAPI(baseURL) {
  return function(conf) {
    conf = conf || {}
    return instance(
      Object.assign(
        {},
        {
          url: conf.url,
          baseURL: baseURL,
          method: conf.method
        },
        conf.opts
      )
    )
  }
}

function convertRESTAPI(url, opts) {
  if (!opts || !opts.path) return url

  const pathKeys = Object.keys(opts.path)

  pathKeys.forEach(key => {
    const r = new RegExp('(:' + key + '|{' + key + '})', 'g')
    url = url.replace(r, opts.path[key])
  })

  return url
}

export { createAPI, convertRESTAPI }
