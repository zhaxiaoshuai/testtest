<template>
  <div>
  <en-table-layout
    :tableData="tableData.data"
    border
    size="small"
    style="width: 100%"
    :loading="loading">
	  <div slot="toolbar" class="inner-toolbar">
		  <div class="toolbar-btns"></div>
		  <div class="toolbar-search">
			  <en-table-search
				  @search="searchEvent"
				  @advancedSearch="advancedSearchEvent"
				  advanced
				  advancedWidth="465"
				  placeholder="请输入会员名称"
			  >
				  <template slot="advanced-content">
					  <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
						  <el-form-item label="会员名称">
							  <el-input size="medium" v-model="advancedForm.uname" clearable></el-input>
						  </el-form-item>
						  <el-form-item label="状态">
							  <el-select v-model="advancedForm.status" placeholder="请选择" clearable>
								  <el-option label="新申请" value="NEW_APPLY"/>
								  <el-option label="审核通过" value="AUDIT_PASS"/>
								  <el-option label="审核未通过" value="AUDIT_REFUSE"/>
							  </el-select>
						  </el-form-item>
						  <el-form-item label="申请日期">
							  <el-date-picker
								  v-model="advancedForm.order_time_range"
								  type="daterange"
								  align="center"
								  :editable="false"
								  unlink-panels
								  range-separator="-"
								  start-placeholder="开始日期"
								  end-placeholder="结束日期"
								  value-format="timestamp"
								  :picker-options="{ disabledDate(time) { return time.getTime() > Date.now() }, shortcuts: MixinPickerShortcuts }">
							  </el-date-picker>
						  </el-form-item>
					  </el-form>
				  </template>
			  </en-table-search>
		  </div>
	  </div>
    <template slot="table-columns">
      <el-table-column prop="apply_time" :formatter="MixinUnixToDate" label="申请日期" width="180"></el-table-column>
      <el-table-column prop="uname" label="申请会员" width="180"></el-table-column>
      <el-table-column prop="company_name" label="单位名称"></el-table-column>
      <el-table-column prop="taxpayer_code" label="纳税人识别号"></el-table-column>
      <el-table-column prop="status" label="审核状态">
        <template slot-scope="scope">
         <span v-if="scope.row.status === 'NEW_APPLY'">新申请</span>
         <span v-if="scope.row.status === 'AUDIT_PASS'">审核通过</span>
         <span v-if="scope.row.status === 'AUDIT_REFUSE'">审核未通过</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope" >
          <el-button
	          size="mini"
	          type="primary"
	          @click="handlViewExamineDetail(scope.row)">{{ scope.row.status === 'NEW_APPLY' ? '审核' : '查看' }}</el-button>
        </template>
      </el-table-column>
    </template>
    <el-pagination
      v-if="tableData"
      slot="pagination"
      @size-change="handlePageSizeChange"
      @current-change="handlePageCurrentChange"
      :current-page="tableData.page_no"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="tableData.page_size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="tableData.data_total">
    </el-pagination>
  </en-table-layout>
  <!--审核 dialog-->
  <el-dialog
    :title="detailsData.status === 'NEW_APPLY' ? '增票资质审核' : '增票资质详情'"
    :visible.sync="dialogReceiptExamine"
    width="450px"
    :close-on-click-modal="false"
    :close-on-press-escape="false">
    <div class="receipt-examine">
      <p>单位名称：{{ detailsData.company_name }}</p>
      <p>纳税人识别号：{{ detailsData.taxpayer_code }}</p>
      <p>注册地址：{{ detailsData.register_address }}</p>
      <p>注册电话：{{ detailsData.register_tel }}</p>
      <p>开户银行：{{ detailsData.bank_name }}</p>
      <p>银行账户：{{ detailsData.bank_account }}</p>
	    <p v-if="detailsData.status !== 'NEW_APPLY'">审核状态：{{ detailsData.status | invoiceStatus }}</p>
	    <p style="word-break:break-word;" v-if="detailsData.status === 'AUDIT_REFUSE'">备注信息：{{ detailsData.audit_remark }}</p>
    </div>
    <el-form :model="formExamine"
             :rules="authInfoRules"
             ref="formExamine"
             v-if="detailsData.status === 'NEW_APPLY'"
             class="receipt-form">
      <el-form-item label="是否通过">
          <el-radio v-model="formExamine.status" label="AUDIT_PASS">通过</el-radio>
          <el-radio v-model="formExamine.status" label="AUDIT_REFUSE">未通过</el-radio>
      </el-form-item>
      <el-form-item label="备注信息">
        <el-input
          type="textarea"
          v-model="formExamine.remark"
          placeholder="请输入审核备注（120字以内）"
          maxlength="120"
          class="textarea"></el-input>
      </el-form-item>
    </el-form>
    <div v-if="detailsData.status === 'NEW_APPLY'" slot="footer" class="dialog-footer">
      <el-button @click="dialogReceiptExamine = false">取 消</el-button>
      <el-button type="primary" @click="submitApply(formExamine)">确 定</el-button>
    </div>
  </el-dialog>
  </div>
</template>

<script>
    import * as API_Receipt from '@/api/receipt'

    export default {
      name: 'receiptExamine',
      data() {
        return {
          // 列表loading状态
          loading: false,
          // 列表参数
          params: {
            page_no: 1,
            page_size: 10
          },
          advancedForm: {},
          // 列表数据
          tableData: '',
          /** 审核 dialog */
          dialogReceiptExamine: false,
          /** 审核表单数据 */
          formExamine: {
            status: 'AUDIT_PASS',
            remark: ''
          },
          detailsData: '',
          /** 基础信息 表单规则 */
          authInfoRules: {
            status: [this.MixinRequired('请选择是否通过')]
          },
          row: null
        }
      },
      mounted() {
        this.GET_ReceiptExamine()
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
        /** 分页大小发生改变 */
        handlePageSizeChange(size) {
          this.params.page_size = size
          this.GET_ReceiptExamine()
        },

        /** 分页页数发生改变 */
        handlePageCurrentChange(page) {
          this.params.page_no = page
          this.GET_ReceiptExamine()
        },

        /** 搜索事件触发 */
        searchEvent(data) {
          this.params = {
            ...this.params,
            uname: data
          }
          Object.keys(this.advancedForm).forEach(key => delete this.params[key])
          this.params.page_no = 1
          this.GET_ReceiptExamine()
        },

        /** 高级搜索事件触发 */
        advancedSearchEvent() {
          this.params = {
            ...this.params,
            ...this.advancedForm
          }
          delete this.params.start_time
          delete this.params.end_time
          if (this.advancedForm.order_time_range) {
            this.params.start_time = this.advancedForm.order_time_range[0]
            this.params.end_time = this.advancedForm.order_time_range[1]
          }
          delete this.params.uname
          delete this.params.order_time_range
          this.params.page_no = 1
          this.GET_ReceiptExamine()
        },

        /** 获取会员增票资质信息列表 */
        GET_ReceiptExamine() {
          this.loading = true
          API_Receipt.getExamineReceiptList(this.params).then(response => {
            this.loading = false
            this.tableData = response
          }).catch(() => { this.loading = false })
        },
        /** 会员增票资质详情 */
        handlViewExamineDetail(row) {
          this.row = row
          this.formExamine = {
            status: 'AUDIT_PASS',
            remark: ''
          }
          API_Receipt.getExamineReceiptDetails(row.id).then(res => {
            this.detailsData = res
            this.dialogReceiptExamine = true
          })
        },
        /** 审核申请资质 */
        submitApply() {
          this.$refs.formExamine.validate((valid) => {
            if (!valid) {
              this.$message.error('表单输入有误！')
            }
            API_Receipt.applyExamineQualifications({
              id: this.row.id,
              params: this.formExamine
            }).then(_ => {
              this.GET_ReceiptExamine()
              this.dialogReceiptExamine = false
              this.$message.success('审核提交成功')
            }).catch()
          })
        }
      }
    }
</script>

<style type="text/scss" lang="scss" scoped>
  .receipt-examine{
    padding-left:30px;
  }

  .inner-toolbar {
	  display: flex;
	  width: 100%;
	  justify-content: space-between;
	  padding: 0 20px;
  }
  .receipt-form{
    padding-left:30px;
    .textarea{
      width: 290px;
    }
  }
</style>
