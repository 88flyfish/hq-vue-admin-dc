import request from './request'

/**
 * 分页列表
 * @param data
 */
export const getServiceList = data => {
  return request({
    url: '/service/page',
    method: 'post',
    opts: data
  })
}

/**
 * 根据id删除
 * @param id
 */
export const deleteById = id => {
  return request({
    url: `/service/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除
 * @param ids
 */
export const batchRemove = ids => {
  return request({
    url: `/service/batchRemove`,
    method: 'delete',
    opts: ids
  })
}

// 新增服务接口
export const addNewService = data => {
  return request({
    url: `/dataset/insertdataset`,
    method: 'post',
    opts: data
  })
}

/**
 * 修改服务接口
 * @param data
 */
export const modifyService = data => {
  return request({
    url: `/dataset/updatedataset`,
    method: 'post',
    opts: data
  })
}

/**
 * 获取单个服务信息
 */
export const getServiceById = id => {
  return request({
    url: `/dataset/selectdataset?id=${id}`,
    method: 'get'
  })
}
