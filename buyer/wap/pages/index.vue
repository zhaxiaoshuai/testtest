<template>
  <div :class="isMiniPrograme?'mini-container':'container'">
    <index-search-bar :is-mini-programe="isMiniPrograme"/>
    <index-banner :is-mini-programe="isMiniPrograme" :data="banner"/>
    <index-menu :data="menus" :is-mini-programe="isMiniPrograme"/>
    <index-seckill :is-mini-programe="isMiniPrograme"/>
	 <div v-if="floorList" class="floor-container">
      <div v-for="(item, index) in floorList" :key="index" :class="'item-' + item.tpl_id" class="floor-item">
        <component
          :is="templates[item.tpl_id]"
          :data="item"
          :is-mini-programe="isMiniPrograme"
        ></component>
      </div>
    </div>
    <tab-bar :is-mini-programe="isMiniPrograme"/>
  </div>
</template>

<script>
  import Vue from 'vue'
  import * as IndexComponents from '@/pages/-index'
  import * as API_Home from '@/api/home'
  import templates, { templateArray } from './-index/templates'
  let wx
  if (process.browser) wx = require('weixin-js-sdk')
  export default {
    name: 'index',
    async asyncData() {
      const values = await Promise.all([
        API_Home.getFloorData('WAP'),
        API_Home.getSiteMenu('MOBILE'),  // Andste_TODO 2018/7/9: 这里为什么又是MOBILE
        API_Home.getFocusPictures('WAP')
      ])
      const floor = values[0]
      let page_data = floor.page_data ? global.JSON.parse(floor.page_data) : []
      page_data.forEach(item => {
        item.blockList.forEach(block => {
          if (block.block_opt.opt_value) {
            block.block_opt.opt_value = global.decodeURIComponent(block.block_opt.opt_value).replace(/(&amp;)/g, '&')
          }
        })
      })
      return {
        // floorList: floor.page_data ? global.JSON.parse(floor.page_data) : [],
        floorList: page_data,
        menus: values[1],
        banner: values[2]
      }
    },
    components: { ...IndexComponents },
    head() {
      return {
        title: `商城首页-${this.site.title}`
      }
    },
    data() {
      return {
        /** 首页卡片tab x坐标 */
        card_news_tab_x: 0,
        floorList: '',
        templates,
        templateArray,
        menus: [],
        banner: [],
	      /** 是否是小程序环境 */
	      isMiniPrograme: false
      }
    },
	  mounted() {
      // 记录进入app的url，后面微信sdk
      if (!window.entryUrl) {
        window.entryUrl = location.href.split('#')[0]
      }
      // 是否是在小程序中 web-view下的页面内
      if (!window.WeixinJSBridge || !WeixinJSBridge.invoke) {
        this.isMiniPrograme = window.__wxjs_environment === 'miniprogram'
        document.addEventListener('WeixinJSBridgeReady', this.ready, false)
      } else {
        this.ready()
      }
	  },
	  methods: {
      ready() {
        this.isMiniPrograme = window.__wxjs_environment === 'miniprogram'
      }
	  }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  @import "./-index/templates/floor-mobile";
  .mini-container{
    background-color: #F9F9F9;
    padding-bottom: 20px;
  }
  .container {
    background-color: #F9F9F9;
    padding-bottom: 20px;
    margin-bottom: 50px;
  }
  .floor-container {
    width: 100%;
    margin: 0 auto;
  }
  .floor-item:after {
    content: ' ';
    display: block;
    clear: both;
  }
</style>
