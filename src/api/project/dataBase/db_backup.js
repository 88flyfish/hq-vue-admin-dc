import request from '../request'

export function get_db_backup_list(data) {
  return request({
    url: '/backup/page',
    method: 'post',
    opts: data
  })
}

export function save_db(data, id) {
  return request({
    url: '/backupandrestore/backupDatabaseExecute/' + id,
    method: 'post',
    opts: data
  })
}

export function restore_db(id) {
  return request({
    url: '/backupandrestore/restoreDB/' + id,
    method: 'post'
  })
}

export function zipFiles_db(id) {
  return request({
    url: '/backupandrestore/zipFile/' + id,
    method: 'post'
  })
}
export function deleteFile_db(data) {
  return request({
    url: '/backupandrestore/deleteBackupFile',
    method: 'post',
    opts: data
  })
}
