<template>
  <div class="floor-layout tpl-28">
    <div class="layout-main">
      <no-ssr>
        <swiper :options="swiperOption">
          <swiper-slide v-for="(block, index) in data.blockList" :key="index">
            <layout-item
              :block="block"
              :isEdit="isEdit"
              :is-mini-programe="isMiniPrograme"
              :blockHref="isMiniPrograme ? blockHref : blockHref(block)"
              @handle-edit="handleEditBlock(index)"
            />
          </swiper-slide>
          <div class="swiper-pagination" slot="pagination"></div>
        </swiper>
      </no-ssr>
    </div>
  </div>
</template>

<script>
  import mixin from '../mixin'

  export default {
    name: 'tpl_28',
    mixins: [mixin],
    title: '轮播图模块',
    dataTpl: {
      tpl_id: 28,
      blockList: [
        { block_type: 'IMAGE', block_value: '', block_opt: '' },
        { block_type: 'IMAGE', block_value: '', block_opt: '' },
        { block_type: 'IMAGE', block_value: '', block_opt: '' }
      ]
    },
    data() {
      return {
        swiperOption: {
          pagination: {
            el: '.swiper-pagination',
            dynamicBullets: true
          }
        }
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .swiper-container, /deep/ .swiper-wrapper, .swiper-slide {
    height: 100%;
  }
</style>
