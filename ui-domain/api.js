/**
 * Created by Andste on 2018/7/2.
 * base    : 基础业务API
 * buyer   : 买家API
 * seller  : 商家中心API
 * admin   ：后台管理API
 */

const env = process.server
  ? process.env
  : (global.window ? window.__NUXT__.state.env : {})

module.exports = {
  // 开发环境
  dev: {
    base: 'https://javashop.natapp4.cc/base-api',
    buyer: 'https://javashop.natapp4.cc/buyer-api',
    seller: 'https://javashop.natapp4.cc/seller-api',
    admin: 'https://javashop.natapp4.cc/admin-api'
  },
  // 生产环境
  pro: {
    base  : env.API_BASE || 'http://api.base.javamall.com.cn',
    buyer : env.API_BUYER || 'http://api.buyer.javamall.com.cn',
    seller: env.API_SELLER || 'http://api.seller.javamall.com.cn',
    admin : env.API_ADMIN || 'http://api.admin.javamall.com.cn'
  }
}
