addExpress/**
 * 快递公司相关API
 */

import request from '@/utils/request'
import qs from 'qs'

/**
 * 获取物流公司列表
 * @param params
 */
export function getExpressList(params) {
  return request({
    url: 'admin/systems/logi-companies',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 添加物流公司
 * @param params
 */
export function addExpress(params) {
  let arr = params.formItems
  delete params.formItems
  return request({
    url: `admin/systems/logi-companies?${qs.stringify(params)}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: arr
  })
}

/**
 * 删除物流公司
 * @param id
 */
export function deleteExpress(id) {
  return request({
    url: 'admin/systems/logi-companies',
    method: 'delete'
  })
}

/**
 * 获取物流公司详情
 * @param id
 */
export function getExpressDetail(id) {
  return request({
    url: `admin/systems/logi-companies/${id}`,
    method: 'get'
  })
}

/**
 * 修改物流公司
 * @param id
 * @param params
 */
export function editExpress(id, params) {
  let arr = params.formItems
  delete params.formItems
  return request({
    url: `admin/systems/logi-companies/${id}?${qs.stringify(params)}`,
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    data: arr
  })
}
