<template>
  <div id="increase-ticket">
    <div class="member-nav">
      <ul class="member-nav-list">
        <li class="active">
          <a href="./increase-ticket">增票资质</a>
        </li>
      </ul>
    </div>
    <div class="ticket-container">
      <div class="list-tips">
        <ul>
          <li>我们会在一个工作日内完成审核工作。</li>
          <li>1）注意有效增值税发票开票资质仅为一个。</li>
          <li style="color:#f42424;">2）本页面信息仅供增值税专用发票-资质审核使用，切勿进行支付相关业务，谨防上当受骗。</li>
        </ul>
        <div class="audit-status" v-if="informationFormExist && informationFormExist.status">
          <div class="wait-status" v-if="informationFormExist.status === 'NEW_APPLY'">
            <strong>您的增票资质：</strong>
            <span style="color:#71b247;">平台审核中</span>
          </div>
          <div class="adopt-status" v-if="informationFormExist.status === 'AUDIT_PASS'">
            <strong>您的增票资质：</strong>
            <span style="color:#71b247;">已通过审核</span>
            <el-button size="mini" @click="isEditorInvoice = true">修改</el-button>
            <el-button
              size="mini"
              plain
              type="danger"
              @click="adoptStatusDelete">删除</el-button>
          </div>
          <div class="fail-status" v-if="informationFormExist.status === 'AUDIT_REFUSE'">
            <ul>
              <li>
                <strong>您的增票资质：</strong>
                <span style="color:#f42424;">未通过审核</span>
                <el-button size="mini" @click="refreshAdoptStatus">重新审核</el-button>
              </li>
              <li>
                <strong>原因：</strong>
                <span style="color:#f42424;">{{ informationFormExist.audit_remark || '单位名称不符合规范'}}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="ticket-information" v-if="isEditorInvoice">
        <h4>填写增票资质信息<i>（所有信息均为必填）</i></h4>
        <el-form
          :model="informationForm"
          :rules="authInfoRules"
          ref="informationForm"
          size="mini"
          label-width="130px"
          class="ticket-form">
          <el-form-item label="单位名称：" prop="company_name">
            <el-input v-model="informationForm.company_name" :maxlength="20"/>
          </el-form-item>
          <el-form-item label="纳税人识别号：" prop="taxpayer_code">
            <el-input v-model="informationForm.taxpayer_code" :minlength="15" :maxlength="20"/>
          </el-form-item>
          <el-form-item label="注册地址：" prop="register_address">
            <el-input v-model="informationForm.register_address"/>
          </el-form-item>
          <el-form-item label="注册电话：" prop="register_tel">
            <el-input v-model="informationForm.register_tel" :maxlength="13"/>
          </el-form-item>
          <el-form-item label="开户银行：" prop="bank_name">
            <el-input v-model="informationForm.bank_name"/>
          </el-form-item>
          <el-form-item label="银行账号：" prop="bank_account">
            <el-input v-model.trim="informationForm.bank_account" :maxlength="19"/>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-if="!informationFormExist" v-model="agreed" class="agreed">我已阅读并同意<el-button type="text" @click="openConfirm">《增票资质确认证书》</el-button></el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="ticketConfirm(informationForm)">确认</el-button>
            <el-button v-if="informationFormExist" @click="isEditorInvoice = isRefshExamine = false">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="ticket-information-exhibition"  v-if="!isEditorInvoice">
        <h4>增票资质信息</h4>
        <ul>
          <li>单位名称：{{informationForm.company_name}}</li>
          <li>纳税人识别号：{{informationForm.taxpayer_code}}</li>
          <li>注册地址：{{informationForm.register_address}}</li>
          <li>注册电话：{{informationForm.register_tel}}</li>
          <li>开户银行：{{informationForm.bank_name}}</li>
          <li>银行账号：{{informationForm.bank_account}}</li>
        </ul>
      </div>
      <div class="ticket-adress" v-if="informationFormExist">
        <template v-if="!adressFormObj">
          <h4>增票收票地址</h4>
          <div>您还未设置收票地址<el-button size="mini" style="margin-left:10px;" @click="isShow = true">立即设置</el-button></div>
        </template>
        <template v-if="adressFormObj && isShow">
          <h4>增票收票地址<el-button v-if="!isShow" size="mini" type="text" @click="editTicketAdress">修改</el-button></h4>
        </template>
        <el-form
          v-if="isShow"
          :model="adressForm"
          :rules="authInfoRules"
          ref="adressForm"
          size="mini"
          label-width="130px"
          class="ticket-form">
          <el-form-item label="收票人姓名：" prop="member_name">
            <el-input v-model="adressForm.member_name"/>
          </el-form-item>
          <el-form-item label="收票人手机号：" prop="member_mobile">
            <el-input v-model="adressForm.member_mobile" :maxlength="11"/>
          </el-form-item>
          <el-form-item label="所在地区：" prop="region">
            <en-region-picker :api="MixinRegionApi" :default="defaultRegions" @changed="(object) => { adressForm.region = object.last_id  }"/>
            <p>地址变更后您所有的增值税发票都将邮寄到新地址。</p>
          </el-form-item>
          <el-form-item label="详细地址：" prop="detail_addr">
            <el-input v-model="adressForm.detail_addr"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitAdressForm">确认</el-button>
            <el-button @click="isShow = false">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="ticket-information-exhibition" v-if="!isShow && adressFormObj && informationFormExist">
        <h4>增票收票地址<el-button size="mini" type="text" @click="editTicketAdress">修改</el-button></h4>
        <ul>
          <li>收票人姓名：{{adressFormObj.member_name}}</li>
          <li>收票人手机号：{{adressFormObj.member_mobile}}</li>
          <li>收票人省份：{{adressFormObj.province}}{{adressFormObj.city}}{{adressFormObj.county}}{{adressFormObj.town}}</li>
          <li>收票人地址：{{adressFormObj.detail_addr}}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import * as API_Members from '@/api/members'
  import { RegExp } from '@/ui-utils'
  import { mapState } from 'vuex'
  export default {
    name: 'increase-ticket',
    head() {
      return {
        title: `增票资质-${this.site.title}`
      }
    },
    data() {
      return {
        agreed: false,
        defaultRegions: null,
        /** 增票资质 表单 */
        informationForm: {},
        /** 收票地址 表单 */
        adressForm: {},
        /** 基础信息 表单规则 */
        authInfoRules: {
          company_name: [this.MixinRequired('请输入公司名称')],
          taxpayer_code: [
            this.MixinRequired('请填写纳税人识别号！'),
            {
              validator: (rule, value, callback) => {
                if (!RegExp.TINumber.test(value)) {
                  callback(new Error('纳税人识别号不正确'))
                } else {
                  callback()
                }
              },
              trigger: 'blur'
            }
          ],
          register_address: [this.MixinRequired('请输入注册地址')],
          register_tel: [
            this.MixinRequired('请输入注册电话'),
            { validator: (rule, value, callback) => {
                if (RegExp.TEL.test(value) || RegExp.mobile.test(value)) {
                  callback()
                } else {
                  callback(new Error('请输入正确的注册电话'))
                }
              },
              trigger: 'blur'
            }
          ],
          bank_name: [this.MixinRequired('请输入开户银行')],
          bank_account: [this.MixinRequired('请输入银行账号')],
          member_name:[this.MixinRequired('请输入收票人姓名')],
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
          detail_addr:[this.MixinRequired('请输入收票人地址')],
          region:[
            { required: true,
              validator: (rule, value, callback) => {
                if (!this.adressForm.region) {
                  callback(new Error('请输入所在地区'))
                } else {
                  callback()
                }
              },
              trigger: 'blur'
            }
          ]
        },

        /** 是否修改增票信息 */
        isEditorInvoice: false,
        /** 是否重新审核 */
        isRefshExamine: false,
        /**获取增票信息 */
        informationFormExist: '',

        isShow: false,
        /**获取现有的收票地址信息 */
        adressFormObj: ''

      }
    },
    computed: {
      ...mapState({
        user: state => state.user.user
      })
    },
    watch: {
      informationFormExist(obj) {
        let {company_name, taxpayer_code, register_address, register_tel, bank_name, bank_account } = obj;
        this.informationForm = {
          company_name,
          taxpayer_code,
          register_address,
          register_tel,
          bank_name,
          bank_account
        }
      }
    },
    methods: {
      /** 增票资质确认书 */
      openConfirm() {
        this.$alert(`
          根据国家税法及发票管理相关规定，任何单位和个人不得要求他人为自己开具与实际经营业务情况不符的增值税专用发票【包括并不限于<br/>
          （1）在没有货物采购或者没有接受应税劳务的情况下要求他人为自己开具增值税专用发票；<br/>
          （2）虽有货物采购或者接受应税劳务但要求他人为自己开具数量或金额与实际情况不符的增值税专用发票】，否则属于“虚开增值税专用发票”。<br/>
          我已充分了解上述各项相关国家税法和发票管理规定，并确认仅就我司实际购买商品或服务索取发票。<br/>
          如我司未按国家相关规定申请开具或使用增值税专用发票，由我司自行承担相应法律后果。
        `, () => {}, {
          dangerouslyUseHTMLString: true,
          title: '申请开具增值税专用发票确认书',
          area: '50%'
        });
      },
      /** 删除增票资质 */
      adoptStatusDelete(){
        this.$confirm('您选择的增值税发票资质将被删除，删除后将不可修复。是否确认？',
          idnex => {
            API_Members.deleteTicketInformation(this.informationFormExist.id).then(res => {
              this.queryTicketInformation();
              this.isEditorInvoice = true
            }).catch(() => this.$message.error('删除失败，请重试！'))
          },
          () => {
            this.$message.error('删除失败，请重试！')
          }
        )

      },
      /** 重新审核增票资质 */
      refreshAdoptStatus() {
        this.isEditorInvoice = this.isRefshExamine = true
      },
      /** 会员增票资质申请 */
      ticketConfirm(){
        this.$refs.informationForm.validate((valid) => {
          if (!valid) {
            this.$message.error('表单输入有误！');
            return false
          }
          if(!this.agreed && !this.informationFormExist) {
            this.$message.error('请先同意协议！');
            return false
          }
          /** 重新审核增票资质 */
          if (this.informationFormExist && this.isRefshExamine) {
            API_Members.changeTicketInformation({...this.informationFormExist, ...this.informationForm, status: 'NEW_APPLY'}).then(res => {
              this.queryTicketInformation();
              this.isRefshExamine = false;
              this.$message.success('重新审核成功，请耐心等待！')
            }).catch(() => this.$message.error('对不起，重新审核失败，请重试！'));
            return false
          }
          /** 修改增票资质信息 */
          if (this.informationFormExist) {
            API_Members.changeTicketInformation({...this.informationFormExist, ...this.informationForm}).then(res => {
              this.queryTicketInformation();
              this.$message.success('修改成功！')
            }).catch(() => this.$message.error('对不起，修改失败，请重试！'));
            return false
          }
          /** 申请增票资质 */
          API_Members.ticketInformationApply(this.informationForm).then(response =>{
            this.queryTicketInformation()
          }).catch()
        })
      },
      /** 获取会员增票信息详情 */
      queryTicketInformation() {
        return API_Members.queryTicketInformation().then(res => {
          res ? this.isEditorInvoice = false : this.isEditorInvoice = true;
          this.informationFormExist = res
        })
      },
      /** 增加收票人地址 */
      submitAdressForm() {
        this.$refs.adressForm.validate((valid) => {
          if (!valid) {
            this.$message.error('表单输入有误！');
            return false
          }
          const params = JSON.parse(JSON.stringify(this.adressForm));
          Promise.all([
            this.adressForm.id
	            ? API_Members.changeTicketAdress(params, this.adressForm.id)
	            : API_Members.ticketAdressApply(params)
          ]).then(_ => {
            this.$message.success('保存成功');
            this.queryTicketAdress();
            this.isShow = false
          })
        })
      },
      /** 修改收票人地址 */
      editTicketAdress() {
        this.adressForm = {
          id: this.adressFormObj.id || '',
          member_name: this.adressFormObj.member_name,
          member_mobile: this.adressFormObj.member_mobile,
          detail_addr: this.adressFormObj.detail_addr,
	        region: this.adressFormObj.town_id || this.adressFormObj.county_id
        };
        this.defaultRegions = [this.adressFormObj.province_id, this.adressFormObj.city_id, this.adressFormObj.county_id, this.adressFormObj.town_id];
        this.isShow = true
      },
      queryTicketAdress() {
	      API_Members.queryTicketAdress().then(res => {
          if(res) this.adressFormObj = res
        })
      }
    },
    created() {
      /** 获取会员增票信息详情 */
      this.queryTicketInformation();
      this.queryTicketAdress()
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .ticket-container{
    padding-top: 15px;
    .list-tips{
      padding:0 0 20px 20px;
      overflow: hidden;
      li{
        line-height: 20px;
      }
    }
    .audit-status{
      background: #fffdee;
      border: 1px solid #edd28b;
      padding: 10px;
      margin-top:10px;
      span{
        margin-right:10px;
      }
    }
    .ticket-information,.ticket-adress{
      border-top:1px solid #ccc;
      padding-left:20px;
      h4{
        padding-top: 10px;
        i{
          color:#f42424;
        }
      }
    }
    .ticket-form{
      padding-top:10px;
      width:408px;
      overflow: hidden;
      p{
        font-size:10px;
        color: #f42424;
      }
    }
    .ticket-adress{
      /deep/ .ticket-form {
        overflow: inherit;
      }
    }
  }
  .ticket-information-exhibition{
    padding:0 0 20px 20px;
    li{
      line-height:30px;
    }
    h4{
      padding-top: 10px;
    }
  }
</style>
