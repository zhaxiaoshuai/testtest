<template>
  <van-popup id="receipt" v-model="show" position="bottom" style="height:100%;background-color:#f7f7f7">
    <van-nav-bar title="发票信息" fixed @click-right="$emit('close')">
      <i class="iconfont ea-icon-close" slot="right"/>
    </van-nav-bar>
    <div class="receipt-container">
      <!--发票类型列表 start-->
      <div class="item receipt-type">
        <div class="title-receipt-type">
          <span>发票类型</span>
          <span> {{ current_receipt_type | receiptType }} </span>
        </div>
        <!--发票类型列表-->
        <ul v-if="receipt_type_list.length" class="type-receipt-type">
          <li v-for="(receipt, index) in receipt_type_list" @click="handleToggleType(receipt)" :key="index">
            <div>
              <van-icon :name="receipt.checked ? 'checked' : 'check'"/>
              <span>{{ receipt.receipt_type | receiptType }}</span>
            </div>
            <p v-if="receipt.receipt_type === 'ELECTRO'">电子普通发票与普通纸质发票具有同等法律效力，支持报销入账</p>
            <p v-if="receipt.receipt_type === 'VATOSPECIAL'">我司依法开具发票，请您按照税法规定使用发票</p>
          </li>
        </ul>
        <p v-else >商家未开通任何发票</p>
      </div>
      <!--发票类型列表 end-->
      <div v-show="need_receipt">
        <!--发票抬头 start-->
        <div class="item receipt-head">
          <div class="title-receipt">
            <span>发票抬头</span>
            <span>{{ receiptForm.receipt_title }}</span>
          </div>
          <div v-show="current_receipt_type !== 'VATOSPECIAL'"  class="head-receipt-item" @click="handlePersonReceipt">
            <van-icon :name="receipt_title_type === 0 ? 'checked' : 'check'"/>
            <span>个人</span>
          </div>
          <div class="head-receipt-item" @click="handleChooseReceipt">
            <van-icon :name="receipt_title_type === 1 ? 'checked' : 'check'"/>
            <span>单位</span>
            <div v-show="current_receipt_type !== 'VATOSPECIAL' && receipt_title_type === 1" class="receipt-word">
              <input
                v-model="receiptForm.receipt_title"
                placeholder="请填写单位名称"
                @focus="show_receipts = true"
                @blur="handleOutReceipt"
              >
              <div v-if="receipts.length && show_receipts" class="receipts">
                <div
                  class="rep-item"
                  v-for="(rep, index) in receipts"
                  :key="index"
                  @click.stop="handleSelectReceipt(rep)"
                >
                  {{ rep.receipt_title }}
                </div>
              </div>
            </div>
          </div>
          <div class="head-receipt-item" v-show="current_receipt_type !== 'VATOSPECIAL' && receipt_title_type === 1">
            <span class="head-receipt-item-no">税号</span>
            <div class="receipt-word-no">
              <input v-model="receiptForm.tax_no" autocomplete="off" placeholder="请输入纳税人识别号">
            </div>
          </div>
        </div>
        <!--发票抬头 end-->
        <!--收票人信息 start-->
        <div class="item receiver-info" v-show="current_receipt_type === 'ELECTRO'">
          <div class="title-receipt">
            <strong>收票人信息</strong>
          </div>
          <van-cell-group>
            <van-field
              v-model="receiptForm.member_mobile"
              required
              size="mini"
              clearable
              maxlength="11"
              type="tel"
              label="收票人手机"
              placeholder="请输入收票人手机"
            />
            <van-field
              v-model="receiptForm.member_email"
              type="email"
              size="mini"
              label="收票人邮箱"
              placeholder="请输入收票人邮箱"
            />
          </van-cell-group>
        </div>
        <!--收票人信息 end-->
        <!--收票信息 start-->
        <div class="item receiver-info" v-show="current_receipt_type === 'VATOSPECIAL'">
          <div class="title-receipt">
            <strong>收票信息</strong>
          </div>
          <van-cell-group>
            <van-field
              v-model="receiptForm.member_name"
              size="mini"
              clearable
              label="收票人"
              placeholder="请输入收票人姓名"
            />
            <van-field
              v-model="receiptForm.member_mobile"
              type="tel"
              size="mini"
              label="手机号"
              maxlength="11"
              placeholder="请输入收票人手机号"
            />
            <van-field
              v-model="receiptForm.address"
              readonly
              label="省市区县"
              placeholder="请选择所在地区"
              icon="arrow"
              size="mini"
              @click.native="showAddressSelector = true"
            />
            <van-field
              v-model="receiptForm.detail_addr"
              type="text"
              size="mini"
              label="详细地址"
              placeholder="请输入详细地址"
            />
          </van-cell-group>
        </div>
        <!--收票信息 end-->
        <!--发票内容 start-->
        <div class="item receipt-content">
          <div class="title-receipt">
            <span>发票内容</span>
            <span>{{ receiptForm.receipt_content }}</span>
          </div>
          <p class="receipt-tip" v-show="isShowtip">
            根据国家相关规定，发票的开票内容需与购买的商品一致，暂不支持手动选择开票内容。
            <van-icon name="close" class="receipt-tip-close" @click="isShowtip = false"/>
          </p>
          <ul class="content-receipt">
            <li
              v-for="(item, _index) in receipt_contents"
              v-show="item.receipt_type === current_receipt_type || !item.receipt_type"
              :key="_index"
              @click="handleChooseContent(item)">
              <div>
                <van-icon :name="item.code ? 'checked' : 'check'"/>
                <span>{{ item.receipt_content }}</span>
              </div>
              <p v-show="!item.receipt_type && current_receipt_type !== 'VATOSPECIAL'">商品明细显示详细商品名称及价格信息</p>
              <p v-show="item.receipt_type === 'ELECTRO'">本单可开发票内容:商品类别集合。</p>
            </li>
          </ul>
        </div>
        <!--发票内容 end-->
        <!--明细 start-->
        <div class="item detailed" v-show="current_receipt_type === 'VATOSPECIAL'">
          <div class="title-receipt">
            <span>明细</span>
          </div>
          <ul>
            <li>
              <span>单位名称：</span>
              <span>{{ invoiceInfo.company_name }}</span>
            </li>
            <li>
              <span>纳税人识别号：</span>
              <span>{{ invoiceInfo.taxpayer_code }}</span>
            </li>
            <li>
              <span>注册地址：</span>
              <span>{{ invoiceInfo.register_address }}</span>
            </li>
            <li>
              <span>注册电话：</span>
              <span>{{ invoiceInfo.register_tel }}</span>
            </li>
            <li>
              <span>开户银行：</span>
              <span>{{ invoiceInfo.bank_name }}</span>
            </li>
            <li>
              <span>银行账户：</span>
              <span>{{ invoiceInfo.bank_account }}</span>
            </li>
          </ul>
        </div>
        <!--明细 end-->
      </div>
    </div>
    <div class="big-btn">
      <van-button type="danger" @click="handleConfirmReceipt" id="SaveBtn">保存</van-button>
    </div>
    <en-region-picker
      :show="showAddressSelector"
      :api="MixinRegionApi"
      :default="regions"
      @closed="showAddressSelector = false"
      @changed="handleAddressSelectorChanged"
    />
  </van-popup>
</template>

<script>
  /**
   * 结算页
   * 发票组件
   */
  import Vue from 'vue'
  import { Popup,NoticeBar, Button } from 'vant'
  Vue.use(Popup).use(NoticeBar).use(Button)
  import * as API_Members from '@/api/members'
  import * as API_Trade from '@/api/trade'
  import { RegExp } from '@/ui-utils'
  export default {
    name: 'checkout-receipt',
    props: ['show', 'receipt', 'seller-ids'],
    data() {
      return {
        // 当前选择的发票类型
        current_receipt_type: '',
        // 发票原始类型列表
        receipt_type_menu: [
          { show_detail: false, name: '增值税普通发票', status: 'ordin_receipt_status', checked: false, receipt_type: 'VATORDINARY'},
          { show_detail: false, name: '电子普通发票',  status: 'elec_receipt_status', checked: false, receipt_type: 'ELECTRO'},
          { show_detail: false, name: '增值税专用发票', status: 'tax_receipt_status', checked: false, receipt_type: 'VATOSPECIAL'}
        ],
        // 发票类型列表
        receipt_type_list: [],
        // 需要发票
        need_receipt: false,
        // 发票表单
        receiptForm: {
          member_name: '',
          // 发票抬头
          receipt_title: '',
          //发票内容
          receipt_content: '不开发票',
          // 发票类型
          receipt_type: '',
          // 纳税人识别号
          tax_no: '',
          address: '',
          member_mobile: ''
        },
        // 开票方式
        receipt_method: '订单完成后开票',
        // 上次选择的单位发票抬头
        last_receipt_title: '',
        // 发票抬头类型 个人为0 单位为1
        receipt_title_type: 0,
        // 发票内容列表 code为代号 false 未选
        receipt_contents: [
          {
            receipt_content: '商品明细',
            code: false,
            // 显示所对应的发票类型 '' 代表对应所有
            receipt_type: ''
          },
          {
            receipt_content: '商品类别',
            code: false,
            // 显示所对应的发票类型 ELECTRO=>电子普通发票
            receipt_type: 'ELECTRO'
          }
        ],
        // 增票资质详情信息
        invoiceInfo: '',
        // 增票资质地址信息
        invoiceAddressInfo: '',
        // 会员发票列表
        receipts: [],
        // 显示已有发票
        show_receipts: false,
        /** 是否显示地址选择器 */
        showAddressSelector: false,
        regions: '',
        // 是否显示提示信息 默认显示 状态为true
        isShowtip: true,
        // 页面高度
        clientHeight:document.documentElement.clientHeight
      }
    },
    filters: {
      receiptType(type) {
        switch (type) {
          case 'VATORDINARY' : return '增值税普通发票'
          case 'ELECTRO' : return '电子普通发票'
          case 'VATOSPECIAL' : return '增值税专用发票'
          default: return '不开发票'
        }
      }
    },
    mounted() {
      this.init()
      window.onresize = () => {
        if (this.clientHeight > document.documentElement.clientHeight) {
          $('#SaveBtn').hide()
        } else {
          $('#SaveBtn').show()
        }
      }
    },
    watch: {
      sellerIds: 'init',
      show() {
        // 如果存在发票信息
        if (this.receipt && this.receipt.receipt_title) {
          this.receiptForm = { ...this.receipt }
          const _receipt = this.receipts.find(key => key.receipt_title === this.receiptForm.receipt_title)
          if (_receipt && _receipt.receipt_id) {
            this.receiptForm.receipt_id = _receipt.receipt_id
          }

          if (this.receipt.receipt_type === 'VATOSPECIAL') {
            this.receiptForm.receipt_title = this.invoiceInfo.company_name || '单位'
            this.receiptForm.detail_addr = this.receipt.detail_addr
            // this.receiptForm.vmember_mobile = this.receipt.member_mobile
            this.receiptForm.member_name = this.receipt.member_name
            this.regions = [this.receipt.province_id, this.receipt.city_id, this.receipt.county_id, this.receipt.town_id]
            this.receiptForm.address = `${this.receipt.province} ${this.receipt.city} ${this.receipt.county} ${this.receipt.town}`
            this.handleToggleType(this.receipt_type_list.find(item => item.receipt_type == this.receipt.receipt_type))
          }
          this.receipt_contents.forEach(item => {
            if (item.receipt_content === this.receipt.receipt_content) {
              item.code = true
            } else {
              item.code = false
            }
          })

        } else { // 如果不存在发票信息
          this.handleToggleType(this.receipt_type_list[0])
        }
        this.receipt_title_type = this.receiptForm.receipt_title === '个人' ? 0 : 1
      }
    },
    methods: {
      /** 函数节流隐藏元素 */
      handleOutReceipt() {
        setTimeout(() => {
          this.show_receipts = false
        }, 50)
      },
      /** 初始化发票信息 */
      init() {
        if(this.sellerIds) {
          API_Members.queryMembersReceipt(this.sellerIds).then(async response => {
            this.receipt_type_list.push({ show_detail: false, name: '不开发票', status: '', checked: false, receipt_type: '' })
            const _receipt_type_list = this.receipt_type_menu.filter(item => response[item.status] === 1)
            this.receipt_type_list = [ ...this.receipt_type_list, ..._receipt_type_list ]
            // 如果商家开启专票
            if (response.tax_receipt_status === 1) {
              // 获取赠票资质基础信息
              this.GET_InvoiceInfo()
              this.invoiceAddressInfo = await API_Members.queryTicketAdress()
            }
            // 如果没有发票信息
            if (!this.receipt) {
              this.receipt_type_list.forEach(key => {
                if(!key.receipt_type) key.checked = true
              })
            } else { // 如果有自带发票信息
              this.receiptForm = { ...this.receipt }
              this.current_receipt_type = this.receipt.receipt_type
              this.receipt_type_list.forEach(key => {
                if (key.receipt_type === this.current_receipt_type) key.checked = true
              })
              if (this.current_receipt_type === 'VATORDINARY' || this.current_receipt_type === 'VATOSPECIAL') {
                const _receipt = this.receipt_contents.find(key => key.receipt_content === this.receiptForm.receipt_content)
                if(_receipt && _receipt.code !== undefined && _receipt.code !== null) {
                  _receipt.code = true
                }
              }
              this.need_receipt = true
              this.GET_ReceiptList()
            }
          })
        }
      },
      /** 切换发票类型 */
      async handleToggleType(receipt) {
        this.isShowtip = true
        // 切换发票校验
        if(receipt.checked) return
        if(this.invoiceInfo && this.invoiceInfo.status !== 'AUDIT_PASS') {
          this.$message.error('会员还未申请增票资质或者申请审核未通过')
          return
        }
        // 获取当前发票类型 并且选择当前发票相关信息
        this.current_receipt_type = receipt.receipt_type
        // 获取会员发票列表
        await this.GET_ReceiptList()
        // 选定发票内容 如果是增值税普通发票/专用发票 内容为商品明细； 电子发票可选类别【商品明细 | 商品类别】
        if (this.current_receipt_type === 'VATORDINARY' || this.current_receipt_type === 'VATOSPECIAL' || this.current_receipt_type === 'ELECTRO') {
          // 设置发票内容
          this.receipt_contents.forEach(key => key.code = false)
          this.receipt_contents.find(key => key.receipt_content === '商品明细').code = true
          this.receiptForm.receipt_content = '商品明细'
        }
        if(this.current_receipt_type === 'VATORDINARY' || this.current_receipt_type === 'ELECTRO') {
          // 设置发票抬头 如果不存在发票则首先选中默认发票 否则选中 个人
          const _receipt = this.receipts.find(key => key.is_default === 1)
          if(_receipt) {
            this.receiptForm = JSON.parse(JSON.stringify(_receipt))
            this.receipt_title_type = 1
          } else {
            // this.receiptForm = {}
            this.receiptForm.receipt_title = '个人'
            this.receipt_title_type = 0
          }
        }
        if (this.current_receipt_type === 'VATOSPECIAL') {
          this.receipt_title_type = 1
          this.receiptForm.receipt_title = this.invoiceInfo.company_name || '单位'
          this.receiptForm.detail_addr = this.invoiceAddressInfo.detail_addr
          this.receiptForm.member_mobile = this.invoiceAddressInfo.member_mobile
          this.receiptForm.member_name = this.invoiceAddressInfo.member_name
          this.regions = [this.invoiceAddressInfo.province_id, this.invoiceAddressInfo.city_id, this.invoiceAddressInfo.county_id, this.invoiceAddressInfo.town_id]
          this.receiptForm.address = `${this.invoiceAddressInfo.province || ''} ${this.invoiceAddressInfo.city || ''} ${this.invoiceAddressInfo.county || ''} ${this.invoiceAddressInfo.town || ''}`

          if (this.receipt) {
            this.receiptForm.detail_addr = this.receipt.detail_addr
            this.receiptForm.member_mobile = this.receipt.member_mobile
            this.receiptForm.member_name = this.receipt.member_name
            this.regions = [this.receipt.province_id, this.receipt.city_id, this.receipt.county_id, this.receipt.town_id]
            this.receiptForm.address = `${this.receipt.province || ''} ${this.receipt.city || ''} ${this.receipt.county || ''} ${this.receipt.town || ''}`
          }
          this.receiptForm.address = this.receiptForm.address.replace(/\s+/g, '')
          this.handleChooseReceipt()
        }
        this.receipt_type_list.forEach(key => key.checked = false)
        receipt.checked = true
        this.need_receipt = !!receipt.receipt_type
      },
      /** 地址选择器发生改变 */
      handleAddressSelectorChanged(object) {
        this.receiptForm.region = object.last_id
        this.receiptForm.address = object.string
      },
      /** 选择发票抬头类型 */
      handleSelectReceipt(receipt) {
        this.show_receipts = false
        this.receiptForm = { ...receipt }
        this.last_receipt_title = this.receiptForm.receipt_title
      },
      // 当选择个人发票类型的时候 设置发票抬头为 '个人' 发票抬头类型为0 税号为 ''
      handlePersonReceipt() {
        this.receiptForm.tax_no = ''
        this.receiptForm.receipt_title = '个人'
        this.receipt_title_type = 0
      },
      // 当选择非个人发票类型的时候 匹配默认发票
      handleChooseReceipt() {
        if (this.current_receipt_type === 'VATOSPECIAL') {
         this.receiptForm.member_mobile = ''
          return
        }
        this.receiptForm.receipt_title = ''
        this.receiptForm.tax_no = ''
        let _receipt
        if (this.receiptForm.receipt_id && this.last_receipt_title) {
          _receipt = this.receipts.find(key => key.receipt_title === this.last_receipt_title)
        } else {
          _receipt = this.receipts.find(key => key.is_default === 1)
        }
        if (_receipt) {
          this.receiptForm = { ..._receipt }
          if(!_receipt.receipt_content) {
            this.receipt_contents.forEach(key => key.code = false)
          }
        }
        this.last_receipt_title = this.receiptForm.receipt_title
        this.receipt_title_type = 1
      },
      // 选择发票内容
      handleChooseContent(item) {
        this.receiptForm.receipt_content = item.receipt_content
        this.receipt_contents.forEach(key => key.code = false)
        item.code = true
      },
      /** 确认发票 */
      handleConfirmReceipt() {
        if (!this.need_receipt) { // 如果不需要发票 则调用取消发票API
          API_Trade.cancelReceipt().then(() => {
            this.$emit('changed', {})
            this.$emit('close')
          })
          return false
        }
        const _speparams = {
          receipt_method: this.receipt_method,
          bank_name: this.invoiceInfo.bank_name,
          bank_account: this.invoiceInfo.bank_account,
          reg_addr: this.invoiceInfo.register_address,
          reg_tel: this.invoiceInfo.register_tel,
          member_name: this.receiptForm.member_name,
          region: this.receiptForm.region,
          detail_addr: this.receiptForm.detail_addr,
          address: this.receiptForm.address,
          tax_no: this.invoiceInfo.taxpayer_code
        }
        const _elecparams = {
          member_mobile: this.receiptForm.member_mobile,
          member_email: this.receiptForm.member_email,
          province: this.receiptForm.province
        }
        let params = {
          // 发票类型
          receipt_type: this.current_receipt_type,
          // 发票抬头
          receipt_title: this.receiptForm.receipt_title,
          // 发票内容
          receipt_content: this.receiptForm.receipt_content,
          // 税号
          tax_no: this.receiptForm.tax_no
        }
        if(this.current_receipt_type === 'ELECTRO') {
          params = {
            ...params,
            ..._elecparams
          }
        }
        if (this.current_receipt_type === 'VATOSPECIAL') {
          params = {
            ...params,
            ..._elecparams,
            ..._speparams
          }
        }
        // 校验
        // 抬头
        if(!params.receipt_title) {
          this.$message.error('请填写发票抬头')
          return false
        }
        // 税号
        if (params.receipt_title !== '个人' && params.tax_no && !RegExp.TINumber.test(params.tax_no)) {
          this.$message.error('纳税人识别号不正确')
          return false
        }
        // 验证是否相同
        API_Trade.setRecepit(params).then(() => {
          // 如果对发票列表进行操作 编辑/新增单位发票  如果操作增值税普通发票并且抬头不是个人 则调用以下API
          if(this.current_receipt_type !== 'VATOSPECIAL' && params.receipt_title !== '个人') {
            const isEdit = !!(this.receiptForm.receipt_id && this.receipts.find(key => key.receipt_title === this.receiptForm.receipt_title))
            Promise.all([
              isEdit
                ? API_Members.editReceipt(this.receiptForm.receipt_id, params)
                : API_Members.addReceipt(params)
            ]).then(async () => {
              this.$message.success('设置成功！')
              this.$emit('changed', params)
              this.$emit('close')
              await this.GET_ReceiptList()
            })
          } else {
            this.$message.success('设置成功！')
            this.$emit('changed', params)
            this.$emit('close')
          }
        })
      },
      /** 获取发票列表 */
      async GET_ReceiptList() {
        if (this.current_receipt_type === 'VATORDINARY' || this.current_receipt_type === 'ELECTRO') {
          this.receipts = await API_Members.getReceipts(this.current_receipt_type)
        }
      },

      /** 获取增票资质详情信息 */
      GET_InvoiceInfo() {
        return API_Members.queryInvoiceInfo().then(response => {
          this.invoiceInfo = response
          return response
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  @import "../../assets/styles/color";
  /*样式重置*/
  .van-button{
    position: fixed;
    left: 0;
    bottom: 0;
  }
  /deep/ {
    .van-icon-check {
      font-size: 14px;
      display: inline-block;
    }
    .van-icon-checked {
      font-size: 14px;
      color: $color-main;
    }
  }
  .receipt-container {
    padding-top: 46px;
    height: calc(100% - 46px - 44px);
    overflow-y: scroll;
    /*发票类型列表*/
    .title-receipt-type {
      padding-bottom: 10px;
      overflow: hidden;
      span {
        display: inline-block;
        font-size: 14px;
        color: #232326;
      }
      span:first-child {
        float: left;
        font-weight: bold;
      }
      span:last-child {
        float: right;
      }
    }
    .type-receipt-type {
      padding-bottom: 10px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      & > li {
        padding: 10px;
        font-size: 14px;
        width: calc(100% - 20px);
        border-bottom: 1px solid #f1f1f1;
        & > div {
          display: flex;
          align-items: center;
          span {
            display: inline-block;
            margin-left: 6px;
          }
        }
        p {
          color: #999;
          font-size: 12px;
          padding-left: 18px;
        }
      }
    }

    /*发票抬头*/
    .item {
      position: relative;
      margin-bottom: 10px;
      padding: 10px;
      background-color: #fff;
    }
    .title-receipt {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      span:first-child, strong {
        font-weight: bold;
        font-size: 14px;
        color: #777;
      }

    }

    .head-receipt-item {
      display: flex;
      align-items: center;
      font-size: 14px;
      &:not(:last-child) {
        padding: 10px 3px;
        border-top: 1px solid #f1f1f1;
      }

      & > span {
        display: inline-block;
        margin-left: 10px;
        margin-right: 10px;
        font-size: 14px;
      }
      span.head-receipt-item-no {
        margin-left: 28px;
      }
    }
    .receipt-word {
      width: 80%;
      position: relative;
      input {
        width: 90%;
        height: 26px;
        background: #f0f2f5;
        border: none;
        outline: none;
        padding: 2px 5%;
        margin: 8px 0 0 0;
        -webkit-appearance: none;
      }
    }
    .receipt-word-no {
      width: 78.4%;
      position: relative;
      input {
        width: 90%;
        height: 26px;
        background: #f0f2f5;
        border: none;
        outline: none;
        padding: 2px 5%;
        margin: 8px 0 0 0;
        -webkit-appearance: none;
      }
    }
    /*发票内容*/
    .receipt-tip {
      display: flex;
      color: #f85;
      padding: 9px 20px 9px 15px;
      font-size: 12px;
      line-height: 1.5;
      position: relative;
      background-color: #fff7cc;
      .receipt-tip-close {
        position: absolute;
        right: 5px;
        top:19px;
        font-size: 16px;
      }
    }
    .content-receipt {
      padding: 0 10px 10px 0;
      & > li {
        width: 100%;
        padding: 10px 0;
        &:not(:last-child) {
          border-bottom: 1px solid #f1f1f1;
        }
        & > div {
          display: flex;
          align-items: center;
        }
        span {
          display: inline-block;
          margin-left: 10px;
          font-size: 14px;
        }
        p {
          color: #777;
          font-size: 12px;
          padding-left: 24px;
        }
      }
    }
    .receipts {
      position: absolute;
      top: 40px;
      width: 100%;
      background-color: #fff;
      box-shadow: 0 5px 16px 0 #ccc;
      z-index: 10;
      .rep-item {
        padding: 5px;
      }
    }
    /*明细*/
    .detailed {
      padding: 10px;
      .title-receipt {
        padding: 5px 0;
      }
      ul {
        border-top: 1px solid #f1f1f1;
        li {
          padding: 5px;
        }
      }
    }
  }
</style>
