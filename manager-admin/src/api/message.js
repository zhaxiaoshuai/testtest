/**
 * 消息设置相关API
 * 消息模板
 * 站内消息
 */

import request from '@/utils/request'

/**
 * 获取消息模板列表
 * @param params
 */
export function getMessageTemplate(params) {
  return request({
    url: 'admin/systems/message-templates',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 编辑消息模板
 * @param id
 * @param params
 */
export function editMessageTemplate(id, params) {
  return request({
    url: `admin/systems/message-templates/${id}`,
    method: 'put',
    data: params
  })
}

/**
 * 获取站内消息列表
 * @param params
 */
export function getMessageList(params) {
  return request({
    url: 'admin/systems/messages',
    method: 'get',
    loading: false,
    params
  })
}

/**
 * 发布新的站内消息
 * @param params
 */
export function releaseMessage(params) {
  return request({
    url: 'admin/systems/messages',
    method: 'post',
    data: params
  })
}

/**
 * 获取微信服务消息列表
 * @param params
 */
export function getWechatMessageList(params) {
  return request({
    url: 'admin/systems/wechat-msg-tmp',
    method: 'get',
    params
  })
}

/**
 * 获取一个微信服务消息
 * @param id
 */
export function getWechatMessage(id) {
  return request({
    url: `admin/systems/wechat-msg-tmp/${id}`,
    method: 'get'
  })
}

/**
 * 修改微信服务消息模板
 * @param id
 * @param params
 */
export function modifyWechatMessage(id, params) {
  return request({
    url: `admin/systems/wechat-msg-tmp/${id}`,
    method: 'put',
    params
  })
}

/**
 * 删除微信服务消息
 * @param id
 */
export function delWechatMessage(id) {
  return request({
    url: `admin/systems/wechat-msg-tmp/${id}`,
    method: 'delete'
  })
}

/**
 * 同步微信服务消息
 * @constructor
 */
export function SynchronizeWechatMessage() {
  return request({
    url: 'admin/systems/wechat-msg-tmp/sync',
    method: 'post'
  })
}

/**
 * 查询微信服务消息是否已经同步
 */
export function getSynchronizeWechatMessage() {
  return request({
    url: 'admin/systems/wechat-msg-tmp/sync',
    method: 'get'
  })
}
