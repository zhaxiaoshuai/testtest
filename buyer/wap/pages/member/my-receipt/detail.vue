<template>
	<div class="receipt-info-container">
		<van-nav-bar left-arrow title="发票详情" @click-left="MixinRouterBack"/>
		<div class="order-items">
			<div class="order-item" v-for="(receipt, index) in receiptInfo" :key="index">
				<span>{{ receipt.label }}:</span>
				<span v-if="receipt.label !== '查看发票'" :style="{ color: receipt.label === '开票状态' ? '#f42424' : '#666' }">
					{{ receipt.value }}
					<nuxt-link v-if="receipt.label === '快递单号'" style="color: #f42424;" :to="`/member/my-order/express?logi_id=${receiptInfoOrigin.logi_id}&ship_no=${receiptInfoOrigin.logi_code}`">
						点击查看
					</nuxt-link>
				</span>
				<a v-else style="cursor: pointer;" target="_blank" :href="receipt.value">点击查看电子发票</a>
			</div>
		</div>
	</div>
</template>

<script>
  import * as API_Trade from '@/api/trade'
  import * as API_Members from '@/api/members'
	export default {
    name: 'my-receipt-detail',
    validate({ query }) {
      return !!query.history_id
    },
    data() {
      return {
        history_id: this.$route.query.history_id,
	      /** 原始响应数据 */
        receiptInfoOrigin: {},
        /** 当前查看的发票详情 */
        receiptInfo: ''
      }
    },
    mounted() {
      this.GET_receipt()
    },
    methods: {
      receiptType(type) {
        switch (type) {
          case 'ELECTRO': return '电子普通发票'
          case 'VATORDINARY': return '增值税普通发票'
          case 'VATOSPECIAL': return '增值税专用发票'
        }
      },
      // 获取详情
      GET_receipt() {
        API_Members.queryReceiptInfoDetail(this.history_id).then(response => {
          this.receiptInfoOrigin = response
	        let _receipt = []
          const logi = []
	        if(response.status === 1) {
	          if(response.receipt_type !== 'ELECTRO') {
              logi.push({
                label: '物流公司', value: response.logi_name,
                label: '快递单号', value: response.logi_code
              })
	          } else {
              logi.push({
                label: '查看发票', value: response.elec_file_list[0]
              })
	          }
	        }
	        switch (response.receipt_type) {
		        case 'ELECTRO':
              _receipt = [
                { label: '发票类型', value: this.receiptType(response.receipt_type) },
                { label: '发票内容', value: response.receipt_content },
                { label: '发票抬头', value: response.receipt_title },
                { label: '发票税号', value: response.tax_no || '无' },
                { label: '开票状态', value: response.status === 0 ? '商家暂未开具发票' : '商家已开具发票' },
                ...logi
              ];
              break;
		        case 'VATORDINARY':
              _receipt = [
                { label: '发票类型', value: this.receiptType(response.receipt_type) },
                { label: '发票内容', value: response.receipt_content },
                { label: '发票抬头', value: response.receipt_title },
                { label: '发票税号', value: response.tax_no || '无' },
                { label: '开票状态', value: response.status === 0 ? '商家暂未开具发票' : '商家已开具发票' },
                { label: '收票人',   value: response.member_name },
                { label: '联系方式', value: response.member_mobile },
                { label: '收票地址', value: `${response.province || ''}${response.city || ''}${response.county || ''}${response.town || ''}${response.detail_addr || ''}` },
	              ...logi
              ];
              break;
		        case 'VATOSPECIAL':
              _receipt = [
                { label: '发票类型', value: this.receiptType(response.receipt_type) },
                { label: '发票内容', value: response.receipt_content },
                { label: '单位名称', value: response.receipt_title },
                { label: '纳税人识别号', value: response.tax_no || '无' },
                { label: '注册地址', value: response.reg_addr },
                { label: '注册电话', value: response.reg_tel },
                { label: '开户银行', value: response.bank_name },
                { label: '银行账户', value: response.bank_account },
                { label: '开票状态', value: response.status === 0 ? '商家暂未开具发票' : '商家已开具发票' },
                { label: '收票人',   value: response.member_name },
                { label: '联系方式', value: response.member_mobile },
                { label: '收票地址', value: `${response.province || ''}${response.city || ''}${response.county || ''}${response.town || ''}${response.detail_addr || ''}` },
                ...logi
              ];
              break;
	        }
          this.receiptInfo = _receipt
        })
      }
    }
	}
</script>

<style lang="scss" type="text/scss" scoped>
	.receipt-info-container {
		padding-top: 46px;
	}
	.order-items {
		background-color: #fff;
		padding: 0 10px;
		.order-item {
			padding: 5px 0;
			font-size: 14px;
			color: #666666;
			span:first-child {
				margin-right: 10px;
			}
		}
	}
</style>