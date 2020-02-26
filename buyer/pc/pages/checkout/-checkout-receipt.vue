<template>
  <div class="ckt-item receipt">
    <div class="top-ckt">
      <span class="title-top">发票信息</span>
      <div class="clearfix"></div>
    </div>
    <div class="content-ckt receipt" v-if="isShowMembersReceip">
      <div v-if="!receipt|| !receipt.receipt_title" class="item">无需发票</div>
      <template v-else>
	      <div class="item receipt-title">{{ receipt.receipt_type | receiptType }}</div>
        <div class="item receipt-title">{{ receipt.receipt_title }}</div>
        <div class="item receipt-content">{{ receipt.receipt_content }}</div>
      </template>
      <a href="javascript:" class="item edit-btn" @click="handleEditReceiptInfo">修改</a>
      <a v-if="receipt && receipt.receipt_title" href="javascript:" class="item cancel-btn" @click="handleCancelReceipt">取消发票</a>
    </div>
    <div class="content-ckt receipt" v-if="!isShowMembersReceip">
      <div class="item">该商家不支持开具发票</div>
    </div>
    <div id="receiptForm" class="receipt-layer" style="display: none">
      <div class="invoice-information">
        <ul style="" class="invoice-tab">
          <li v-for="item in tabData" :key="item.name" :class="[item.show ? 'current' : null]" @click="selectNav(item)">{{item.name}}</li>
        </ul>
        <ul class="invoice-content">
          <!-- 普通发票 -->
          <vatordinary
            v-if="tabData[0].show"
            :receipt="receipt"
            :getInventories="getInventories"
            :tabData="tabData[0]"
            ref="vatordinary"
          ></vatordinary>
          <!-- 电子普通发票 -->
          <electro
            v-if="tabData[1].show"
            :receipt="receipt"
            :getInventories="getInventories"
            :tabData="tabData[1]"
            ref="electro"
          ></electro>
          <!-- 增值税专用发票 -->
          <vatospecial
            v-if="tabData[2].show"
            :receipt="receipt"
            :getInventories="getInventories"
            :tabData="tabData[2]"
            ref="vatospecial"
          ></vatospecial>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  /**
   * 结算页
   * 发票组件
   */
  import * as API_Members from '@/api/members'
  import * as API_Trade from '@/api/trade'
  import { RegExp } from '@/ui-utils'
  export default {
    name: 'checkout-receipt',
    props: ['receipt', 'getInventories'],
    data() {
      return {
        // 标签数据
        tabData: [
          {show: false, name: '增值税普通发票', key: 'ordin_receipt_status', isChecked: false, receipt_type: 'VATORDINARY'},
          {show: false, name: '电子普通发票', key: 'elec_receipt_status', isChecked: false, receipt_type: 'ELECTRO'},
          {show: false, name: '增值税专用发票', key: 'tax_receipt_status', isChecked: false, receipt_type: 'VATOSPECIAL'}
        ],
        // 已选择发票
        selectedReceipt: this.receipt,
        // 发票类型数据
        membersReceiptInfo: {}
      }
    },
    computed: {
      isShowMembersReceip () {
        return Object.keys(this.membersReceiptInfo).some(item => this.membersReceiptInfo[item] === 1)
      }
    },
    filters: {
      receiptType(type) {
        switch (type) {
          case 'VATORDINARY' : return '增值税普通发票';
          case 'ELECTRO' : return '电子普通发票';
          case 'VATOSPECIAL' : return '增值税专用发票';
          default: return '不开发票'
        }
      }
    },
    components: {
      vatordinary: resolve => require(['./vatordinary.vue'], resolve),
      electro: resolve => require(['./electro.vue'], resolve),
      vatospecial: resolve => require(['./vatospecial.vue'], resolve),
    },
    async mounted() {
      /** 获取店铺是否开启某种发票 */
      await this.queryMembersReceiptInfo();
      const _receipt = this.receipt && this.receipt.receipt_type
	      ? this.tabData.filter(item => {
	        if (item.isChecked && item.receipt_type === this.receipt.receipt_type) return item
	      })
	      : this.tabData.filter(item => {
	        if (item.isChecked) return item
	      });
      if(_receipt && _receipt.length) { // 无论是否在已存在的发票 默认选中第一个
        _receipt[0].show = true;
        this.receipt_type = _receipt[0].receipt_type
      }
    },
    methods: {
      setReceipt () {
        let currentTabData = this.tabData.find(item => item.show);
        if (currentTabData.receipt_type === 'VATORDINARY') {
          this.$refs.vatordinary.handleConfirmReceipt(index, this)
        }
      },
      // 选取 对应的 发票内容
      selectContentMethod (itemContent) {
        this.content.forEach(item => item.id === itemContent.id ? item.select = true : item.select = false)
      },
      // 切换 不同的导航菜单
      selectNav (item) {
        document.querySelector('.layui-layer-btn .layui-layer-btn1').style.display = 'inline-block';
        document.querySelector('.layui-layer-btn .layui-layer-btn2').style.display = 'none';
        if(!item.isChecked) {
          this.$message.error('您还未申请增票资质或者该商家未开通此种发票');
          return
        }
        this.tabData.forEach(i => i.name === item.name ? i.show = true : i.show = false);
        this.selectedReceipt = {
          receipt_title: '个人',
          receipt_content: this.content
        };
        let layerNextBtn = document.querySelector('.layui-layer-iframe .layui-layer-btn, .layui-layer-page .layui-layer-btn .layui-layer-btn0');
        if (item.receipt_type === 'VATOSPECIAL') {
          layerNextBtn.innerHTML = '下一步';
        } else {
          layerNextBtn.innerHTML = '保存'
        }
      },
      /** 修改发票信息 */
      handleEditReceiptInfo() {
        this.$layer.open({
          type: 1,
          title: '发票信息',
          zIndex: 200,
          area: '550px',
          scrollbar: false,
          content: $('#receiptForm'),
          btn: ['保存', '取消', '返回'],
          yes: this.handleConfirmReceipt,
          success: (layero, index) => {
            let layerBtnBack = document.querySelector('.layui-layer-btn .layui-layer-btn2');
            layerBtnBack.style.display = 'none';
            let layerNextBtn = document.querySelector('.layui-layer-iframe .layui-layer-btn, .layui-layer-page .layui-layer-btn .layui-layer-btn0');
            let current = this.tabData.find(item => item.show);
            if (current && current.receipt_type === 'VATOSPECIAL') {
              if(this.$refs.vatospecial.step2 || this.$refs.vatospecial.step1) {
                if (layerNextBtn.innerHTML === '保存') {
                  layerNextBtn.innerHTML = '下一步'
                }
              }
              if (this.$refs.vatospecial.step3 || this.$refs.vatospecial.step2) {
                document.querySelector('.layui-layer-btn .layui-layer-btn1').style.display = 'none';
                layerBtnBack.style.display = 'inline-block';
              } else {
                layerNextBtn.innerHTML = '下一步'
              }
            } else {
              layerNextBtn.innerHTML = '保存'
            }
          },
          btn3: () => {
            let { step1, step2, step3 } = this.$refs.vatospecial;
            let layerBtnCancel = document.querySelector('.layui-layer-btn .layui-layer-btn1');
            let layerBtnBack = document.querySelector('.layui-layer-btn .layui-layer-btn2');
            if (!step1 && !step2 && step3) {
              this.$refs.vatospecial.step2 = true;
              this.$refs.vatospecial.step3 = false;
              document.querySelector('.layui-layer-btn .layui-layer-btn0').innerHTML = '下一步'
            } else if (!step1 && step2 && !step3) {
              this.$refs.vatospecial.step1 = true;
              this.$refs.vatospecial.step2 = false;
              layerBtnCancel.style.display = 'inline-block';
              layerBtnBack.style.display = 'none';
            }
            return false
          }
        })
      },
      /** 确认发票 */
      handleConfirmReceipt(index) {
        let currentTabData = this.tabData.find(item => item.show);
        if (currentTabData.receipt_type === 'VATORDINARY') {
          this.$refs.vatordinary.handleConfirmReceipt(index, payload => {
            this.$emit('change', payload);
            this.$layer.close(index)
          });

        } else if (currentTabData.receipt_type === 'ELECTRO') {
          this.$refs.electro.handleConfirmReceipt(index, payload => {
            this.$emit('change', payload);
            this.$layer.close(index)
          })
        } else if (currentTabData.receipt_type === 'VATOSPECIAL') {
          let layerBtn = document.querySelector('.layui-layer-btn');
          let layerBtnCancel = document.querySelector('.layui-layer-btn .layui-layer-btn1');
          let layerBtnBack = document.querySelector('.layui-layer-btn .layui-layer-btn2');
          let { step1, step2, step3 } = this.$refs.vatospecial;

          if (step1 && !step2 && !step3) {
            layerBtnBack.style.display = 'inline-block';
            layerBtnCancel.style.display = 'none';
            this.$refs.vatospecial.step1 = false;
            this.$refs.vatospecial.step2 = true
          } else if (!step1 && step2 && !step3) {
            this.$refs.vatospecial.step2 = false;
            this.$refs.vatospecial.step3 = true;
            document.querySelector('.layui-layer-btn .layui-layer-btn0').innerHTML = '保存'
          } else if (!step1 && !step2 && step3) {
            this.$refs.vatospecial.submit(payload => {
              this.$emit('change', payload);
              this.$layer.close(index)
            })
          }
        }
      },
      /** 取消发票 */
      handleCancelReceipt() {
        this.$confirm('确定要取消发票吗？', () => {
          API_Trade.cancelReceipt().then(() => {
            this.$message.success('取消成功！');
            this.$emit('change', {})
          })
        })
      },
      /** 获取店铺是否开启某种发票 */
      async queryMembersReceiptInfo () {
        let inventoryList = await this.getInventories();
        let seller_id_arr = inventoryList.map(item => item.seller_id);
        if(seller_id_arr.length){
          const response = await API_Members.queryMembersReceipt(seller_id_arr);
          this.membersReceiptInfo = response;
          this.tabData.forEach(item => item.isChecked = !!response[item.key])
        }
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .on {
    background: #00c1b9;
    color: #fff;
  }
  @import "../../assets/styles/color";
  /deep/ {
    .receipt-layer {
      padding: 10px 30px;
      .add-receipt {
        color: rgb(0, 94, 167)
      }
      .increment-receipt{
        .increment-type,.receipt-content{
          overflow: hidden;
        }
        .increment-type-title,.receipt-content-title{
          float: left;
          padding-right:10px;
          height:30px;
          line-height: 30px;
         }
        .selected{
          width: 90px;
        }
      }
      .invoice-information{
        .invoice-tab{
          display: flex;
          padding-bottom:10px;
          li{
            padding:0 15px;
            height: 26px;
            line-height: 26px;
            border: 1px solid #dddddd;
            margin-right:10px;
            cursor: pointer;
          }
          .current{
            height: 24px;
            line-height: 24px;
            border: 2px solid #f42424;
            background: url("../../assets/images/icon-ckt-selected.png") no-repeat bottom right;
            background-size: 20px 20px;
          }
        }
        .invoice-content{
          .message-tips{
            padding:10px;
            background: #fffaea;
            margin-bottom: 30px;
          }
        }
      }
      .title-receipt {
        padding-left: 10px;
        max-width: 300px;
        text-align: left;
        margin-bottom: 10px;
        .title {
          display: inline-block;
          width: 220px;
          height: 24px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .company-receipt-input, .title-btns {
          display: none;
        }
        .company-receipt-input {
          width: 220px;
          height: 100%;
        }
        .title-btns {
          width: 70px;
          float: right;
          .btn {
            margin-right: 7px;
            color: #005ea7;
            &:hover {
              color: $color-main;
            }
            &.save-btn, &.cancel-btn {
              display: none;
            }
          }
        }
        &.selected {
          .title-btns {
            .delete-btn { cursor: not-allowed }
          }
        }
        &.editting {
          .company-receipt-input, .title-btns {
            display: inline-block;
          }
          .title {
            display: none;
          }
          .title-btns {
            .save-btn, .cancel-btn { display: inline }
            .edit-btn, .delete-btn { display: none }
          }
        }
        &:hover .title-btns {
          display: inline-block;
        }
      }
      .duty-receipt-input {
        padding-left: 10px;
        height: 28px;
        line-height: 28px;
        width: 230px;
        outline: none;
        border: 1px solid #ddd;
      }
      .content-receipt {
        float: left;
        min-width: 50px;
        padding: 0 10px;
        margin: 0 10px 10px 0;
      }
    }
    .el-form-item__label, .el-form-item__content {
      font-size: 12px;
      line-height: 30px
    }
    .increment-Invoice{
      overflow: hidden;
      margin-bottom:10px;
      li{
        float: left;
        height:40px;
        line-height:40px;
        padding:0 10px;
        border:1px dotted #999;
        // margin-right:10px;
        &.fore {
          border-color: #ccc;
          color: #ccc;
        }
        &.gap{
          height: 0;
          width: 0;
          border-bottom: none;
          border-left: none;
          border-right: none;
          margin-top: 21px;
          cursor: default;
          &.curr {
            border-top-color: #333;
          }
        }
      }
    }
  }

</style>
