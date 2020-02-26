<template>
    <div>
      <empty-member v-if="comments && !comments.data.length">暂无评论</empty-member>
      <template v-else>
        <div class="order-table">
        <div class="order-table-thead">
          <span style="width: 660px">订单详情</span>
          <span style="width: 158px">收货人</span>
          <span style="width: 115px">金额</span>
          <span style="width: 120px">订单操作</span>
        </div>
        <ul class="order-table-tbody">
          <li v-for="(item, index) in comments.data" :key="index">
            <div class="order-tbody-ordersn">
              <span>下单时间：{{item.create_time | unixToDate}}</span>
              <span>订单编号：{{item.sn}}</span>
            </div>
            <div class="order-tbody-item">
              <div class="order-item-sku">
                <div class="sku-item" v-for="(sku, skuIndex) in item.sku_list" :key="skuIndex">
                  <div class="goods-image">
                    <a :href="'/goods/' + sku.goods_id" target="_blank">
                      <img :src="sku.goods_image" :alt="sku.name">
                    </a>
                  </div>
                  <div class="goods-name-box">
                    <a :href="'/goods/' + sku.goods_id" class="goods-name" target="_blank">
                      {{ sku.name }}
                    </a>
                  </div>
                  <div class="sku-num">x {{ sku.num }}</div>
                </div>
              </div>
              <div class="order-item-price">
                {{item.ship_name}}
              </div>
              <div class="order-item-status">
                {{item.order_amount | unitPrice('￥')}}
              </div>
              <div class="order-item-operate">
                <nuxt-link :to="'/member/comments?order_sn=' + item.sn">去评论</nuxt-link>
              </div>
            </div>
          </li>
        </ul>
      </div>
      </template>
      <div class="member-pagination" v-if="comments">
        <el-pagination
          @current-change="handleCurrentPageChange"
          :current-page.sync="params.page_no"
          :page-size="params.page_size"
          layout="total, prev, pager, next"
          :total="comments.data_total">
        </el-pagination>
      </div>
    </div>
</template>

<script>
  import * as API_Members from '@/api/members'
  import * as API_Order from '@/api/order'
  export default {
    name: "walt-comment",
    data () {
      return {
        params: {
          page_no: 1,
          page_size: 10
        },
        /** 初评列表数据 */
        comments: ''
      }
    },
    mounted() {
      this.GET_Comments()
    },
    methods:{
      /** 当前页数发生改变 */
      handleCurrentPageChange(page) {
        this.params.page_no = page;
        this.GET_Comments()
      },
      /** 获取待评价订单列表 */
      GET_Comments() {
        API_Order.getOrderList({...this.params, order_status: 'WAIT_COMMENT'}).then(response => {
          this.comments = response;
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
      background:#e7e7e7;
      color: #999;
      margin:20px 0 10px;
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
      background-color: #e7e7e7;
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
        width: 660px;
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
        text-align: center;
      }
      .order-item-price {
        width: 158px;
        &::before {
          content: ' ';
          position: absolute;
          top: 0;
          right: 110px + 100px + 150px;
          width: 1px;
          height: 100%;
          background-color: #e7e7e7;
        }
        &::after {
          content: ' ';
          position: absolute;
          top: 0;
          right: 110px + 100px;
          width: 1px;
          height: 100%;
          background-color: #e7e7e7;
        }
        strong { color: $color-main }
      }
      .order-item-status {
        width: 115px;
        &::after {
          content: ' ';
          position: absolute;
          top: 0;
          right: 100px;
          width: 1px;
          height: 100%;
          background-color: #e7e7e7;
        }
      }
      .order-item-operate {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 103px;
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
