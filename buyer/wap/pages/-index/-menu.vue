<template>
  <div id="index-menu" class="menu-container">
    <ul>
      <li v-for="(menu, index) in data" :key="index">
        <a @click="routerPage(menu.url)" class="menu-item">
          <img :src="menu.image" class="menu-img">
          <p class="menu-title">{{ menu.navigation_name }}</p>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
  let wx
  if (process.browser) wx = require('weixin-js-sdk')
  export default {
    name: 'index-menu',
    props: ['data', 'is-mini-programe'],
	  methods: {
      routerPage(path) {
        // 如果是小程序下的webview环境
        if(this.isMiniPrograme) {
          wx.miniProgram.navigateTo({ url: `/pages${path}${path}` })
        } else {
          this.$router.push({ path: path })
        }
      }
	  }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .menu-container {
    position: relative;
    // height: 160px;
    margin-top: -10px;
    margin-bottom: 10px;
    z-index: 99;
    padding: 5px 10px 10px 10px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    background-color: #fff;
    overflow: hidden;
    &:after {
      display: block;
      clear: both;
    }
  }
  .menu-item {
    width: 20%;
    height: 50%;
    float: left;
    display: block;
    box-sizing: border-box;
    color: #686868;
    text-align: center;
    padding-top: 10px;
  }
  .menu-img {
    width: 60%;
    height: 60%;
  }
  .menu-title {
    margin-top: 5px;
  }
</style>
