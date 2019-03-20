import request from '../request'

export function db_monitor_status(id) {
  return request({
    url: 'monitor/queryDatabaseStatus/' + 'dc_dms' + '/' + id + '/' + 11,
    method: 'get'
  })
}

export function db_monitor_itemValue(id) {
  return request({
    url: 'monitor/monitorItemValue/' + 'dc_dms' + '/' + id,
    method: 'get'
  })
}
