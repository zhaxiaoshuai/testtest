<template>
  <div>
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
          >
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="商品名称">
                  <el-input size="medium" v-model="advancedForm.goods_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="咨询内容">
                  <el-input v-model="advancedForm.content" clearable></el-input>
                </el-form-item>
                <el-form-item label="咨询会员">
                  <el-input size="medium" v-model="advancedForm.member_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="店铺名称">
                  <en-shop-picker @changed="(shop) => { advancedForm.seller_id = shop.shop_id }"/>
                </el-form-item>
                <el-form-item label="回复状态">
                  <el-select v-model="advancedForm.reply_status" placeholder="请选择" clearable>
                    <el-option label="已回复" value="1"/>
                    <el-option label="未回复" value="0"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="审核状态">
                  <el-select v-model="advancedForm.auth_status" placeholder="请选择" clearable>
                    <el-option label="待审核" value="WAIT_AUDIT"/>
                    <el-option label="审核通过" value="PASS_AUDIT"/>
                    <el-option label="审核未通过" value="REFUSE_AUDIT"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="咨询日期">
                  <el-date-picker
                    v-model="advancedForm.create_time_range"
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
        <el-table-column prop="create_time" :formatter="MixinUnixToDate" label="咨询日期"/>
        <el-table-column label="商品名称">
          <template slot-scope="scope">
            <a :href="MixinBuyerDomain + '/goods/' + scope.row.goods_id" class="goods-name" target="_blank">{{ scope.row.goods_name }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="member_name" label="咨询会员"/>
        <el-table-column prop="content" label="咨询内容" width="350"/>
        <el-table-column label="审核状态">
          <template slot-scope="scope">{{ scope.row.auth_status | statusFilter }}</template>
        </el-table-column>
        <el-table-column label="回复状态">
          <template slot-scope="scope">{{ scope.row.reply_status | replyFilter }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handAudit(scope.$index, scope.row)"
            v-if="scope.row.auth_status === 'WAIT_AUDIT'">
              审核
            </el-button>
            <el-button
              size="mini"
              type="primary"
              @click="handleViewAsk(scope.$index, scope.row)">查看</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDeleteAsk(scope.$index, scope.row)">删除</el-button>
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
    <el-dialog
      title="咨询"
      center
      :visible.sync="dialogReviewVisible"
      width="40%"
    >
      <el-form ref="reviewAskForm" :model="reviewAsk" label-position="right" label-width="120px">
	      <el-form-item label="咨询人：">
		      <span>{{ reviewAsk.member_name}}</span>
	      </el-form-item>
	      <el-form-item label="商品名称：">
		      <a :href="MixinBuyerDomain + '/goods/' + reviewAsk.goods_id" target="_blank">{{ reviewAsk.goods_name }}</a>
	      </el-form-item>
	      <el-form-item label="咨询日期：">
		      <span>{{ reviewAsk.create_time | unixToDate}}</span>
	      </el-form-item>
	      <el-form-item label="审核状态：">
		      <span v-if="reviewAsk.auth_status === 'WAIT_AUDIT'">待审核</span>
		      <span v-if="reviewAsk.auth_status === 'PASS_AUDIT'">审核通过</span>
		      <span v-if="reviewAsk.auth_status === 'REFUSE_AUDIT'">审核拒绝</span>
	      </el-form-item>
	      <el-form-item label="咨询内容："><span class="content-text">{{ reviewAsk.content }}</span></el-form-item>
	      <template v-if="reviewAsk.reply_status === 1">
		      <el-form-item :label="replyLabel()">
			      <br>
			      <span class="content-text">{{ reviewAsk.reply }}</span>
		      </el-form-item>
	      </template>
      </el-form>
    </el-dialog>
    <el-dialog
      title="审核"
      center
      :visible.sync="dialogConsultationAudit"
      width="25%"
    >
      <el-form :model="auditInformation" label-width="120px" label-position="right" >
        <el-form-item label="咨询人名称：">
          <span>{{auditInformation.member_name}}</span>
        </el-form-item>
        <el-form-item label="商品名称：">
          <a :href="MixinBuyerDomain + '/goods/' + auditInformation.goods_id" target="_blank">{{ auditInformation.goods_name }}</a>
        </el-form-item>
        <el-form-item label="咨询日期：">
          <span>{{auditInformation.create_time | unixToDate}}</span>
        </el-form-item>
        <el-form-item label="咨询内容：">
          <span style="word-break:break-all;">{{auditInformation.content}}</span>
        </el-form-item>
        <el-form-item label="审核：">
          <el-radio v-model="auth_status" label="PASS_AUDIT">审核通过</el-radio>
          <el-radio v-model="auth_status" label="REFUSE_AUDIT">审核拒绝</el-radio>
        </el-form-item>
      </el-form>
	    <div slot="footer">
		    <el-button type="primary" @click="submitExamine">确认</el-button>
	    </div>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_Member from '@/api/member'
  import { Foundation } from '~/ui-utils'

  export default {
    name: 'goodsAskList',
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
        // 查看的详情
        reviewAsk: {},
        // 查看详情 dialog
        dialogReviewVisible: false,
        // 审核 dialog
        dialogConsultationAudit: false,
        // 审核信息
        auditInformation: {},
        // 审核状态
        auth_status: 'PASS_AUDIT',
        // 关键字
        keyword: '',
        // 高级搜索
        advancedForm: {}
      }
    },
    mounted() {
      this.GET_AskList()
    },
    filters: {
      statusFilter(val) {
        switch (val) {
          case 'WAIT_AUDIT': return '待审核'
          case 'PASS_AUDIT': return '审核通过'
          case 'REFUSE_AUDIT': return '审核未通过'
        }
      },
      replyFilter(val) {
        switch (val) {
          case 0: return '未回复'
          case 1: return '已回复'
        }
      }
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_AskList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_AskList()
      },
      /** 查看审核 */
      handAudit(index, row) {
        this.auditInformation = row
        this.dialogConsultationAudit = true
      },
      /** 提交咨询审核 */
      submitExamine() {
        API_Member.examineConsultation(this.auditInformation.ask_id, this.auth_status).then(() => {
          this.$message.success('审核成功！')
          this.dialogConsultationAudit = false
          this.GET_AskList()
        }).catch(() => {})
      },
      /** 查看咨询详情 */
      handleViewAsk(index, row) {
        this.reviewAsk = row
        this.dialogReviewVisible = true
      },

      /** 删除咨询 */
      handleDeleteAsk(index, row) {
        this.$confirm('确定要删除这条咨询吗？', '提示', { type: 'warning' }).then(() => {
          API_Member.deleteMemberAsk(row.ask_id).then(() => {
            this.$message.success('删除成功！')
            this.GET_AskList()
          })
        }).catch(() => {})
      },

      /** 回复时间 */
      replyLabel() {
        const ask = this.reviewAsk
        return `商家于[${Foundation.unixToDate(ask.reply_time)}]回复：`
      },

      /** 搜索事件触发 */
      searchEvent(keyword) {
        this.params.keyword = keyword
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        this.params.page_no = 1
        this.GET_AskList()
      },

      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        const { advancedForm } = this
        Object.keys(advancedForm).forEach(key => {
          if (advancedForm[key] !== undefined) {
            this.params[key] = advancedForm[key]
          }
        })
        delete this.params.keyword

        delete this.params.start_time
        delete this.params.end_time
        if (this.advancedForm.create_time_range) {
          this.params.start_time = this.advancedForm.create_time_range[0]
          this.params.end_time = this.advancedForm.create_time_range[1]
        }
        delete this.params.create_time_range
        this.params.page_no = 1
        this.GET_AskList()
      },

      /** 获取咨询列表 */
      GET_AskList() {
        this.loading = true
        const params = this.MixinClone(this.params)
        if (params.start_time && params.end_time) {
          params.start_time = parseInt(params.start_time / 1000)
          params.end_time = parseInt(params.end_time / 1000)
        }
        API_Member.getMemberAsks(params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .goods-name {
    color: #4183c4;
    &:hover { color: #f42424 }
  }
	.content-text {
		display:inline-block ;
	}
</style>
