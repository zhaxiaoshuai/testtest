<template>
	<div class="invoice-address-container">
		<van-nav-bar
			left-arrow
			title="收票地址"
			@click-left="MixinRouterBack">
		</van-nav-bar>
		<div>
			<van-cell-group :border="false">
				<van-field required label="收票人" v-model="addressForm.member_name" placeholder="请输入收票人姓名" :maxlength="10" :error-message="authInfoRules.member_name_msg"/>
				<van-field required label="手机号码" v-model="addressForm.member_mobile" placeholder="请输入手机号码" :minlength="11" :maxlength="11" :error-message="authInfoRules.member_mobile_msg" />
				<van-field required label="所在地区" v-model="addressForm.address" placeholder="请输入所在地区" readonly icon="arrow" :error-message="authInfoRules.address_msg" @click.native="showAddressSelector = true" />
				<van-field required label="详细地址" v-model="addressForm.detail_addr" placeholder="请输入详细地址" :maxlength="20" :error-message="authInfoRules.detail_addr_msg" />
			</van-cell-group>
		</div>
		<div class="big-btn">
			<van-button size="large" @click="handleSaveAddress"> 保   存 </van-button>
		</div>
		<en-region-picker
			:show="showAddressSelector"
			:api="MixinRegionApi"
			:default="regions"
			@closed="showAddressSelector = false"
			@changed="handleAddressSelectorChanged"
		/>
	</div>
</template>

<script>
  import Vue from 'vue'
  import { NoticeBar, Button } from 'vant'
  Vue.use(NoticeBar).use(Button)
  import * as API_Members from '@/api/members'
  import { RegExp } from '@/ui-utils'
	export default {
	  name: 'increase-ticket-address',
    head() {
      return {
        title: `增票资质-${this.site.title}`
      }
    },
		data() {
	    return {
        /** 收票地址 表单 */
        addressForm: {
          member_name: '',
          member_mobile: '',
          region: '',
          address: '',
          detail_addr: ''
        },

        authInfoRules: {
          member_name_msg: '',
          member_mobile_msg: '',
          detail_addr_msg: '',
          address_msg: ''
        },

		    /** 是否显示地址选择器 */
        showAddressSelector: false,
        regions: ''
	    }
		},
		mounted() {
      /* 查询收票人地址信息 */
      this.GET_InvoiceAddress()
		},
		methods: {
      // 解决ios手机在微信浏览器中键盘弹起input无法聚焦问题
      handleIosResize() { window.scroll(0,0) },
      /** 地址选择器发生改变 */
      handleAddressSelectorChanged(object) {
        this.addressForm.region = object.last_id
        this.addressForm.address = object.string
      },
      /** 增加/修改收票人地址 */
      handleSaveAddress() {
        //校验
        // 收票人
        if(!this.addressForm.member_name) {
          this.authInfoRules.member_name_msg = '请输入收票人姓名'
          return
        } else {
          this.authInfoRules.member_name_msg = ''
        }
        // 手机号码
        if(!this.addressForm.member_mobile) {
          this.authInfoRules.member_mobile_msg = '请输入收票人姓名'
          return
        } else if(!RegExp.mobile.test(this.addressForm.member_mobile)) {
          this.authInfoRules.member_mobile_msg = '请输入正确的手机号码'
          return
        } else {
          this.authInfoRules.member_mobile_msg = ''
        }
        // 所在地区
        if(!this.addressForm.region) {
          this.authInfoRules.address_msg = '请选择所在地区'
          return
        } else {
          this.authInfoRules.address_msg = ''
        }
        // 详细地址
        if(!this.addressForm.detail_addr) {
          this.authInfoRules.detail_addr_msg = '请输入详细地址'
          return
        } else {
          this.authInfoRules.detail_addr_msg = ''
        }
        // 数据处理
        let params = JSON.parse(JSON.stringify(this.addressForm))
	      // 提交
        Promise.all([
          this.addressForm.id ? API_Members.changeTicketAdress(params, this.addressForm.id) : API_Members.ticketAdressApply(params)
	      ]).then(_ => {
	        this.$message.success('保存成功')
	        this.GET_InvoiceAddress()
        })
      },
      /** 查询收票人地址 */
      GET_InvoiceAddress() {
        API_Members.queryTicketAdress().then(res => {
          if(res) {
            this.addressForm.id = res.id
            this.addressForm.member_name = res.member_name
            this.addressForm.member_mobile = res.member_mobile
            this.addressForm.detail_addr = res.detail_addr
            this.addressForm.address = `${res.province} ${res.city} ${res.county} ${res.town}`
            this.addressForm.region = res.county_id || res.town_id
          }
        }
      )}
		}
	}
</script>

<style lang="scss" type="text/scss" scoped>
  .invoice-address-container {
	  padding-top: 46px;
  }
</style>