/**
 * 搜索分词相关API
 */

import request from '@/utils/request'

/**
 * 获取自定义分词列表
 * @param params
 */
export function getSearchKeywordsList(params) {
  return request({
    url: 'admin/goodssearch/custom-words',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 添加自定义分词
 * @param params
 */
export function addSearchKeyword(params) {
  return request({
    url: 'admin/goodssearch/custom-words',
    method: 'post',
    loading: false,
    params
  })
}

/**
 * 删除自定义分词
 * @param id
 */
export function delSearchKeyword(id) {
  return request({
    url: `admin/goodssearch/custom-words/${id}`,
    method: 'delete',
    loading: false
  })
}

/**
 * 设置密钥
 * @param params
 */
export function setSecretKey(params) {
  return request({
    url: 'admin/goodssearch/custom-words/secret-key',
    method: 'put',
    loading: false,
    params
  })
}

/**
 * 获取密钥
 */
export function getSecretKey() {
  return request({
    url: 'admin/goodssearch/custom-words/secret-key',
    method: 'get',
    loading: false
  })
}

/**
 * 搜索关键词历史列表
 * @param params
 */
export function getSearchHistoryList(params) {
  return request({
    url: 'admin/goodssearch/keywords',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 获取提示词列表
 * @param params
 */
export function getTipsList(params) {
  return request({
    url: 'admin/goodssearch/goods-words',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 添加自定义提示词
 * @param params
 */
export function addCustomTips(params) {
  return request({
    url: 'admin/goodssearch/goods-words',
    method: 'post',
    loading: false,
    params
  })
}

/**
 * 删除自定义提示词
 * @param id
 */
export function delCustomTips(id) {
  return request({
    url: `/admin/goodssearch/goods-words/${id}`,
    method: 'delete',
    loading: false
  })
}

/**
 * 修改自定义提示词
 * @param id
 * @param params
 */
export function modifyCustomTips(id, params) {
  return request({
    url: `admin/goodssearch/goods-words/${id}/words`,
    method: 'put',
    loading: false,
    params
  })
}

/**
 * 修改自定义提示词排序
 * @param id
 * @param sort
 */
export function modifyCustomTipsSort(id, sort) {
  return request({
    url: `admin/goodssearch/goods-words/${id}/sort`,
    method: 'put',
    loading: false,
    params: { sort }
  })
}
