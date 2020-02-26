/**
 * 发票相关API
 */

import request from '@/utils/request'

/**
 * 获取发票历史
 * @param params
 */
export function getHistoryReceiptList(params) {
  return request({
    url: 'admin/members/receipts',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取历史发票详情
 * @param history_id
 */
export function getHistoryReceiptDetail(history_id) {
  return request({
    url: `admin/members/receipts/${history_id}/`,
    method: 'get'
  })
}

/**
 * 获取增票资质信息列表
 * @param params
 */
export function getExamineReceiptList(params) {
  return request({
    url: 'admin/members/zpzz',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取增票信息详情
 * @param params
 */
export function getExamineReceiptDetails(id) {
  return request({
    url: `admin/members/zpzz/${id}`,
    method: 'get'
  })
}

/**
 * 审核会员增票资质申请
 * @param params
 */
export function applyExamineQualifications({ id, params }) {
  return request({
    url: `admin/members/zpzz/audit/${id}/${params.status}?remark=${params.remark}`,
    method: 'post'
  })
}
