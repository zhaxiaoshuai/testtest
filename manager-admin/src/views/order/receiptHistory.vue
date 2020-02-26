<template>
  <en-table-layout
    :tableData="tableData.data"
    :loading="loading"
  >
	  <div slot="toolbar" class="inner-toolbar">
		  <div class="toolbar-btns"></div>
		  <div class="toolbar-search">
			  <en-table-search
				  @search="searchEvent"
				  @advancedSearch="advancedSearchEvent"
				  advanced
				  advancedWidth="465"
				  placeholder="请输入订单编号或商家名称"
			  >
				  <template slot="advanced-content">
					  <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
						  <el-form-item label="会员名称">
							  <el-input size="medium" v-model="advancedForm.uname" clearable></el-input>
						  </el-form-item>
						  <el-form-item label="商家名称">
							  <el-input size="medium" v-model="advancedForm.seller_name" clearable></el-input>
						  </el-form-item>
						  <el-form-item label="订单编号">
							  <el-input size="medium" v-model="advancedForm.order_sn" clearable></el-input>
						  </el-form-item>
						  <el-form-item label="发票类型">
							  <el-select v-model="advancedForm.receipt_type" placeholder="请选择" clearable>
								  <el-option label="增值税普通发票" value="VATOSPECIAL"/>
								  <el-option label="增值税专用发票" value="VATORDINARY"/>
								  <el-option label="电子普通发票" value="ELECTRO"/>
							  </el-select>
						  </el-form-item>
              <el-form-item label="开票状态">
                <el-select v-model="advancedForm.status" placeholder="请选择" clearable>
                  <el-option label="已开票" value="1"/>
                  <el-option label="未开票" value="0"/>
                </el-select>
              </el-form-item>
						  <el-form-item label="开票日期">
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
      <el-table-column prop="add_time" :formatter="MixinUnixToDate" label="日期"/>
      <el-table-column prop="receipt_type" label="发票类型">
        <template slot-scope="scope">
          <span v-if="scope.row.receipt_type === 'ELECTRO'">电子普通发票</span>
          <span v-if="scope.row.receipt_type === 'VATORDINARY'">增值税普通发票</span>
          <span v-if="scope.row.receipt_type === 'VATOSPECIAL'">增值税专用发票</span>
        </template>
      </el-table-column>
      <el-table-column prop="uname" label="会员名称"/>
      <el-table-column prop="order_sn" label="订单编号"/>
      <el-table-column prop="seller_name" label="商家名称"/>
      <el-table-column prop="status" label="开票状态">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 1">已开票</span>
          <span v-if="scope.row.status === 0">未开票</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleOperateReceipt(scope.$index, scope.row)">查看</el-button>
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
</template>

<script>
  import * as API_Receipt from '@/api/receipt'

  export default {
    name: 'receiptHistory',
    data() {
      return {
        // 列表loading状态
        loading: false,
        // 列表参数
        params: {
          page_no: 1,
          page_size: 10
        },
        // 列表数据
        tableData: '',
        // 高级搜索数据
        advancedForm: {}
      }
    },
    mounted() {
      this.GET_ReceiptHistory()
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_ReceiptHistory()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_ReceiptHistory()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          ...this.params,
          keyword: data
        }
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        this.params.page_no = 1
        this.GET_ReceiptHistory()
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
        delete this.params.keyword
        delete this.params.order_time_range
        this.params.page_no = 1
        this.GET_ReceiptHistory()
      },

      /** 查看发票 */
      handleOperateReceipt(index, row) {
        this.$router.push({ name: 'receiptDetail', params: { id: row.history_id }})
      },

      /** 获取发票历史 */
      GET_ReceiptHistory() {
        this.loading = true
        API_Receipt.getHistoryReceiptList(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  /deep/ .el-table td:not(.is-left) {
    text-align: center;
  }

  .inner-toolbar {
	  display: flex;
	  width: 100%;
	  justify-content: space-between;
	  padding: 0 20px;
  }

  .item-receipt {
    padding: 10px;

    .item-receipt-label {
      display: inline-block;
    }

    .item-receipt-value {
      display: inline-block;
      margin-left: 20px;
    }
  }
</style>
