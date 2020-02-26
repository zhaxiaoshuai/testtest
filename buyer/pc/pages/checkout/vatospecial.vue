<template>
  <li class="increment-receipt">
    <div class="message-tips">
      <p>我公司依法开具发票，请您按照税法规定使用发票。</p>
      <p>如您需要开具增值税专用发票，我们会在订单完成后3-4个工作日为您寄出，寄出后您可以在订单信息中查看快递单号。</p>
    </div>
    <div class="increment-receipt-content">
      <div class="" v-if="step1 && !step2 && !step3">
        <el-form
          v-if="step1"
          :rules="authInfoRules"
          size="mini">
          <el-form-item class="increment-type" label="开票方式" prop="content">
            <div class="ckt-checkbox content-receipt selected" style="width: auto">
              <span>{{ receipt_method }}</span>
            </div>
          </el-form-item>
          <el-form-item class="receipt-conten"  label="发票内容" prop="content">
            <div class="ckt-checkbox content-receipt selected">
              <span>{{ content }}</span>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <!-- 步骤条 -->
      <div class="increment-Invoice">
          <ul>
            <li>1.选择开票方式</li>
            <li class="gap"></li>
            <li :class="[(step2 || step3) ? null : 'fore']">2.核对公司信息</li>
            <li :class="['gap', (step2 || step3) ? 'curr' : null]"></li>
            <li :class="[step3 && !step1 && !step2 ? null : 'fore']">3.填写收票人信息</li>
          </ul>
      </div>
      <!-- step1 下一步 按钮 -->
      <!--公司信息-->
      <div class="" v-if="step2">
        <el-form
          v-if="step2"
          :model="companyInformationForm"
          ref="companyInformationForm"
          size="mini"
          label-width="130px"
          class="ticket-form">
          <el-form-item label="单位名称：">
            <el-input v-model="companyInformationForm.company_name" readonly/>
          </el-form-item>
          <el-form-item label="纳税人识别号：">
            <el-input v-model="companyInformationForm.taxpayer_code" readonly/>
          </el-form-item>
          <el-form-item label="注册地址：">
            <el-input v-model="companyInformationForm.register_address" readonly/>
          </el-form-item>
          <el-form-item label="注册电话：">
            <el-input v-model="companyInformationForm.register_tel" readonly/>
          </el-form-item>
          <el-form-item label="开户银行：">
            <el-input v-model="companyInformationForm.bank_name" readonly/>
          </el-form-item>
          <el-form-item label="银行账号：">
            <el-input v-model.trim="companyInformationForm.bank_account" readonly/>
          </el-form-item>
        </el-form>
      </div>
      <!--收票人地址信息-->
      <el-form
        v-if="step3"
        :model="adressForm"
        :rules="authInfoRules"
        ref="adressForm"
        size="mini"
        label-width="130px"
        class="ticket-form">
        <el-form-item label="收票人姓名：" prop="member_name" >
          <el-input v-model="adressForm.member_name" :maxlength="20"/>
        </el-form-item>
        <el-form-item label="收票人手机号：" prop="member_mobile" >
          <el-input v-model="adressForm.member_mobile" :maxlength="11"/>
        </el-form-item>
        <el-form-item label="收票人省份：" prop="province">
          <en-region-picker :api="MixinRegionApi" :default="defaultRegions" @changed="regionChanged"/>
          <p>地址变更后您所有的增值税发票都将邮寄到新地址。</p>
        </el-form-item>
        <el-form-item label="收票人地址：" prop="detail_addr">
          <el-input v-model="adressForm.detail_addr"/>
        </el-form-item>
      </el-form>

  </div>
</li>
</template>
<script>
import * as API_Members from '@/api/members'
import * as API_Trade from '@/api/trade'
import { RegExp } from '@/ui-utils'
export default {
  name: 'vatospecial',
  props: ['receipt', 'getInventories', 'tabData'],
  data () {
    return {
      defaultRegions: null,
      // 发票内容统一设置
      content: '商品明细',
      receipt_method: '订单完成后开票',
      // 公司信息表单
      companyInformationForm: {},
      // 收票人地址表单
      adressForm: {},
      selectedRegion: {},
      // 发票表单规则
      authInfoRules: {
        member_name: [this.MixinRequired('请输入收票人姓名')],
        member_mobile:[
          this.MixinRequired('请输入收票人电话'),
          { validator: (rule, value, callback) => {
              if (!RegExp.mobile.test(value)) {
                callback(new Error('请输入正确的电话号码'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        content:[
          { required: true,
            validator: (rule, value, callback) => {
              if (!this.content.find(item => item.select)) {
                callback(new Error('请选择发票内容'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        detail_addr:[this.MixinRequired('请输入收票人地址')],
        province:[
          { required: true,
	          validator: (rule, value, callback) => {
              if (!this.adressForm.region) {
                callback(new Error('请输入收票人省份,【不能以空格开始】'))
              } else {
                callback()
              }
	          },
            trigger: 'blur'
          }
        ],
      },
      step1: true,
      step2: false,
      step3: false
    }
  },
  async created () {
    this.queryTicketInformation();
	  let _receipt;
	  if (this.receipt && this.receipt.receipt_type === 'VATOSPECIAL') {
      if (this.receipt.receipt_title) _receipt = this.receipt
    } else { // 获取收票人增票资质地址信息
      _receipt = await API_Members.queryTicketAdress()
    }
    if(_receipt.detail_addr) {
      this.adressForm = {
	      ...this.adressForm,
        detail_addr: _receipt.detail_addr,
        member_mobile: _receipt.member_mobile,
        member_name: _receipt.member_name
      };
      this.defaultRegions = [_receipt.province_id, _receipt.city_id, _receipt.county_id, _receipt.town_id]
    }
  },
  methods: {
    /** 获取赠票资质详情信息 */
    queryTicketInformation() {
	    API_Members.queryTicketInformation().then(response => {
        this.companyInformationForm = response
      })
    },
    regionChanged(object) {
      this.adressForm.region = object.last_id
      this.selectedRegion = object.regions
    },
    /** 保存 */
    submit (callback) {
      this.$refs.adressForm.validate((valid) => {
        if (!valid){
          this.$message.error('表单填写有误！');
          return
        }
        let { detail_addr, member_mobile, member_name, region } = this.adressForm;
        let params = {
          detail_addr,
          member_mobile,
          member_name,
          region,
          receipt_content: this.content,
          receipt_method: '订单完成后开票',
          receipt_type: 'VATOSPECIAL',
          tax_no: this.companyInformationForm.taxpayer_code,
          receipt_title: this.companyInformationForm.company_name,
          reg_tel: this.companyInformationForm.register_tel,
          bank_name: this.companyInformationForm.bank_name,
          bank_account: this.companyInformationForm.bank_account,
          reg_addr: this.companyInformationForm.register_address
        };
        delete params.status;
        API_Trade.setRecepit(params).then(() =>{
          this.$message.success('设置成功！');
          params.city_id = Number(this.selectedRegion.city_id)
          params.county_id = Number(this.selectedRegion.region_id)
          params.province_id = Number(this.selectedRegion.province_id)
          params.town_id = Number(this.selectedRegion.town_id)
          callback(params)
        })
      })
    }
  },
  beforeDestroy() {
    if (this.$parent.lastStepDom) {
      let layerBtn = document.querySelector('.layui-layer-btn');
      let layerBtnCancel = document.querySelector('.layui-layer-btn .layui-layer-btn1');
      if ( layerBtn && layerBtn.contains(this.$parent.lastStepDom)) {
        layerBtn.removeChild(this.$parent.lastStepDom)
      }
      layerBtnCancel ? layerBtnCancel.style.display = 'inline-block' : null
    }
  }
}
</script>

