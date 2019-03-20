import request from '../request'

export function get_db_list(data) {
  return request({
    url: '/dataSource/page',
    method: 'post',
    opts: data
  })
}

export function get_db_single(id) {
  return request({
    url: '/dataSource/' + id,
    method: 'get'
  })
}

export function add_db(data) {
  return request({
    url: '/dataSource',
    method: 'post',
    opts: data
  })
}
export function modify_db(data) {
  return request({
    url: '/dataSource',
    method: 'put',
    opts: data
  })
}

export function delete_db(id) {
  return request({
    url: '/dataSource/' + id,
    method: 'delete'
  })
}

export function testLink_db(data) {
  return request({
    url: '/dataSource/testConn',
    method: 'post',
    opts: data
  })
}
