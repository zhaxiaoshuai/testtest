<template>
  <div>
    <en-table-layout
      pagination
      :tableData="tableData"
      :loading="loading">
	    <div slot="toolbar" class="inner-toolbar">
		    <div class="toolbar-btns"></div>
		    <div class="toolbar-search">
			    <en-table-search
				    @search="searchEvent"
				    @advancedSearch="advancedSearchEvent"
				    advanced
				    advancedWidth="465"
				    placeholder="请输入订单号">
				    <template slot="advanced-content">
					    <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
						    <el-form-item label="订单编号">
							    <el-input v-model="advancedForm.order_sn" clearable></el-input>
						    </el-form-item>
						    <el-form-item label="会员名称">
							    <el-input v-model="advancedForm.uname" clearable></el-input>
						    </el-form-item>
						    <el-form-item label="开票状态">
							    <el-select v-model="advancedForm.status" placeholder="请选择" clearable>
								    <el-option label="已开" :value="1"/>
								    <el-option label="未开" :value="0"/>
							    </el-select>
						    </el-form-item>
						    <el-form-item label="发票类型">
							    <el-select v-model="advancedForm.receipt_type" placeholder="请选择" clearable>
								    <el-option label="增值税普通发票" value="VATOSPECIAL"/>
								    <el-option label="增值税专用发票" value="VATORDINARY"/>
								    <el-option label="电子普通发票" value="ELECTRO"/>
							    </el-select>
						    </el-form-item>
						    <el-form-item label="开票时间">
							    <el-date-picker
								    v-model="advancedForm.order_time_range"
								    type="daterange"
								    align="center"
								    :editable="false"
								    unlink-panels
								    range-separator="-"
								    start-placeholder="开始日期"
								    end-placeholder="结束日期">
							    </el-date-picker>
						    </el-form-item>
					    </el-form>
				    </template>
			    </en-table-search>
		    </div>
	    </div>
      <template slot="table-columns">
        <!--日期-->
        <el-table-column label="开票时间">
          <template slot-scope="scope">{{ scope.row.add_time | unixToDate('yyyy-MM-dd hh:mm:ss') }}</template>
        </el-table-column>
        <!--会员名称-->
        <el-table-column prop="uname" label="会员名称"/>
        <!--订单编号-->
        <el-table-column prop="order_sn" label="订单编号"/>
        <!--发票类别-->
        <el-table-column prop="receipt_type" label="发票类型">
          <template slot-scope="scope">
            <span v-if="scope.row.receipt_type === 'ELECTRO'">电子普通发票</span>
            <span v-if="scope.row.receipt_type === 'VATORDINARY'">增值税普通发票</span>
            <span v-if="scope.row.receipt_type === 'VATOSPECIAL'">增值税专用发票</span>
          </template>
        </el-table-column>
        <!--开票状态-->
        <el-table-column prop="status" label="开票状态">
          <template slot-scope="scope">
            <span v-if="scope.row.status === 0">未开</span>
            <span v-if="scope.row.status === 1">已开</span>
          </template>
        </el-table-column>
        <!--操作-->
        <el-table-column prop="status" label="操作" width="150">
          <template slot-scope="scope">
            <el-button
              type="primary"
              @click="handleOperateReceipt(scope.row)"
              v-if="scope.row.status === 1 || scope.row.receipt_type === 'VATORDINARY'">查看
            </el-button>
            <el-button
              type="primary"
              @click="handleOperateReceipt(scope.row)"
              v-if="scope.row.status === 0 && scope.row.receipt_type !== 'VATORDINARY'">开票
            </el-button>
          </template>
        </el-table-column>
      </template>
      <el-pagination
        slot="pagination"
        v-if="pageData"
        @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange"
        :current-page="pageData.page_no"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageData.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageData.data_total">
      </el-pagination>
    </en-table-layout>
  </div>
</template>

<script>
  import * as API_Receipt from '@/api/receipt'
  export default {
    name: 'receiptHistory',
    data() {
      return {
        /** 列表loading状态 */
        loading: false,

        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10
        },

        /** 列表数据 */
        tableData: [],

        /** 列表分页数据 */
        pageData: [],

        /** 当前查看的发票数据 */
        viewRectiptData: [],

        /** 当前发票所关联的商品列表信息 */
        goodsList: [],

        /** 高级搜索数据 */
        advancedForm: {},

        /** 查看发票详情 dialog */
        dialogReceiptVisible: false
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
          this.params.start_time = this.advancedForm.order_time_range[0].getTime() / 1000
          this.params.end_time = this.advancedForm.order_time_range[1].getTime() / 1000
        }
        delete this.params.keyword
        delete this.params.order_time_range
        this.GET_ReceiptHistory()
      },

      /** 查看发票 */
      handleOperateReceipt(row) {
        this.$router.push({ path: `/order/receipt-detail/${row.history_id}` })
      },

      /** 获取发票历史 */
      GET_ReceiptHistory() {
        this.loading = true
        API_Receipt.getHistoryReceiptList(this.params).then(response => {
          this.loading = false
          this.tableData = response.data
          this.pageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  /deep/ div.toolbar {
	  height: 70px;
	  padding: 20px 0;
  }

  .inner-toolbar {
	  display: flex;
	  flex-direction: row;
	  flex-wrap: nowrap;
	  width: 100%;
	  justify-content: space-between;
	  align-items: center;
  }

  /deep/ .el-table td:not(.is-left) {
    text-align: center;
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
