<template>
  <div class="detail-content">
    <div class="title">订单信息</div>
    <div class="order-information">
      <p>下单日期：{{receiptDetail['add_time'] | unixToDate}}</p>
      <p>订单编号：{{receiptDetail.order_sn}}</p>
      <p>订单金额：￥{{receiptDetail.order_price | unitPrice}}</p>
    </div>
    <div style="border-top: 1px solid #ebeef5;">
      <en-table-layout
      :tableData="typeof receiptDetail.goods_json === 'string' ? JSON.parse(receiptDetail.goods_json) : []"
      :toolbar="false"
      :pagination="false"
      :border-right="false">
      <template slot="table-columns">
        <el-table-column label="图片" width="90">
          <template slot-scope="scope">
              <a :href="`${MixinBuyerDomain}/goods/${scope.row.goods_id}`" target="_blank">
                  <img :src="scope.row.goods_image" alt="" width="62" height="62">
              </a>
          </template>
        </el-table-column>
        <el-table-column label="商品名称">
          <template slot-scope="scope">
            <a :href="`${MixinBuyerDomain}/goods/${scope.row.goods_id}`" class="goods-name" target="_blank">
              <span>{{scope.row.name}}</span>
            </a>
            <p class="sku-spec">{{ scope.row | formatterSkuSpec }}</p>
          </template>
        </el-table-column>
        <el-table-column label="商品价格" width="150">
          <template slot-scope="scope">￥{{ scope.row.purchase_price | unitPrice }}</template>
        </el-table-column>
        <el-table-column label="数量">
          <template slot-scope="scope">
            x {{scope.row.num}}
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120">
          <template slot-scope="scope">￥{{ scope.row.subtotal | unitPrice }}</template>
        </el-table-column>
      </template>
    </en-table-layout>
    </div>
    <div class="receipt-information">
      <div class="title">发票信息</div>
      <!--电子普通发票-->
      <template v-if="receiptDetail.receipt_type === 'ELECTRO'">
        <ul>
          <li>发票类型：{{receiptDetail.receipt_type | $$receipt}}</li>
          <li>发票内容：{{receiptDetail.receipt_content}}</li>
          <li>发票抬头：{{receiptDetail.receipt_title}}</li>
          <li v-if="receiptDetail.tax_no">发票税号：{{receiptDetail.tax_no}}</li>
          <li>收票人手机号：{{receiptDetail.member_mobile}}</li>
          <li v-if="receiptDetail.member_email">收票人邮箱：{{receiptDetail.member_email}}</li>
          <li>开票状态：
              <span v-if="receiptDetail.status === 0" style="color:#f42424;">未开票</span>
              <span v-if="receiptDetail.status === 1" style="color:#67c23a;">已开票</span>
          </li>
          <li v-if="receiptDetail.status === 1">电子发票：<el-button type="text" @click="lookElectronic">点击查看</el-button></li>
          <li v-if="receiptDetail.status === 0">
            <el-upload
              class="upload-demo"
              list-type="picture-card"
              :action="MixinUploadApi"
              :on-preview="handlePictureCardPreview"
              :on-success="handleSuccess"
              :before-upload="handleBeforeUpload"
              :on-exceed="() => { $message.error('只允许上传一个文件') }"
              :on-error="() => { $message.error('文件上传出错') }"
              :limit="1">
              <el-button type="primary">上传电子发票</el-button>
            </el-upload>
            <el-dialog :visible.sync="dialogImage">
                <img width="100%" :src="dialogImageUrl" alt="">
              </el-dialog>
          </li>
          <li style="text-align: center;" v-if="receiptDetail.status === 0">
            <el-button type="primary" @click="submitExpress">开票</el-button>
          </li>
        </ul>
      </template>
      <!--增值税普通发票-->
      <template v-if="receiptDetail.receipt_type === 'VATORDINARY'">
        <ul>
          <li>发票类型：{{receiptDetail.receipt_type | $$receipt}}</li>
          <li>发票内容：{{receiptDetail.receipt_content}}</li>
          <li>发票抬头：{{receiptDetail.receipt_title}}</li>
          <li v-if="receiptDetail.tax_no">发票税号：{{receiptDetail.tax_no}}</li>
          <li>收票人姓名：{{receiptDetail.member_name}}</li>
          <li>收票人手机号：{{receiptDetail.member_mobile}}</li>
          <li>收票地址：{{ `${receiptDetail.province || ''}${receiptDetail.city || ''}${receiptDetail.county || ''}${receiptDetail.town || ''}${receiptDetail.detail_addr || ''}` }}</li>
          <li>开票状态：
            <span v-if="receiptDetail.status === 0" style="color:#f42424;">未开票</span>
            <span v-if="receiptDetail.status === 1" style="color:#67c23a;">已开票</span>
          </li>
          <li v-if="receiptDetail.status === 1">物流公司：<span>{{receiptDetail.logi_name}}</span></li>
          <li v-if="receiptDetail.status === 1">快递单号：<span>{{receiptDetail.logi_code}}</span></li>
          <li v-if="receiptDetail.status === 1">物流信息：<el-button type="text" @click="looklogistics">点击查看</el-button></li>
        </ul>
      </template>
      <!--增值税专用发票-->
      <template v-if="receiptDetail.receipt_type === 'VATOSPECIAL'">
        <ul>
          <li>发票类型：{{receiptDetail.receipt_type | $$receipt}}</li>
          <li>发票内容：{{receiptDetail.receipt_content}}</li>
          <li>开票方式：{{receiptDetail.receipt_method}}</li>
          <li>单位名称：{{receiptDetail.receipt_title}}</li>
          <li>纳税人识别号：{{receiptDetail.tax_no}}</li>
          <li>注册地址：{{receiptDetail.reg_addr}}</li>
          <li>注册电话：{{receiptDetail.reg_tel}}</li>
          <li>开户银行：{{receiptDetail.bank_name}}</li>
          <li>银行账户：{{receiptDetail.bank_account}}</li>
          <li>收票人姓名：{{receiptDetail.member_name}}</li>
          <li>收票人手机号：{{receiptDetail.member_mobile}}</li>
          <li>收票地址：{{ `${receiptDetail.province || ''}${receiptDetail.city || ''}${receiptDetail.county || ''}${receiptDetail.town || ''}${receiptDetail.detail_addr || ''}` }}</li>
          <li>开票状态：
            <span v-if="receiptDetail.status === 0" style="color:#f42424;">未开票</span>
            <span v-if="receiptDetail.status === 1" style="color:#67c23a;">已开票</span>
          </li>
          <li v-if="receiptDetail.status === 1">物流公司：<span>{{receiptDetail.logi_name}}</span></li>
          <li v-if="receiptDetail.status === 1">快递单号：<span>{{receiptDetail.logi_code}}</span></li>
          <li v-if="receiptDetail.status === 1">物流信息：<el-button type="text" @click="looklogistics">点击查看</el-button></li>
          <li style="text-align: center;" v-if="receiptDetail.status === 0">
            <el-button type="primary" @click="openExpressInvoiceDialog">开票</el-button>
          </li>
        </ul>
      </template>
    </div>
    <!--物流弹框-->
    <el-dialog
      title="填写快递单号"
      width="30%"
      :visible.sync="dialogVisible">
      <el-form ref="expressForm" :model="expressForm" label-width="80px">
        <el-form-item label="快递公司">
          <el-select v-model="expressForm.logi_id" placeholder="请选择快递公司">
            <el-option
              v-for="item in expressList"
              :key="item.logistics_company_do.id"
              :label="item.logistics_company_do.name"
              :value="item.logistics_company_do.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="expressForm.logi_code"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="expressSubmit">确 定</el-button>
      </span>
    </el-dialog>
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
      <div v-if="receiptDetail.elec_file_list">
        <img :src="receiptDetail.elec_file_list" width="100%">
      </div>
    </el-dialog>
  </div>
</template>

<script>
    import * as API_order from '@/api/order'
    import * as API_Receipt from '@/api/receipt'
    import { LogisticsCompany } from './components'
    export default {
      name: 'receiptDetail',
      components: {
        [LogisticsCompany.name]: LogisticsCompany
      },
      filters: {
        $$receipt(type) {
          switch (type) {
            case 'ELECTRO':
              return '电子普通发票'
            case 'VATORDINARY':
              return '增值税普通发票'
            case 'VATOSPECIAL':
              return '增值税专用发票'
          }
        }
      },
      data() {
        return {
          /** 当前查看的发票详情 */
          receiptDetail: [],
          /** 发票id */
          history_id: '',
          /** 弹框是否显示 */
          dialogVisible: false,
          /** 快递表单 */
          expressForm: {
            logi_id: '',
            logi_code: ''
          },
          /** 快递信息 */
          expressList: [],
          /** 物流信息弹框是否显示 */
          logisticsShow: false,
          /** 电子面单弹框是否显示 */
          electronicShow: false,
          /** 图片地址 */
          imageUrl: [],
          /** 图片放大地址 */
          dialogImageUrl: '',
          /** 是否显示放大图片弹框 */
          dialogImage: false,
          /** 发货物流信息 */
          logisticsInfoList: []
        }
      },
      beforeRouteUpdate(to, from, next) {
        this.history_id = to.params.history_id
        this.GET_ReceiptDetail()
        next()
      },
      mounted() {
        this.history_id = this.$route.params.history_id
        this.GET_ReceiptDetail()
      },
      activated() {
        this.history_id = this.$route.params.history_id
        this.GET_ReceiptDetail()
      },
      methods: {
        // 获取详情信息
        GET_ReceiptDetail() {
          API_Receipt.getHistoryReceiptDetail(this.history_id).then(response => {
            this.receiptDetail = response
          })
        },
        /** 点击已上传的文件链接时的钩子 放大 */
        handlePictureCardPreview(file) {
          this.dialogImageUrl = file.url
          this.dialogImage = true
        },
        /** 文件列表上传成功时的钩子  上传成功校验 */
        handleSuccess(response, file, fileList) {
          this.imageUrl = [response.url]
        },
        handleBeforeUpload(file) {
          if (this.receiptDetail.order_status === 'NEW' || this.receiptDetail.order_status === 'CONFIRM' || this.receiptDetail.order_status === 'INTODB_ERROR') {
            this.$message.error('订单还未付款，不允许上传电子发票附件')
            return false
          }
          if (this.receiptDetail.order_status === 'CANCELLED') {
            this.$message.error('订单已经取消，不允许上传电子发票附件')
            return false
          }
        },
        // 上传电子发票
        submitExpress() {
          if (this.imageUrl.length <= 0) {
            this.$message.error('电子发票附件不能为空')
          } else {
            API_Receipt.submitExpressOrdinaryInfo({
              files: this.imageUrl,
              history_id: this.$route.params.history_id
            }).then(response => {
              this.GET_ReceiptDetail()
              this.$message.success('开票成功')
            }).catch(() => this.$message.error('开启失败'))
          }
        },
        // 提交物流信息
        expressSubmit() {
          let currentExpress = this.expressList.find(item => item.logistics_company_do.id === this.expressForm.logi_id)
          let params = {
            ...this.expressForm,
            logi_name: currentExpress.logistics_company_do.name,
            history_id: this.$route.params.history_id
          }
          API_Receipt.submitExpressInfo(params).then(response => {
            this.$message.success('提交成功')
            this.GET_ReceiptDetail()
            this.dialogVisible = false
          }).catch(() => {
            this.$message.error('提交失败，请重试')
            this.dialogVisible = false
          })
        },
        // 打开物流弹框
        openExpressInvoiceDialog() {
          if (this.receiptDetail.order_status === 'NEW' || this.receiptDetail.order_status === 'CONFIRM' || this.receiptDetail.order_status === 'INTODB_ERROR') {
            this.$message.error('订单还未付款，不允许开票')
            return false
          }
          if (this.receiptDetail.order_status === 'CANCELLED') {
            this.$message.error('订单已经取消，不允许上传电子发票附件')
            return false
          }
          API_Receipt.queryExpressList().then(response => {
            if (!response.length) {
              this.$message.error('没有物流公司，请先去设置')
            }
            this.expressList = response
            this.expressForm.logi_id = response[0].logistics_company_do.id
            this.dialogVisible = true
          }).catch()
        },
        /** 查看物流信息*/
        looklogistics() {
          this.logisticsShow = true
          const _params = {
            id: this.receiptDetail.logi_id,
            num: this.receiptDetail.logi_code
          }
          this.loading = true
          API_order.getLogisticsInfo(_params).then(response => {
            this.loading = false
            this.logisticsInfoList = response
          })
        },
        lookElectronic() {
          this.electronicShow = true
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
.detail-content{
	background-color: #fff;
  .title{
    border-bottom:1px solid #ccc;
    padding-left:10px;
    line-height: 40px;
    margin-bottom:10px;
  }
  .order-information{
    padding:0 0 10px 10px;
    p{
      font-size: 14px;
      line-height: 30px;
    }
  }
  .image-information{
    text-align: left;
    img{
      float: left;
    }
    span{
      float: left;
      padding-left:10px;
      line-height: 30px;
    }
  }
  .receipt-information{
    padding-top: 20px;
    ul{
      list-style:none;
      padding-left:10px;
      li{
        list-style:none;
        font-size:14px;
        line-height: 30px;
      }
    }
  }
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
