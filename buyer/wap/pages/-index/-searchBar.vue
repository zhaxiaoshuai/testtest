<template>
  <div class="search">
    <div class="search-container">
      <div class="search-bg" :style="{ opacity }"></div>
      <div class="search-main">
        <div class="search-logo">{{ site.site_name }}</div>
        <div class="search-input" @click="handleSearch">
          <div class="inner-search-input">
            <van-icon name="search" color="#999"/>
            <span>搜索商品/店铺</span>
          </div>
        </div>
        <span @click="routerUrl()" class="search-icon"><van-icon name="contact" color="#fff"/></span>
      </div>
    </div>
    <search :show="showSearch" :is-mini-programe="isMiniPrograme" @close="showSearch = false"/>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  let wx
  if (process.browser) wx = require('weixin-js-sdk')
  export default {
    name: 'SearchBar',
	  props: ['is-mini-programe'],
    data() {
      return {
        opacity: 0,
        showSearch: false
      }
    },
    computed: {
      ...mapGetters(['site'])
    },
    mounted() {
      window.addEventListener('scroll', () => {
        const sy = window.scrollY
        if (sy >= 100) {
          this.opacity = 0.8
        } else {
          this.opacity = sy / 100
        }
      })
    },
	  methods: {
      routerUrl() {
        if (this.isMiniPrograme) {        
          wx.miniProgram.switchTab({ url: '/pages/ucenter/index/index' })
        } else {
          this.$router.push('/member')
        }
      },
		  // 搜索跳转
      handleSearch() {
        if (this.isMiniPrograme) {
          wx.miniProgram.navigateTo({ url: '/pages/search/search' })
        } else {
          this.showSearch = true
        }
      }
	  }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .search-container {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    padding-top: 15px;
    .search-bg {
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgb(201, 21, 35);
      transition: opacity .2s ease-in;
    }
    .search-main {
      display: flex;
	    align-items: center;
      width: 100%;
      height: 100%;
	    padding: 0 0 15px 0;
      > div, .search-icon {
        position: relative;
        height: 100%;
        justify-content: center;
        align-items: center;
      }
    }
  }
  .search-logo {
    width: 20%;
    font-size: 15px;
    color: #fff;
    font-weight: 400;
    overflow: hidden;
    word-wrap: break-word;
  }
  .search-input {
    width: 65%;
  }
  .inner-search-input {
    display: flex;
    align-items: center;
    width: 100%;
    height: 30px;
    background-color: #fff;
    border-radius: 15px;
    color: #999;
    /deep/ .van-icon {
      font-size: 14px;
      margin: 0 10px;
    }
  }
  .search-icon {
    width: 15%;
    text-align: center;
    font-size: 22px;
  }
</style>
