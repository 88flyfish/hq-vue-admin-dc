import request from './request'

// 数据源列表
export function get_dataSource_list() {
  return request({
    url: 'dms/allDatabaseList',
    method: 'get'
  })
}

// 数据源的表、文件 列表信息
export function get_table_list(id) {
  return request({
    url: 'dms/databaseList/' + id,
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

// 获取单表字段信息
export function get_tableField_list(data, parames) {
  return request({
    url: `table/${parames.currentTableName}/${parames.currentDatabaseName}/${
      parames.sourceId
    }`,
    method: 'post',
    opts: { data }
  })
}

// 获取单表字段信息(new)
export function get_tableField_listArr(id, data) {
  return request({
    url: `/sqloperating/sqlColumn/${id}`,
    method: 'post',
    opts: { data }
  })
}

// 验证是否重名
export function exist(name) {
  return request({
    url: 'dataset/name/exist?serviceName=' + name,
    method: 'get'
  })
}

// 添加服务
export function saveService(data) {
  return request({
    url: '/service',
    method: 'post',
    opts: { data }
  })
}

// 查询服务
export function getDataService(id) {
  return request({
    url: '/service/' + id,
    method: 'get'
  })
}

// 修改服务
export function editService(data) {
  return request({
    url: '/service',
    method: 'put',
    opts: { data }
  })
}
