<template>
	<span v-if="isMiniPrograme" @click="toPage"><slot/></span>
	<a v-else :href="toPage" target="_blank"><slot/></a>
</template>

<script>
  export default {
    name: 'EnOperation',
    props: ['opt','is-mini-programe'],
    computed: {
      toPage() {
        const { type, value } = this.opt
        /** 如果是小程序环境 */
        if (this.isMiniPrograme) {
          switch (type) {
            // 链接地址 小程序不支持处理外链
            case 'URL': return
              break
            // 商品
            case 'GOODS': wx.miniProgram.navigateTo({ url: `/pages/goods/goods?goods_id=${opt_value}` })
              break
            // 关键字 跳转至商品搜索页面 keyword
            case 'KEYWORD':  wx.miniProgram.navigateTo({ url: `/pages/search/search?keyword=${opt_value}` })
              break
            // 店铺
            case 'SHOP': wx.miniProgram.navigateTo({ url: `/pages/shop/shop_id/shop_id?id=${opt_value}` })
              break
            // 分类
            case 'CATEGORY': wx.miniProgram.navigateTo({ url: `/pages/search/search?category=${opt_value}` })
              break
            default: wx.miniProgram.navigateTo({ url: '/pages/index/index' })
          }
        } else {
          switch (type) {
            // 链接地址
            case 'URL': return value
            // 商品
            case 'GOODS': return `/goods/${value}`
            // 关键字
            case 'KEYWORD': return `/goods?keyword=${value}`
            // 店铺
            case 'SHOP': return `/shop/${value}`
            // 分类
            case 'CATEGORY': return `/goods?category=${value}`

            default: return '/'
          }
        }
      }
    }
  }
</script>
