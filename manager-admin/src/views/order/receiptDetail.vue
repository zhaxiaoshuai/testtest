<template>
  <div class="container">
    <el-row :gutter="0">
      <el-col :span="24">
        <div class="d-header">订单信息</div>
        <div class="d-content">
          <div class="item">
            <span class="item-label">下单日期</span>
            <span class="item-value">{{receipt['add_time'] | unixToDate}}</span>
          </div>
          <div class="item">
            <span class="item-label">订单编号</span>
            <span class="item-value">{{ receipt.order_sn }}</span>
          </div>
          <div class="item">
            <span class="item-label">订单金额</span>
            <span class="item-value">￥{{receipt.order_price | unitPrice}}</span>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row v-if="skuList" :gutter="0">
      <el-col :span="24">
        <div class="d-header">商品列表</div>
        <el-table :data="skuList" :header-cell-style="{textAlign: 'center'}">
          <el-table-column label="商品图片" width="180">
            <template slot-scope="scope">
              <a :href="`${MixinBuyerDomain}/goods/${scope.row.goods_id}`" target="_blank">
                <img :src="scope.row.goods_image" class="goods-image"/>
              </a>
            </template>
          </el-table-column>
          <el-table-column label="商品名称">
            <template slot-scope="scope">
              <a :href="MixinBuyerDomain + '/goods/' + scope.row.goods_id" class="goods-name" target="_blank">{{ scope.row.name }}</a>
              <p class="sku-spec">{{ scope.row | formatterSkuSpec }}</p>
            </template>
          </el-table-column>
          <el-table-column label="商品价格" width="150">
            <template slot-scope="scope">￥{{ scope.row.purchase_price | unitPrice }}</template>
          </el-table-column>
          <el-table-column prop="num" label="购买数量" width="120"/>
          <el-table-column label="小计" width="120">
            <template slot-scope="scope">￥{{ scope.row.subtotal | unitPrice }}</template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <el-row :gutter="0">
       <el-col :span="24">
        <div class="d-header">发票信息</div>
        <div class="d-content">
          <div class="item">
            <span class="item-label">发票类型</span>
            <span class="item-value" v-if="receipt.receipt_type === 'ELECTRO'">电子普通发票</span>
            <span class="item-value" v-if="receipt.receipt_type === 'VATORDINARY'">增值税普通发票</span>
            <span class="item-value" v-if="receipt.receipt_type === 'VATOSPECIAL'">增值税专用发票</span>
          </div>
          <div class="item">
            <span class="item-label">发票内容</span>
            <span class="item-value">{{ receipt.receipt_content || '无' }}</span>
          </div>
          <!--电子普通发票-->
          <div v-if="receipt.receipt_type === 'ELECTRO'">
            <div class="item">
              <span class="item-label">发票抬头</span>
              <span class="item-value">{{ receipt.receipt_title || '无' }}</span>
            </div>
            <div class="item" v-if="receipt.receipt_title !== '个人'">
              <span class="item-label">{{ receipt.receipt_type === 'VATOSPECIAL' ? '纳税人识别号' : '发票税号' }}</span>
              <span class="item-value">{{ receipt.tax_no || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">收票人手机号</span>
              <span class="item-value">{{ receipt.member_mobile || '无' }}</span>
            </div>
            <div class="item" v-if="receipt.member_email">
              <span class="item-label">收票人邮箱</span>
              <span class="item-value">{{ receipt.member_email || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">开票状态</span>
              <span v-if="receipt.status === 0" class="item-value">未开票</span>
              <span v-if="receipt.status === 1" class="item-value">已开票</span>
            </div>
            <div class="item" v-if="receipt.receipt_type === 'ELECTRO' && receipt.status === 1">
              <span class="item-label">电子发票</span>
              <el-button type="text" @click="lookElectronic">点击查看</el-button>
            </div>
          </div>
          <!--增值税普通发票-->
          <div v-if="receipt.receipt_type === 'VATORDINARY'">
            <div class="item">
              <span class="item-label">发票抬头</span>
              <span class="item-value">{{ receipt.receipt_title || '无' }}</span>
            </div>
            <div class="item" v-if="receipt.receipt_title !== '个人'">
              <span class="item-label">{{ receipt.receipt_type === 'VATOSPECIAL' ? '纳税人识别号' : '发票税号' }}</span>
              <span class="item-value">{{ receipt.tax_no || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">收票人姓名</span>
              <span class="item-value">{{ receipt.member_name || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">收票人手机号</span>
              <span class="item-value">{{ receipt.member_mobile || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">收票地址</span>
              <span class="item-value">{{ `${receipt.province || ''}${receipt.city || ''}${receipt.county || ''}${receipt.town || ''}${receipt.detail_addr || ''}` || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">开票状态</span>
              <span v-if="receipt.status === 0" class="item-value">未开票</span>
              <span v-if="receipt.status === 1" class="item-value">已开票</span>
            </div>
            <div v-if="receipt.status === 1">
              <div class="item">
                <span class="item-label">物流公司</span>
                <span class="item-value">{{ receipt.logi_name || '无' }}</span>
              </div>
              <div class="item">
                <span class="item-label">快递单号</span>
                <span class="item-value">{{ receipt.logi_code || '无' }}</span>
              </div>
              <div class="item">
                <span class="item-label">物流信息</span>
                <el-button type="text" @click="looklogistics">点击查看</el-button>
              </div>
            </div>
          </div>
          <!--增值税专用发票-->
          <div v-if="receipt.receipt_type === 'VATOSPECIAL'">
            <div class="item">
              <span class="item-label">开票方式</span>
              <span class="item-value">{{ receipt.receipt_method || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">单位名称</span>
              <span class="item-value">{{ receipt.receipt_title || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">纳税人识别号</span>
              <span class="item-value">{{ receipt.tax_no || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">注册地址</span>
              <span class="item-value">{{ receipt.reg_addr || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">注册电话</span>
              <span class="item-value">{{ receipt.reg_tel || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">开户银行</span>
              <span class="item-value">{{ receipt.bank_name || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">银行账户</span>
              <span class="item-value">{{ receipt.bank_account || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">收票人姓名</span>
              <span class="item-value">{{ receipt.member_name || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">收票人手机号</span>
              <span class="item-value">{{ receipt.member_mobile || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">收票地址</span>
              <span class="item-value">{{ `${receipt.province || ''}${receipt.city || ''}${receipt.county || ''}${receipt.town || ''}${receipt.detail_addr || ''}` || '无' }}</span>
            </div>
            <div class="item">
              <span class="item-label">开票状态</span>
              <span v-if="receipt.status === 0" class="item-value">未开票</span>
              <span v-if="receipt.status === 1" class="item-value">已开票</span>
            </div>
            <div v-if="receipt.status === 1">
              <div class="item">
                <span class="item-label">物流公司</span>
                <span class="item-value">{{ receipt.logi_name || '无' }}</span>
              </div>
              <div class="item">
                <span class="item-label">快递单号</span>
                <span class="item-value">{{ receipt.logi_code || '无' }}</span>
              </div>
              <div class="item">
                <span class="item-label">物流信息</span>
                <el-button type="text" @click="looklogistics">点击查看</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <!--查看物流信息弹框-->
    <el-dialog :visible.sync="logisticsShow" width="400px" align="center">
      <div slot="title">
        <h3 style="margin: 10px 0;">物流信息</h3>
        <div class="logistics-base">
          <span>物流公司：{{ this.logisticsInfoList.name }}</span>
          <span>快递单号：{{ this.logisticsInfoList.courier_num }}</span>
        </div>
      </div>
      <div class="logistics-info">
        <div v-if="logisticsInfoList">
          <el-steps direction="vertical" :active="1" align-center space="100px">
            <el-step
              v-for="(row, index) in logisticsInfoList.data"
              :title="row.time"
              :key="index"
              :status="index === 0 ? 'success' : 'wait'"
              :description="row.context"/>
          </el-steps>
        </div>
        <div v-else>暂无物流信息，请您耐心等待！</div>
      </div>
    </el-dialog>
    <!--查看电子面单-->
    <el-dialog :visible.sync="electronicShow" align="center">
      <div v-if="receipt.elec_file_list">
        <img :src="receipt.elec_file_list" width="100%">
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_Receipt from '@/api/receipt'
  import * as API_ExpressPlatform from '@/api/expressPlatform'

  export default {
    name: 'receiptDetail',
    data() {
      return {
        id: this.$route.params.id,

        /** 物流信息弹框是否显示 */
        logisticsShow: false,

        /** 发货物流信息 */
        logisticsInfoList: [],

        /** 电子面单弹框是否显示 */
        electronicShow: false,

        receipt: '',
        skuList: ''
      }
    },
    beforeRouteUpdate(to, from, next) {
      this.id = to.params.id
      next()
    },
    activated() {
      this.id = this.$route.params.id
    },
    mounted() {
      this.GET_ReceiptDetail()
    },
    watch: {
      id: 'GET_ReceiptDetail'
    },
    methods: {

      /** 查看物流信息*/
      looklogistics() {
        this.logisticsShow = true
        const _params = {
          id: this.receipt.logi_id,
          num: this.receipt.logi_code
        }
        this.loading = true
        API_ExpressPlatform.getLogisticsInfo(_params).then(response => {
          this.loading = false
          this.logisticsInfoList = response
        })
      },

      lookElectronic() {
        this.electronicShow = true
      },

      /** 获取开票详情 */
      GET_ReceiptDetail() {
        API_Receipt.getHistoryReceiptDetail(this.id).then(response => {
          this.receipt = response
          this.skuList = response.order_sku_list
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  /deep/ .el-dialog__body {
    padding: 20px 25px;
    .logistics-info {
      max-height: 500px;
      overflow-y: scroll;
    }
  }
  .container {
    padding: 0;
  }
  .d-header {
    padding: 10px 0 10px 20px;
    font-size: 14px;
    color: #333;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e1e8ed;
    &h2 {
      font-size: 14px;
      font-weight: 400;
    }
  }
  .item {
    width: 100%;
    position: relative;
    display: inline-block;
    vertical-align: top;
    box-sizing: border-box;
    padding: 16px 0 16px 20px;
    line-height: 24px;
    white-space: nowrap;
    & .item-label {
      float: left;
      margin-right: 20px;
      font-size: 14px;
      color: #999;
    }
    & .item-value {
      overflow: hidden;
      white-space: normal;
      word-break: break-all;
      font-size: 14px;
      color: #666;
    }
  }
  /deep/ .el-table td:not(.is-left) {
    text-align: center;
  }
  .goods-image {
    width: 50px;
    height: 50px;
  }
  .goods-name {
    color: #4183c4;
    &:hover { color: #f42424 }
  }
  .sku-spec {
    color: #ff9800;
    margin: 0;
  }
</style>
