/**
 * 快递相关API
 */

import request from '@/utils/request'

/**
 * 获取快递平台列表
 * @param params
 */
export function getExpressPlatformList(params) {
  return request({
    url: 'admin/systems/express-platforms',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 修改快递平台
 * @param bean
 * @param params
 */
export function editExpressPlatform(bean, params) {
  return request({
    url: `admin/systems/express-platforms/${bean}`,
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    data: params
  })
}

/**
 * 获取快递平台详细配置
 * @param bean
 */
export function getExpressPlatformDetail(bean) {
  return request({
    url: `admin/systems/express-platforms/${bean}`,
    method: 'get'
  })
}

/**
 * 开启快递平台
 * @param bean
 */
export function openExpressPlatformById(bean) {
  return request({
    url: `admin/systems/express-platforms/${bean}/open`,
    method: 'put'
  })
}

/**
 * 查询快递物流信息
 * @param params
 * @returns {Promise<any>}
 */
export function getLogisticsInfo(params) {
  return request({
    url: `admin/systems/express-platforms/express`,
    method: 'get',
    loading: false,
    params
  })
}
