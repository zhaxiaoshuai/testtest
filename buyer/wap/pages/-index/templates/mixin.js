/**
 * Created by Andste on 2018/5/18.
 */
let wx
if (process.browser) wx = require('weixin-js-sdk')
/** mixin */
export default {
  props: {
    /** 数据 */
    data: {
      type: Object,
      default: () => ({})
    },
    /** 是否为编辑模式 */
    isEdit: {
      type: Boolean,
      default: false
    },

    /* 是否是小程序环境 */
    isMiniPrograme: {
      type: Boolean,
      default: false
    }
  },
  components: {
    'layout-item': {
      props: ['block', 'isEdit', 'blockHref', 'isMiniPrograme'],
      template: `<div class="layout-item">
                   <template v-if="isEdit || $parent.isEdit">
                     <div class="mask-floor" @click="$emit('handle-edit')">
                       <div class="mask-bg-floor">
                         <button type="button" class="mask-btn-floor">
                           <svg-icon icon-class="pen-leather"></svg-icon>编辑
                         </button>
                       </div>
                     </div>
                     <slot :block="block"></slot>
                     <template v-if="block.block_type === 'IMAGE'">
                       <img v-if="block.block_value" :src="block.block_value">
                       <div v-else-if="isEdit || $parent.isEdit" class="no-image"></div>
                     </template>
                   </template>
                   <template v-else >
                     <span  v-if="isMiniPrograme" @click="blockHref || $parent.blockHref(block)">
                       <slot :block="block"></slot>
                       <img v-if="block.block_type === 'IMAGE'" :src="block.block_value">
                     </span>
                     <a v-else :href="blockHref || $parent.blockHref(block)">
                       <slot :block="block"></slot>
                       <img v-if="block.block_type === 'IMAGE'" :src="block.block_value">
                     </a>
                   </template>
                 </div>`
    }
  },
  methods: {
    /** 获取区块链接 */
    blockHref(block) {
      /** 如果是小程序环境 */
      if (this.isMiniPrograme) {
        if (block.block_type === 'GOODS') {
          if(block.block_value) {
            wx.miniProgram.navigateTo({ url: `/pages/goods/goods?goods_id=${block.block_value.goods_id}` })
          }
          return
        }
        if (!block || !block.block_opt) return
        const { opt_type, opt_value } = block.block_opt
        switch (opt_type) {
          // 链接地址 小程序目前不支持处理外链
          case 'URL': return false
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
        if (block.block_type === 'GOODS') {
          if (!block.block_value) return '#'
          return `/goods/${block.block_value.goods_id}`
        }
        if (!block || !block.block_opt) return '#'
        const { opt_type, opt_value } = block.block_opt
        switch (opt_type) {
          // 链接地址
          case 'URL': return opt_value
          // 商品
          case 'GOODS': return `/goods/${opt_value}`
          // 关键字
          case 'KEYWORD': return `/goods?keyword=${opt_value}`
          // 店铺
          case 'SHOP': return `/shop/${opt_value}`
          // 分类
          case 'CATEGORY': return `/goods?category=${opt_value}`
          default: return '/'
        }
      }
    },
    /** 获取区块链接 */
    // blockHref(block) {
    //   if (block.block_type === 'GOODS') {
    //     if (!block.block_value) return '#'
    //     return `/goods/${block.block_value.goods_id}`
    //   }
    //   if (!block || !block.block_opt) return '#'
    //   const { opt_type, opt_value } = block.block_opt
    //   switch (opt_type) {
    //     // 链接地址
    //     case 'URL': return opt_value
    //     // 商品
    //     case 'GOODS': return `/goods/${opt_value}`
    //     // 关键字
    //     case 'KEYWORD': return `/goods?keyword=${opt_value}`
    //     // 店铺
    //     case 'SHOP': return `/shop/${opt_value}`
    //     // 分类
    //     case 'CATEGORY': return `/goods?category=${opt_value}`
    //     default: return '/'
    //   }
    // },
    /** 编辑区块 */
    handleEditBlock(blockIndex) {
      this.$emit('edit-block', JSON.parse(JSON.stringify(this.data)), blockIndex)
    }
  }
}
