<template>
	<div id="my-receipt">
		<van-nav-bar
			left-arrow
			title="增票资质"
			right-text="查看增票地址"
			@click-left="MixinRouterBack"
			@click-right="$router.push('/member/increase-ticket/invoice-address')">
		</van-nav-bar>
		<div class="increase-container">
			<!--通知信息-->
			<van-notice-bar wrapable>
				1）注意有效增值税发票开票资质仅为一个。
				2)本页面信息仅供增值税专用发票-资质审核使用，切勿进行支付相关业务，谨防上当受骗。
			</van-notice-bar>
			<!--增票资质申请状态相关信息-->
			<div class="audit-status" v-if="invoiceInfo && invoiceInfo.status">
				<div class="wait-status">
					<strong>您的增票资质：</strong>
					<span style="color:#71b247;">{{ invoiceInfo.status | invoiceStatus }}</span>
					<van-button size="mini" type="danger" v-if="invoiceInfo.status === 'AUDIT_PASS'" @click="handleDeleteInvoice">删除</van-button>
					<p v-if="invoiceInfo.status === 'AUDIT_REFUSE'">
						<strong>原因：</strong>
						<span style="color:#f42424;">{{ invoiceInfo.audit_remark || '单位名称不符合规范'}}</span>
					</p>
				</div>
			</div>
			<!--增票资质申请表单-->
			<van-cell-group :border="false">
				<van-field required label="单位名称" v-model="informationForm.company_name" placeholder="请输入单位名称" :maxlength="20" :error-message="authInfoRules.company_name_msg"/>
				<van-field required label="纳税人识别号" v-model="informationForm.taxpayer_code" placeholder="请输入纳税人识别号" :minlength="15" :maxlength="20" :error-message="authInfoRules.taxpayer_code_msg" />
				<van-field required label="注册地址" v-model="informationForm.register_address" placeholder="请输入注册地址" :error-message="authInfoRules.register_address_msg" />
				<van-field required label="注册电话" v-model="informationForm.register_tel" placeholder="请输入注册电话" :maxlength="13" :error-message="authInfoRules.register_tel_msg" />
				<van-field required label="开户银行" v-model="informationForm.bank_name" placeholder="请输入开户银行" :error-message="authInfoRules.bank_name_msg"/>
				<van-field required label="银行账号" v-model="informationForm.bank_account" placeholder="请输入银行账号" :maxlength="19" :error-message="authInfoRules.bank_account_msg"/>
			</van-cell-group>
			<div class="certificate" @click="agreed = !agreed">
				<van-icon :name="agreed ? 'checked' : 'check'"/>
				<span>我已阅读并同意<nuxt-link class="certificate-book" to="./increase-ticket/certificate">《增票资质确认书》</nuxt-link></span>
			</div>
			<div class="big-btn" v-if="canOpera">
				<van-button size="large" @click="saveInvoiceInfo">
					{{ invoiceInfo && invoiceInfo.status === 'AUDIT_REFUSE' ? '重新审核' : '保存' }}
				</van-button>
			</div>
		</div>
	</div>
</template>

<script>
  import Vue from 'vue'
  import { NoticeBar, Button } from 'vant'
  Vue.use(NoticeBar).use(Button)
  import * as API_Members from '@/api/members'
  import { RegExp } from '@/ui-utils'
  export default {
    name: 'increase-ticket-index',
    head() {
      return {
        title: `增票资质-${this.site.title}`
      }
    },
    mounted() {
      /** 获取增票信息详情 */
      this.GET_InvoiceInfo()
    },
	  computed: {
      // 是否可以进行保存操作
      canOpera() {
        return !this.invoiceInfo || this.invoiceInfo.status === 'AUDIT_PASS' || this.invoiceInfo.status === 'AUDIT_REFUSE'
		  }
	  },
    data() {
      return {
        // 用户信息
        user: this.$store.getters.user,
        defaultRegions: null,
        /** 增票资质 表单 */
        informationForm: {},
        /** 是否同意 增票资质确认书 */
        agreed: false,
        /** 基础信息 表单规则 */
        authInfoRules: {
          company_name_msg: '',
          taxpayer_code_msg: '',
          register_address_msg: '',
          register_tel_msg: '',
          bank_name_msg: '',
          bank_account_msg: ''
        },
        /** 增票资质申请相关信息 */
        invoiceInfo: {}
      }
    },
    filters: {
      // 赠票资质审核状态过滤
      invoiceStatus(status) {
        switch (status) {
          case 'NEW_APPLY': return '平台审核中'
          case 'AUDIT_PASS': return '已通过审核'
          case 'AUDIT_REFUSE': return '未通过审核'
        }
      }
    },
    methods: {
      /** 获取会员增票信息详情 */
      GET_InvoiceInfo() {
        API_Members.queryInvoiceInfo().then(res => {
          this.invoiceInfo = res
          const { company_name, taxpayer_code, register_address, register_tel, bank_name, bank_account } = res
          this.informationForm = {
            company_name,
            taxpayer_code,
            register_address,
            register_tel,
            bank_name,
            bank_account
          }
        })
      },
      /** 删除增票资质 */
      handleDeleteInvoice(){
        this.$confirm('您选择的增值税发票资质将被删除，删除后将不可修复。是否确认？',() => {
          API_Members.deleteInvoiceInfo(this.invoiceInfo.id).then(_ => {
            this.$message.success('删除成功')
            this.GET_InvoiceInfo()
          })
        })
      },
      /** 会员增票资质提交申请 */
      saveInvoiceInfo(){
        // 申请校验
        // 单位名称
        if(!this.informationForm.company_name) {
          this.authInfoRules.company_name_msg = '请输入单位名称'
          return
        } else {
          this.authInfoRules.company_name_msg = ''
        }
        // 纳税人识别号
        if(!this.informationForm.taxpayer_code) {
          this.authInfoRules.taxpayer_code_msg = '请填写纳税人识别号'
          return
        } else if (!RegExp.TINumber.test(this.informationForm.taxpayer_code)) {
          this.authInfoRules.taxpayer_code_msg = '纳税人识别号不正确'
          return
        } else {
          this.authInfoRules.taxpayer_code_msg = ''
        }
        // 注册地址
        if(!this.informationForm.register_address) {
          this.authInfoRules.register_address_msg = '请输入注册地址'
          return
        } else {
          this.authInfoRules.register_address_msg = ''
        }

        // 注册电话
        if(!this.informationForm.register_tel) {
          this.authInfoRules.register_tel_msg = '请输入注册电话'
          return
        } else if(!RegExp.TEL.test(this.informationForm.register_tel) && !RegExp.mobile.test(this.informationForm.register_tel)) {
          this.authInfoRules.register_tel_msg = '请输入正确的注册电话'
          return
        } else {
          this.authInfoRules.register_tel_msg = ''
        }

        // 请输入开户银行
        if(!this.informationForm.bank_name) {
          this.authInfoRules.bank_name_msg = '请输入开户银行'
          return
        } else {
          this.authInfoRules.bank_name_msg = ''
        }

        // 请输入银行账号
        if(!this.informationForm.bank_account) {
          this.authInfoRules.bank_account_msg = '请输入银行账号'
          return
        } else {
          this.authInfoRules.bank_account_msg = ''
        }
        if(!this.agreed) {
          this.$message.error('请先同意协议！')
          return
        }
        let params = { ...this.informationForm }
        if(!this.invoiceInfo) {
          params = { ...params, status: 'NEW_APPLY' }
        } else if (this.invoiceInfo.status) {
          params = { ...this.invoiceInfo, ...params,  }
        }
        Promise.all([
          this.invoiceInfo ? API_Members.changeTicketInformation(params) : API_Members.ticketInformationApply(params)
        ]).then(_ => {
          this.GET_InvoiceInfo()
          this.$message.error('提交成功，请耐心等待审核')
        })
      }
    }
  }
</script>

<style lang="scss" type="text/scss" scoped>
	@import "../../../assets/styles/color";
	.increase-container {
		padding-top: 46px;
	}
	.audit-status{
		background: #fffdee;
		padding: 10px;
		margin-top:10px;
		span{
			margin-right:10px;
			word-break: break-all;
		}
	}
	/* 增票资质确认书*/
	.certificate {
		width: 100%;
		display: -webkit-box;
		display: -ms-flexbox;
		align-items: center;
		display: flex;
		padding: 10px 15px;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		line-height: 24px;
		background-color: #fff;
		color: #333;
		font-size: 14px;
		overflow: hidden;
		border-top: 1px solid #f1f1f1;
		border-bottom: 1px solid #f1f1f1;
		margin-top: 15px;
		.van-icon-checked {
			color: $color-main;
		}
		& > span {
			display: inline-block;
			margin-left: 10px;
			color: #333;
			font-size: 14px;
			.certificate-book {
				color: $color-main;
				cursor: pointer;
			}
		}
	}
</style>