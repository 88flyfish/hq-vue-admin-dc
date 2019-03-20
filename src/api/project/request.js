import { createAPI } from '../util'
// import config from '../config'
let env
if (process.env.NODE_ENV === 'development') {
  env = 'dev'
} else if (process.env.NODE_ENV === 'production') {
  env = 'prod'
}
export const baseUrl = {
  dev: 'http://192.168.1.139:9095/',
  pre: '',
  prod: 'http://192.168.1.241:9095/'
}[env]
export default createAPI(baseUrl)
