import * as types from './mutation-types'
import * as API_Common from '@/api/common'
import * as API_Home from '@/api/home'
import * as API_Goods from '@/api/goods'
import uuidv1 from 'uuid/v1'
import Cookie from 'cookie'
import Storage from '@/utils/storage'


if (!Storage.getItem('uuid') && process.client) {
  Storage.setItem('uuid', uuidv1(), { expires: 30 })
}

/** state */
export const state = () => ({
  // 导航栏
  navList: [],
  // 分类
  categories: [],
  // 热搜关键词
  hotKeywords: [],
  // 站点信息
  site: '',
  // 环境变量
  env: ''
})

/** mutations */
export const mutations = {
  /**
   * 设置站点cookie
   * @param state
   * @param data
   */
  [types.SET_SITE_DATA](state, data) {
    state.site = data
    process.client && Storage.setItem('site', global.JSON.stringify(data))
  },
  /**
   * 设置分类数据
   * @param state
   * @param data
   */
  [types.SET_CATEGORY_DATA](state, data) {
    state.categories = data
  },
  /**
   * 设置导航栏数据
   * @param state
   * @param data
   */
  [types.SET_NAV_DATA](state, data) {
    state.navList = data
  },
  /**
   * 设置热搜关键词数据
   * @param state
   * @param data
   */
  [types.SET_HOT_KEYWORDS](state, data) {
    state.hotKeywords = data
  },
  /**
   * 设置环境变量
   * @param state
   * @param env
   */
  [types.SET_ENV_VARS](state, env) {
    state.env = env
  }
}

/** actions */
export const actions = {
  /**
   * nuxt服务初始化时调用
   * @param commit
   * @param req
   * @param res
   */
  async nuxtServerInit({ commit, dispatch }, { req, res }) {
    const { env: e } = process
    const __env__ = {
      API_MODEL: e.API_MODEL,
      API_BASE: e.API_BASE,
      API_BUYER: e.API_BUYER,
      API_SELLER: e.API_SELLER,
      API_ADMIN: e.API_ADMIN,
      DOMAIN_BUYER_PC: e.DOMAIN_BUYER_PC,
      DOMAIN_BUYER_WAP: e.DOMAIN_BUYER_WAP,
      DOMAIN_SELLER: e.DOMAIN_SELLER,
      DOMAIN_ADMIN: e.DOMAIN_ADMIN
    }
    await commit(types.SET_ENV_VARS, __env__)
    if (req.headers.cookie) {
      const cookies = Cookie.parse(req.headers.cookie) || {}
      let { user } = cookies
      try {
        user = global.JSON.parse(user)
      } catch (e) {
        user = ''
      }
      await commit('user/SET_USER_INFO', user)
    }
    // 获取公共数据
    await dispatch('getCommonDataAction')
  },
  /**
   * 获取公共数据
   * @param commit
   * @returns {Promise<void>}
   */
  async getCommonDataAction({ commit }) {
    // 站点信息
    const site = await API_Common.getSiteData()
    commit(types.SET_SITE_DATA, site)
  }
}

/** getters */
export const getters = {
  /**
   * 分类列表
   * @param state
   * @returns {*}
   */
  categories: state => state.categories,
  /**
   * 导航栏
   * @param state
   * @returns {*}
   */
  navList: state => state.navList,
  /**
   * 热搜关键词
   * @param state
   * @returns {*}
   */
  hotKeywords: state => state.hotKeywords,
  /**
   * 获取用户信息
   * @param state
   * @returns {*}
   */
  user: state => state.user.user,
  /**
   * 获取站点信息
   * @param state
   * @returns {getters.site|(function(*))|string}
   */
  site: state => state.site,
  /**
   * 获取环境变量
   * @param state
   * @returns {*}
   */
  env: state => state.env
}
