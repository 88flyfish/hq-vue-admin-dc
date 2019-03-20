import request from './request'
// 获取文件列表
export function getFolderList(api, data, id) {
  return request({
    url: api + id,
    method: 'post',
    opts: data
  })
}
// 新增文件
export function addFolder(data, id) {
  return request({
    url: './api/fileSourceView/createDirectory/' + id,
    method: 'post',
    opts: data
  })
}
// 删除文件数据接口
export function removeFolder(data, id) {
  return request({
    url: './api/fileSourceView/remove/' + id,
    method: 'post',
    opts: data
  })
} // 批量删除文件数据接口
export function removeFolderBatch(data, id) {
  return request({
    url: './api/fileSourceView/batchRemove/' + id,
    method: 'post',
    opts: data
  })
} // 修改文件名字数据接口
export function modifyFolder(data, id) {
  return request({
    url: './api/fileSourceView/rename/' + id,
    method: 'post',
    opts: data
  })
} // 移动文件夹路径接口
export function moveFolder(data, id) {
  return request({
    url: './api/fileSourceView/moveFile/' + id,
    method: 'post',
    opts: data
  })
} // 批量移动文件夹路径接口
export function moveBatchFolder(data, id) {
  return request({
    url: './api/fileSourceView/batchMove/' + id,
    method: 'post',
    opts: data
  })
} // 获取文件夹树结构接口
export function getFolderTree(data, id) {
  return request({
    url: './api/fileSourceView/getFolderList/' + id,
    method: 'post',
    opts: data
  })
}
