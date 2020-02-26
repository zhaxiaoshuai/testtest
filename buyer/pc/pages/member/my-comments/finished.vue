<template>
  <div>
    <empty-member v-if="finishedComments && !finishedComments.data.length">暂无评论</empty-member>
    <template v-else>
      <div class="order-table">
        <div class="order-table-thead">
          <span style="width: 630px">商品详情</span>
          <span style="width: 149px">状态</span>
          <span style="width: 211px">操作</span>
        </div>
        <ul class="order-table-tbody">
          <li v-for="item in finishedComments.data" :key="item.comment_id">
            <div class="order-tbody-item">
              <div class="order-item-sku">
                <div class="sku-item">
                  <div class="goods-image">
                    <a :href="'/goods/' + item.goods_images.goods_id" target="_blank">
                      <img :src="item.goods_images.original">
                    </a>
                  </div>
                  <div class="goods-name-box">
                    <a :href="'/goods/' + item.goods_images.goods_id" class="goods-name" target="_blank">
                      {{ item.goods_name }}
                    </a>
                  </div>
                </div>
              </div>
              <div class="order-item-price">
                <span v-if="item.additional_comment">
	                {{ item.additional_comment.audit_status | auditStatus }}
                </span>
	              <span v-else> {{ item.audit_status | auditStatus }}</span>
              </div>
              <div class="order-item-operate">
                <nuxt-link :to="`/member/my-comments/detail?comment_id=${item.comment_id}`">查看评价</nuxt-link>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="member-pagination" v-if="finishedComments">
        <el-pagination
          @current-change="handleCurrentPageChange"
          :current-page.sync="params.page_no"
          :page-size="params.page_size"
          layout="total, prev, pager, next"
          :total="finishedComments.data_total">
        </el-pagination>
      </div>
    </template>
  </div>
</template>

<script>
  import * as API_Members from '@/api/members'
  export default {
    name: "finished",
    data() {
      return {
        /** 已完成评价列表数据 */
        finishedComments: '',
        params: {
          page_no: 1,
          page_size: 10,
          comment_status: this.$route.query.comments_status
        }
      }
    },
    mounted() {
      this.GET_Comments()
    },
    filters: {
      // 状态过滤器
      auditStatus(status) {
        switch(status) {
          case 'WAIT_AUDIT': return '待审核';
          case 'PASS_AUDIT': return '审核通过';
          case 'REFUSE_AUDIT': return '审核拒绝'
        }
      }
    },
    methods: {
      /** 当前页数发生改变 */
      handleCurrentPageChange(page) {
        this.params.page_no = page;
        this.GET_Comments()
      },
      /** 获取已完成评价列表 */
      GET_Comments() {
        API_Members.getWaitAppendComments(this.params).then(response => {
          this.finishedComments = response;
          this.MixinScrollToTop()
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  @import "../../../assets/styles/color";
  .order-table {
    .order-table-thead {
      display: flex;
      align-items: center;
      height: 20px;
      padding: 8px 0;
      text-align: center;
      background:#F7F7F7;
      color: #999;
      margin-top:20px;
    }
    .order-table-tbody {
      li {
        margin-bottom: 20px;
      }
    }
    .order-tbody-title {
      background-color: #faece0;
      border: 1px solid #f9dbcc;
      padding: 9px 0;
      text-align: left;
      .pay-type {
        color: #53514f;
        font-weight: 600;
        margin-left: 20px;
      }
      .price {
        color: $color-main;
        font-size: 14px;
        font-weight: 600;
        em {
          font-size: 12px;
          font-weight: normal;
        }
      }
    }
    .order-tbody-ordersn {
      background-color: #fff;
      border: 1px solid #f9dbcc;
      padding: 5px 0;
      color: #999;
      height: 20px;
      font-size: 12px;
      font-weight: 400;
      span { margin-left: 20px }
    }
    .order-tbody-item {
      display: flex;
      align-items: center;
      position: relative;
      border: 1px solid #e7e7e7;
      border-top: none;
      .order-item-sku {
        width: 470px + 80px + 80px;
      }
      .sku-item {
        display: flex;
        align-items: center;
        margin-top: 6px;
      }
      .goods-image {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 86px;
        height: 86px;
        a {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 66px;
          height: 66px;
          text-align: center;
          border: 1px solid #ccc;
          background-color: #fff;
        }
        img {
          width: 62px;
          height: 62px;
        }
      }
      .goods-name-box { width: 450px - 86px }
      .goods-name {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        .assemble-color {
          color: $color-main;
          border: 1px solid $color-main;
          border-radius: 3px;
        }
      }
      .sku-price { color: $color-main }
      .sku-price, .sku-num {
        width: 80px;
        text-align: center;
      }
      .after-sale-btn {
        width: 60px;
        a { color: #666 }
        a:hover { color: $color-main }
      }
      .order-item-price, .order-item-status {
        width: 100px;
        text-align: center;
      }
      .order-item-price {
        width: 150px;
        strong { color: $color-main }
      }
      .order-item-status {
        width: 120px;
        &::after {
          content: ' ';
          position: absolute;
          top: 0;
          right: 100px;
          width: 1px;
          height: 100%;
          background-color: #f9dbcc;
        }
      }
      .order-item-operate {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 213px;
        a {
          display: block;
          width: 80px;
          height: 30px;
          line-height: 30px;
          border: 1px solid #ccc;
          text-align: center;
          background: #f9f9f9;
          color: #666;
          cursor: pointer;
          margin-bottom: 5px;
          &:first-child {
            margin-top: 5px;
          };
          &:hover {
            background: #eaeaea;
          }
        }
      }
    }
  }

</style>
