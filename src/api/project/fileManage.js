import request from './request'

/**
 * 获取文件列表
 * @param data
 */
export const getFileList = (parentId) => {
  return request({
    url: `./fileManage/getByWhere?parentId=${parentId}`,
    method: 'get'
  })
}

/**
 * 保存实体信息
 * @param data
 */
export const saveFolder = data => {
  return request({
    url: './fileManage',
    method: 'post',
    opts: { data }
  })
}

/**
 * 修改实体信息
 * @param data
 */
export const modifyFile = data => {
  return request({
    url: './fileManage',
    method: 'put',
    opts: { data }
  })
}

/**
 * 删除
 * @param data
 */
export const deleteFolder = data => {
  return request({
    url: './fileManage/deleteFolder',
    method: 'delete',
    opts: { data }
  })
}

/**
 * 获取所有文件夹
 * @param isDir
 */
export const getAllFolder = () => {
  return request({
    url: `./fileManage/getByWhere?isDir=1`,
    method: 'get'
  })
}

/**
 * 移动文件夹
 * @param data
 */
export const moveFile = data => {
  return request({
    url: './fileManage/moveFile',
    method: 'post',
    opts: { data }
  })
}

/**
 * 复制文件夹
 * @param data
 */
export const copyFile = data => {
  return request({
    url: './fileManage/copyFile',
    method: 'post',
    opts: { data }
  })
}

