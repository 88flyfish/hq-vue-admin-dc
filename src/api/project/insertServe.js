import request from './request'

// 数据源列表
export function get_dataSource_list() {
  return request({
    url: 'dms/allDatabaseList',
    method: 'get'
  })
}

// 执行数据库语句接口
export function execute_sql(data, id) {
  return request({
    url: 'sqloperating/executeSqlTest/' + id,
    method: 'post',
    opts: data
  })
}
