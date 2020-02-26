<template>
  <div id="my-receipt">
    <div class="member-nav">
      <ul class="member-nav-list">
        <li class="active">
          <a href="./my-receipt">我的发票</a>
        </li>
      </ul>
    </div>
	  <empty-member v-if="receiptData && !receiptData.data.length">暂无发票信息</empty-member>
    <template v-else>
      <div class="receipt-table">
        <div class="receipt-table-thead">
          <span style="width:630px">订单详情</span>
          <span style="width: 148px">发票类型</span>
          <span style="width: 108px">状态</span>
          <span style="width: 102px">操作</span>
        </div>
        <ul class="receipt-table-tbody">
          <template>
            <li v-for="receipt in receiptData.data" :key="receipt.order_sn">
              <div class="receipt-tbody-ordersn">
                <span>{{receipt.add_time | unixToDate }}</span>
                <span>订单号：{{receipt.order_sn }}</span>
              </div>
              <div class="receipt-tbody-item">
                <div class="receipt-item-sku">
                  <div class="sku-item" v-for="sku in (receipt.goods_json ? JSON.parse(receipt.goods_json): [])" :key="sku.goods_id">
                    <div class="goods-image">
                      <a :href="'/goods/' + sku.goods_id" target="_blank">
                        <img :src="sku.goods_image" :alt="sku.name">
                      </a>
                    </div>
                    <a :href="'/goods/' + sku.goods_id" target="_blank">
                      {{sku.name}}
                    </a>
                    <div class="sku-num">x{{sku.num}}</div>
                  </div>
                </div>
                <div class="receipt-item-type">
                  <span v-if="receipt.receipt_type === 'ELECTRO'">电子普通发票</span>
                  <span v-if="receipt.receipt_type === 'VATORDINARY'">增值税普通发票</span>
                  <span v-if="receipt.receipt_type === 'VATOSPECIAL'">增值税专用发票</span>
                </div>
                <div class="receipt-item-status">
                  <span v-if="receipt.status === 0">未开</span>
                  <span v-if="receipt.status === 1">已开</span>
                </div>
                <div class="receipt-item-operation">
                  <nuxt-link :to="'./my-receipt/detail?history_id=' + receipt.history_id">发票详情</nuxt-link>
                </div>
              </div>
            </li>
          </template>
        </ul>
      </div>
      <div class="member-pagination">
        <el-pagination
          @current-change="handlePageCurrentChange"
          :current-page.sync="params.page_no"
          :page-size="params.page_size"
          :total="receiptData.data_total"
          layout="total, prev, pager, next">
        </el-pagination>
      </div>
    </template>
  </div>
</template>
<script>
  import * as API_Members from '@/api/members'
  export default {
    name: 'my-receipt-index',
    data() {
      return {
        params: {
          page_no: 1,
          page_size: 5,
        },
        /** 发票信息 */
        receiptData: '',
      }
    },
    mounted() {
      this.GET_ReceiptHistoryList()
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size;
        this.GET_ReceiptHistoryList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page;
        this.GET_ReceiptHistoryList()
      },
      /** 获取发票历史 */
      GET_ReceiptHistoryList() {
        API_Members.queryReceiptInfoList(this.params).then(response => {
          this.receiptData = response
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  @import "../../../assets/styles/color";
  .receipt-table {
    .receipt-table-thead {
      display: flex;
      align-items: center;
      height: 20px;
      padding: 8px 0;
      text-align: center;
      background: #f7f7f7;
      color:#666;
      margin:10px 0;
    }
    .receipt-table-tbody {
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
    .receipt-tbody-ordersn {
      background: #f7f7f7;
      color:#666;
      border: 1px solid #e7e7e7;
      padding: 5px 0;
      color: #999;
      height: 20px;
      font-size: 12px;
      font-weight: 400;
      span { margin-left: 20px }
    }
    .receipt-tbody-item {
      display: flex;
      align-items: center;
      position: relative;
      border: 1px solid #e7e7e7;
      border-top: none;
      .receipt-item-sku {
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
      .receipt-item-type, .receipt-item-status {
        width: 100px;
        text-align: center;
      }
      .receipt-item-type {
        width: 148px;
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
      .receipt-item-status {
        width: 108px;
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
      .receipt-item-operation {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 102px;
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
