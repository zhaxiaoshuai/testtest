<template>
  <li>
    <div class="message-tips">普通发票将随订单商品一起寄出，用户可在个人中心-订单列表中查看发票相关信息</div>
    <el-form :model="receiptForm" :rules="receiptRules" ref="receiptForm" label-width="100px">
      <el-form-item label="发票抬头" prop="receipt_title">
      <!--个人抬头 start-->
        <div
          class="ckt-checkbox title-receipt"
          :class="[selectedReceipt && selectedReceipt.receipt_title === '个人' && 'selected']"
          @click="handleSelectReceipt"
        >
        <span class="title">个人</span>
        </div>
          <!--个人抬头 end-->
          <!--个人发票抬头列表 start-->
          <div
            v-for="receipt in receipts"
            :key="receipt.receipt_title"
            class="ckt-checkbox title-receipt"
            :class="[
              selectedReceipt && selectedReceipt.receipt_title === receipt.receipt_title && 'selected',
              receiptForm.receipt_id === receipt.receipt_id && 'editting'
            ]"
            @click="handleSelectReceipt(receipt)"
          >
            <span class="title">{{ receipt.receipt_title }}</span>
            <input
              class="company-receipt-input"
              v-model="receiptForm.receipt_title"
              maxlength="60"
              placeholder="单位发票抬头"
              @click.stop="() => {}"
            >
            <div class="title-btns">
              <a href="javascript:" class="btn save-btn" @click.stop="handleSaveReceipt">保存</a>
              <a href="javascript:" class="btn edit-btn" @click.stop="handleEditReceipt(receipt)">编辑</a>
              <a href="javascript:" class="btn delete-btn" @click.stop="handleDeleteReceipt(receipt)">删除</a>
              <a href="javascript:" class="btn cancel-btn" @click="receiptForm = {}">取消</a>
            </div>
          </div>
          <!--个人发票抬头列表 end-->
          <!--编辑抬头 start-->
          <div
            v-if="receiptForm.receipt_title !== undefined && receiptForm.receipt_id === -1"
            class="ckt-checkbox title-receipt selected editting"
          >
            <input class="company-receipt-input" v-model="receiptForm.receipt_title" maxlength="60" placeholder="新增单位发票抬头">
            <div class="title-btns">
              <a href="javascript:" class="btn save-btn" @click.stop="handleSaveReceipt">保存</a>
            </div>
          </div>
          <!--编辑抬头 end-->
          <!--新增单位发票 start-->
          <a
            v-if="!receiptForm.receipt_id"
            href="javascript:"
            class="add-receipt"
            @click="handleAddReceipt"
          >新增单位发票</a>
          <!--新增单位发票 end-->
      </el-form-item>
      <el-form-item
        v-if="receiptForm.tax_no !== undefined"
        label="纳税人识别号"
        prop="tax_no"
      >
        <input
          v-model="receiptForm.tax_no"
          class="duty-receipt-input"
          placeholder="请填写纳税人识别号"
          maxlength="50"
        >
      </el-form-item>
      <el-form-item label="发票内容" prop="content">
        <div v-for="item in content" :key="item.id" @click="selectContentMethod(item)" :class="[item.select ? 'selected': null, 'ckt-checkbox content-receipt']">
          <span>{{ item.label }}</span>
        </div>
      </el-form-item>
    </el-form>
  </li>
</template>

<script>
import * as API_Members from '@/api/members'
import * as API_Trade from '@/api/trade'
import { RegExp } from '@/ui-utils'
export default {
  name: 'vatordinary',
  props: ['receipt', 'getInventories', 'tabData'],
  data () {
    return {
      // 发票表单
      receiptForm: {},
      // 发票表单规则
      receiptRules: {
        receipt_title: [this.MixinRequired('请填写发票抬头！')],
        tax_no: [
          this.MixinRequired('请填写纳税人识别号！'),
          {
            validator: (rule, value, callback) => {
              if (!RegExp.TINumber.test(value)) {
                callback(new Error('纳税人识别号格式不正确！'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        member_name:[this.MixinRequired('请输入收票人姓名')],
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
        province:[this.MixinRequired('请输入收票人省份')],
      },
      // 会员发票列表
      receipts: [],
      // 发票内容统一设置
      content: [{label: '无需发票', id: 1, select: true}, {label:  '商品明细', id: 2, select: false}],
      // 已选择发票
      selectedReceipt: this.receipt
    }
  },
  async mounted () {
    await this.GET_ReceiptList();
    this.init()
  },
  methods: {
    init() {
      if (this.receipt && this.receipt.receipt_type === 'VATORDINARY') {
        if (this.receipt.receipt_title) { // 如果存在已选发票
          if (this.receipt.receipt_title === '个人') {
            this.selectedReceipt = {
              receipt_title: '个人',
              receipt_content: this.receipt.receipt_content,
              tax_no: undefined
            }
          } else {
            const _receipt = this.receipts.find(key => key.receipt_title === this.receipt.receipt_title)
            this.receiptForm = {
              tax_no: this.receipt.tax_no,
              receipt_title: this.receipt.receipt_title,
              receipt_content: this.receipt.receipt_content
            };
            this.$refs['receiptForm'].clearValidate();
            this.selectedReceipt = JSON.parse(JSON.stringify(_receipt))
            console.log(this.selectedReceipt)
          }
        }
      } else {
        // 如果存在默认发票
        const _receipt = this.receipts.find(key => key.is_default === 1)
        if(_receipt) {
          this.receiptForm = {
            tax_no: _receipt.tax_no,
            receipt_content: this.content[0].label
          };
          _receipt.receipt_content = this.content[0].label
          this.selectedReceipt = JSON.parse(JSON.stringify(_receipt))
        } else { // 默认发票 已选发票都不存在
          this.selectedReceipt = {
            receipt_title: '个人',
            receipt_content: this.content[0].label
          }
        }
      }
      this.content.forEach(item => item.label === this.selectedReceipt.receipt_content ? item.select = true : item.select = false)
    },
    // 选取 对应的 发票内容
    selectContentMethod (itemContent) {
      this.content.forEach(item => item.id === itemContent.id ? item.select = true : item.select = false)
    },
     /** 选择已有发票 */
    handleSelectReceipt(receipt) {
      this.receiptForm = {
        tax_no: receipt.tax_no,
        receipt_content: receipt.receipt_content
      };
      this.$refs['receiptForm'].clearValidate();
      if (!receipt.receipt_title) {
        this.selectedReceipt = {
          receipt_title: '个人',
          receipt_content: this.content
        };
        return false
      }
      this.selectedReceipt = JSON.parse(JSON.stringify(receipt))
    },
     /** 新增单位发票 */
    handleAddReceipt() {
      this.receiptForm = {
        receipt_id: -1,
        receipt_title: '',
        receipt_content: this.content,
        tax_no: ''
      };
      this.selectedReceipt = ''
    },
     /** 修改发票 */
    handleEditReceipt(receipt) {
      this.receiptForm = JSON.parse(JSON.stringify(receipt));
      this.selectedReceipt = ''
    },
    /** 删除发票 */
    handleDeleteReceipt(receipt) {
      if (receipt.receipt_id === this.selectedReceipt.receipt_id) {
        this.$message.error('已选择发票不能删除！');
        return
      }
      this.$confirm('确定要删除这个发票吗？', () => {
        API_Members.deleteReceipt(receipt.receipt_id).then(async () => {
          this.$message.success('删除成功！');
          await this.GET_ReceiptList();
	        this.init()
        })
      })
    },
    /** 保存发票 */
    handleSaveReceipt() {
      const params = JSON.parse(JSON.stringify(this.receiptForm));
      const { receipt_title } = params;
      const { receipt_id } = params;
      if (receipt_id) {
        const hasSameTitle = this.receipts.filter(item => item.receipt_title === receipt_title)[0];
        if (hasSameTitle && hasSameTitle.receipt_id !== receipt_id) {
          this.$message.error('已经有相同的发票抬头了！');
          return false
        }
      }
      this.$refs['receiptForm'].validate((valid) => {
        if (valid) {
          const saveSuccess = async () => {
            this.$message.success('保存成功！');
            this.receiptForm = {};
            this.handleSelectReceipt(params);
            await this.GET_ReceiptList();
            this.init()
          };
          params.receipt_content = this.content.find(item => item.select)['label'];
          if (receipt_id && receipt_id !== -1) {
            API_Members.editReceipt(receipt_id, params).then(saveSuccess)
          } else {
            const receipt_type = this.tabData['receipt_type'];
            if (receipt_type) {
              delete params.receipt_content;
              API_Members.addReceipt({...params, receipt_type: receipt_type}).then(saveSuccess)
            } else {
              API_Members.addReceipt(params).then(saveSuccess)
            }
          }
        } else {
          this.$message.error('表单填写有误，请核对！');
          return false
        }
      })
    },
    /** 确认发票 */
    handleConfirmReceipt(index, callback) {
      // if (this.receiptForm.receipt_title) {
      //   this.$message.error('请先保存正在编辑的发票！');
      //   return false
      // }
      if (!this.selectedReceipt.receipt_title) {
        this.$message.error('请选择发票抬头！');
        return false
      }
      let receipt = JSON.parse(JSON.stringify(this.selectedReceipt)) || {};
      receipt.type = receipt.receipt_title === '个人' ? 0 : 1;

      const currentContent = this.content.find(item => item.select);
      receipt.receipt_content = currentContent['label'];
      const receipt_type = this.tabData['receipt_type'];
      if (currentContent.id === 1) {
        API_Trade.cancelReceipt().then(() => {
          this.$message.success('设置成功！');
          callback({})
        });
        return
      }
      API_Trade.setRecepit({...receipt, receipt_type }).then(() => {
        this.$message.success('设置成功！');
        callback({...receipt, receipt_type: receipt_type, type: receipt_type})
      })
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
    /** 获取发票列表 */
    async GET_ReceiptList() {
      const receipt_type = this.tabData['receipt_type'];
      this.receipts = await API_Members.getReceipts(receipt_type)
    }
  }
}
</script>

