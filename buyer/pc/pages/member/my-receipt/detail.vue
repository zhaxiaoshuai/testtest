<template>
    <div id="receipt-detail">
      <div class="member-nav">
        <ul class="member-nav-list">
          <li class="active">
            <a href="../my-receipt">我的发票</a>
          </li>
        </ul>
      </div>
       <div class="receipt-detail">
         <div class="receipt-title">发票信息 订单号：{{receiptDetail.order_sn}}</div>
         <!--电子普通发票-->
         <template v-if="receiptDetail.receipt_type === 'ELECTRO'">
           <div class="receipt-content">
               <ul>
                 <li><div class="title">发票类型</div>{{ receiptDetail.receipt_type | $$receipt }}</li>
                 <li><div class="title">发票内容</div><span>{{ receiptDetail.receipt_content }}</span></li>
                 <li><div class="title">发票抬头</div><span>{{ receiptDetail.receipt_title }}</span></li>
                 <li v-if="receiptDetail.tax_no"><div class="title">发票税号</div><span>{{ receiptDetail.tax_no }}</span></li>
                 <li><div class="title">收票人手机号</div><span>{{ receiptDetail.member_mobile }}</span></li>
                 <li v-if="receiptDetail.member_email"><div class="title">收票人邮箱</div><span>{{ receiptDetail.member_email }}</span></li>
                 <li><div class="title">开票状态</div>
                   <span v-if="receiptDetail.status === 0" style="color:#f42424;">商家暂未开具发票</span>
                   <span v-if="receiptDetail.status === 1" style="color:#67c23a;">商家已开具发票</span>
                 </li>
                 <li v-if="receiptDetail.status === 1">
	                 <div class="title">查看发票</div>
	                 <a style="cursor: pointer;" target="_blank" :href="this.receiptDetail.elec_file_list[0]">点击查看（注：请点击查看后自行保存）</a>
                 </li>
               </ul>
           </div>
         </template>
         <!--增值税普通发票-->
         <template v-if="receiptDetail.receipt_type === 'VATORDINARY'">
           <div class="receipt-content">
               <ul>
                 <li><div class="title">发票类型</div><span>{{receiptDetail.receipt_type | $$receipt }}</span></li>
                 <li><div class="title">发票内容</div><span>{{receiptDetail.receipt_content}}</span></li>
                 <li><div class="title">发票抬头</div><span>{{receiptDetail.receipt_title}}</span></li>
                 <li v-if="receiptDetail.tax_no"><div class="title">发票税号</div><span>{{receiptDetail.tax_no}}</span></li>
                 <li><div class="title">开票状态</div>
                   <span v-if="receiptDetail.status === 0" style="color:#f42424;">商家暂未开具发票</span>
                   <span v-if="receiptDetail.status === 1" style="color:#67c23a;">商家已开具并寄出发票</span>
                 </li>
                 <li><div class="title">收票人</div><span>{{receiptDetail.member_name}}</span></li>
                 <li><div class="title">联系方式</div><span>{{receiptDetail.member_mobile}}</span></li>
                 <li><div class="title">收票地址</div><span>{{ `${receiptDetail.province || ''}${receiptDetail.city || ''}${receiptDetail.county || ''}${receiptDetail.town || ''}${receiptDetail.detail_addr || ''}` }}</span></li>
                 <li v-if="receiptDetail.status === 1"><div class="title">物流公司</div><span>{{receiptDetail.logi_name}}</span></li>
                 <li v-if="receiptDetail.status === 1"><div class="title">快递单号</div><span>{{receiptDetail.logi_code}}</span><el-button type="text" @click="looklogistics">点击查看</el-button></li>
               </ul>
           </div>
         </template>
         <!--增值税专用发票-->
         <template v-if="receiptDetail.receipt_type === 'VATOSPECIAL'">
           <div class="receipt-content">
               <ul>
                 <li><div class="title">发票类型：</div><span>{{receiptDetail.receipt_type | $$receipt}}</span></li>
                 <li><div class="title">发票内容</div><span>{{receiptDetail.receipt_content}}</span></li>
                 <li><div class="title">开票方式</div><span>{{receiptDetail.receipt_method}}</span></li>
                 <li><div class="title">单位名称</div><span>{{receiptDetail.receipt_title}}</span></li>
                 <li><div class="title">纳税人识别号</div><span>{{receiptDetail.tax_no}}</span></li>
                 <li><div class="title">注册地址</div><span>{{receiptDetail.reg_addr}}</span></li>
                 <li><div class="title">注册电话</div><span>{{receiptDetail.reg_tel}}</span></li>
                 <li><div class="title">开户银行</div><span>{{receiptDetail.bank_name}}</span></li>
                 <li><div class="title">银行账户</div><span>{{receiptDetail.bank_account}}</span></li>
                 <li><div class="title">开票状态</div>
                   <span v-if="receiptDetail.status === 0" style="color:#f42424;">商家暂未开具发票</span>
                   <span v-if="receiptDetail.status === 1" style="color:#67c23a;">商家已开具并寄出发票</span>
                 </li>
                 <li><div class="title">收票人</div><span>{{receiptDetail.member_name}}</span></li>
                 <li><div class="title">联系方式</div><span>{{receiptDetail.member_mobile}}</span></li>
                 <li><div class="title">收票地址</div><span>{{ `${receiptDetail.province || ''}${receiptDetail.city || ''}${receiptDetail.county || ''}${receiptDetail.town || ''}${receiptDetail.detail_addr || ''}` }}</span></li>
                 <li v-if="receiptDetail.status === 1"><div class="title">物流公司</div><span>{{receiptDetail.logi_name}}</span></li>
                 <li v-if="receiptDetail.status === 1"><div class="title">快递单号</div><span>{{receiptDetail.logi_code}}</span><el-button type="text" @click="looklogistics">点击查看</el-button></li>
               </ul>
           </div>
         </template>
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
       </div>
    </div>
</template>

<script>
  import * as API_Trade from '@/api/trade'
  import * as API_Members from '@/api/members'
  import { Dialog, Steps, Step} from 'element-ui'
  import Vue from 'vue'
  Vue.use(Dialog);
  Vue.use(Steps);
  Vue.use(Step);
    export default {
      name:'detail',
      filters: {
        $$receipt(type) {
          switch (type) {
            case 'ELECTRO':
              return '电子普通发票';
            case 'VATORDINARY':
              return '增值税普通发票';
            case 'VATOSPECIAL':
              return '增值税专用发票'
          }
        }
      },
      validate({ query }) {
        return !!query.history_id
      },
      data() {
        return {
          history_id: this.$route.query.history_id,
          /** 当前查看的发票详情 */
          receiptDetail: [],
          /** 物流信息弹框是否显示 */
          logisticsShow: false,
          /** 发货物流信息 */
          logisticsInfoList: []
        }
      },
      mounted() {
        this.GET_ReceiptDetail()
      },
      methods: {
        // 获取详情
        GET_ReceiptDetail() {
          API_Members.queryReceiptInfoDetail(this.history_id).then(response => {
            this.receiptDetail = response
          })
        },
        /** 查看物流信息*/
        looklogistics() {
          API_Trade.getExpress(this.receiptDetail.logi_id, this.receiptDetail.logi_code).then(response => {
            this.logisticsInfoList = response;
            this.logisticsShow = true
          })
        }
      }
    }
</script>

<style type="text/scss" lang="scss" scoped>
  @import "../../../assets/styles/color";
  /deep/ .el-dialog__body {
    padding: 20px 25px;
    .logistics-info {
      max-height: 500px;
      overflow-y: scroll;
    }
  }
  .receipt-title{
    background: #f7f7f7;
    border: 1px solid #e7e7e7;
    padding: 5px 0;
    color: #999;
    height: 20px;
    font-size: 12px;
    font-weight: 400;
    margin-top: 10px;
    padding-left: 20px;
  }
  .receipt-content{
    border: 1px solid #e7e7e7;
    border-top:0;
    border-bottom:0;
    li{
      height: 40px;
      line-height:40px;
      border-bottom: 1px solid #e7e7e7;
      .title{
        padding-left:20px;
        border-right:1px solid #e7e7e7;
        height: 40px;
        line-height:40px;
        width:120px;
        float: left;
        margin-right:10px;
      }
    }
  }
</style>
