/**
 * 发票相关API
 */

import request from '@/utils/request'
import qs from 'qs'

/**
 * 获取发票历史
 * @param params
 * @returns {Promise<any>}
 */
export function getHistoryReceiptList(params) {
  return request({
    url: 'seller/members/receipts',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取历史发票订单详情
 * @param id
 */
export function getHistoryReceiptDetail(history_id) {
  return request({
    url: `seller/members/receipts/${history_id}`,
    method: 'get',
    loading: false
  })
}

/**
 * 保存发票设置
 * @param id
 */
export function saveInvoiceSettings(params) {
  return request({
    url: 'seller/shops/receipt',
    method: 'put',
    data: params,
    loading: true
  })
}

/**
 * 获取店铺信息
 * @param id
 */
export function queryInvoiceSettingsInfo(params) {
  return request({
    url: 'seller/shops',
    method: 'get',
    loading: true
  })
}

/**
 * 获取物流公司信息
 * @param id
 */
export function queryExpressList(params) {
  return request({
    url: 'seller/shops/logi-companies',
    method: 'get',
    loading: true
  })
}

/**
 * 商家开具发票-增值税普通发票和增值税专用发票
 * @param {params}
 */
export function submitExpressInfo(params) {
  return request({
    url: `seller/members/receipts/${params.history_id}/logi?${qs.stringify(params)}`,
    method: 'post',
    loading: true
  })
}

/**
 * 商家开具发票-电子普通发票
 * @param {params}
 */
export function submitExpressOrdinaryInfo(params) {
  return request({
    url: `seller/members/receipts/upload/files`,
    method: 'post',
    data: params,
    loading: true,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
