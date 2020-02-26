<template>
  <div class="container">
  <el-form ref="invoiceForm"
           :model="invoiceForm"
           label-width="125px">
    <el-form-item label="增值税普通发票：">
      <el-radio v-model="invoiceForm.ordin_receipt_status" :label="1">开启</el-radio>
      <el-radio v-model="invoiceForm.ordin_receipt_status" :label="0">关闭</el-radio>
    </el-form-item>
      <el-form-item label="电子普通发票：">
        <el-radio v-model="invoiceForm.elec_receipt_status" :label="1">开启</el-radio>
        <el-radio v-model="invoiceForm.elec_receipt_status" :label="0">关闭</el-radio>
      </el-form-item>
       <el-form-item label="增值税专用发票：">
         <el-radio v-model="invoiceForm.tax_receipt_status" :label="1">开启</el-radio>
         <el-radio v-model="invoiceForm.tax_receipt_status" :label="0">关闭</el-radio>
       </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitInvoiceSettings" >保存设置</el-button>
    </el-form-item>
  </el-form>
  </div>
</template>

<script>
    import * as API_Receipt from '@/api/receipt'
    export default {
      name: 'invoiceSettings',
      data() {
        return {
          /** 发票信息表单 */
          invoiceForm: {
            ordin_receipt_status: 0,
            elec_receipt_status: 0,
            tax_receipt_status: 0
          }
        }
      },
      mounted() {
        this.queryInvoiceSettingsInfo()
      },
      methods: {
        /** 保存发票设置 **/
        submitInvoiceSettings() {
          API_Receipt.saveInvoiceSettings(this.invoiceForm).then(_ => {
            this.$message.success('保存设置成功！')
            this.queryInvoiceSettingsInfo()
          }).catch()
        },
        /** 获取店铺信息 **/
        queryInvoiceSettingsInfo() {
          API_Receipt.queryInvoiceSettingsInfo().then(response => {
            this.invoiceForm = {
              ordin_receipt_status: response.ordin_receipt_status || 0,
              elec_receipt_status: response.elec_receipt_status || 0,
              tax_receipt_status: response.tax_receipt_status || 0
            }
          })
        }
      }
    }
</script>

<style type="text/scss" lang="scss" scoped>
.container{
  height:100%;
  padding:20px 0 0 20px;
  background: #fff;
  border:1px solid #ccc;
}
</style>
