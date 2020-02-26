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
          >
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="商品名称">
                  <el-input size="medium" v-model="advancedForm.goods_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="会员名称">
                  <el-input size="medium" v-model="advancedForm.member_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="评价">
                  <el-select v-model="advancedForm.grade" placeholder="请选择" clearable>
                    <el-option label="好评" value="good"/>
                    <el-option label="中评" value="neutral"/>
                    <el-option label="差评" value="bad"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="回复状态">
                  <el-select v-model="advancedForm.reply_status" placeholder="请选择" clearable>
                    <el-option label="已回复" value="1"/>
                    <el-option label="未回复" value="0"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="是否有图">
                  <el-select v-model="advancedForm.have_image" placeholder="请选择" clearable>
                    <el-option label="有图" :value="true"/>
                    <el-option label="无图" :value="false"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="审核状态">
                  <el-select v-model="advancedForm.audit_status" placeholder="请选择" clearable>
                    <el-option label="待审核" value="WAIT_AUDIT"/>
                    <el-option label="审核通过" value="PASS_AUDIT"/>
                    <el-option label="审核拒绝" value="REFUSE_AUDIT"/>
                  </el-select>
                </el-form-item>
              </el-form>
            </template>
          </en-table-search>
        </div>
      </div>
      <template slot="table-columns">
        <el-table-column prop="member_name" label="会员名称"/>
        <el-table-column label="商品名称">
          <template slot-scope="scope">
            <a :href="MixinBuyerDomain + '/goods/' + scope.row.goods_id" class="goods-name" target="_blank">{{ scope.row.goods_name }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" :formatter="MixinUnixToDate" label="初评日期"/>
        <el-table-column label="评价等级">
          <template slot-scope="scope">{{ scope.row.grade | gradeFilter }}</template>
        </el-table-column>
        <el-table-column label="初评审核状态" width="350">
           <template slot-scope="scope">
             <span>{{scope.row.audit_status | auditStatusFilter}}</span>
           </template>
        </el-table-column>
        <el-table-column label="是否有追评">
          <template slot-scope="scope">
            <span v-if="scope.row.additional_comment">是</span>
            <span v-else>否</span>
          </template>
        </el-table-column>
        <el-table-column label="追评审核状态">
          <template slot-scope="scope">
            <span v-if="scope.row.additional_comment">{{scope.row.additional_comment.audit_status | auditStatusFilter}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="danger"
              @click="handleDeleteComments(scope.$index, scope.row)"
              style="float: right;">删除</el-button>
            <div v-if="scope.row.audit_status === 'WAIT_AUDIT'" style="width:80px;float: right;margin-right: 10px;">
              <el-button
                size="mini"
                type="primary"
                @click="primaryCommentExamineBtn(scope.$index, scope.row)">
                初评审核
              </el-button>
            </div>
            <div v-if="scope.row.additional_comment && scope.row.additional_comment.audit_status === 'WAIT_AUDIT'" style="width:80px;float: right;margin-right:10px;">
              <el-button
                size="mini"
                type="primary"
                @click="primaryCommentExamineBtn(scope.$index, scope.row)">
                追评审核
              </el-button>
            </div>
            <el-button
              size="mini"
              type="primary"
              @click="handleViewComments(scope.$index, scope.row)"
              style="float: right;margin-right:10px;">查看</el-button>
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
    <!--查看详情-->
    <el-dialog
      title="查看评论详情"
      center
      :visible.sync="dialogReviewVisible"
      width="45%"
    >
      <el-form :model="reviewComments" label-position="right" label-width="120px">
        <el-form-item label="商品名称：">
          <a :href="MixinBuyerDomain + '/goods/' + reviewComments.goods_id" class="goods-name" target="_blank">{{reviewComments.goods_name}}</a>
        </el-form-item>
        <el-form-item label="评价人：">
          <span>{{reviewComments.member_name}}</span>
        </el-form-item>
        <el-form-item label="初评日期：">
          <span>{{ reviewComments.create_time | unixToDate }}</span>
        </el-form-item>
        <el-form-item label="初评内容：">
          <span style="color: #409EFF">{{ reviewComments.content }}</span>
          <div v-if="reviewComments.images && reviewComments.images.length">
	          <el-popover v-for="(imgsrc, imgindex) in reviewComments.images" :key="imgindex" placement="top" trigger="hover">
		          <a slot="reference" :href="imgsrc" target="_blank">
			          <img :src="imgsrc" style="width:50px;height:50px;display:inline-block;margin-right: 10px">
		          </a>
		          <img :src="imgsrc" style="max-height: 300px;max-width: 300px">
	          </el-popover>
          </div>
        </el-form-item>
        <el-form-item label="初评审核状态：">
          <span>{{reviewComments.audit_status | auditStatusFilter}}</span>
        </el-form-item>
        <template v-if="reviewComments.reply_status === 1">
          <el-form-item label="初评商家回复：">
            <span style="color: #FF5722">【{{ reviewComments.reply.create_time | unixToDate }}】 {{ reviewComments.reply.content || '暂无回复' }}</span><br/>
          </el-form-item>
        </template>
        <template v-if="reviewComments.additional_comment">
            <el-form-item label="追评日期：">
              <span>{{ reviewComments.additional_comment.create_time | unixToDate }}</span>
            </el-form-item>
            <el-form-item label="追评内容：">
              <span style="color: #409EFF">{{ reviewComments.additional_comment.content }}</span>
              <div v-if="reviewComments.additional_comment.images && reviewComments.additional_comment.images.length">
	              <el-popover v-for="(imgsrc, imgindex) in reviewComments.additional_comment.images" :key="imgindex" placement="top" trigger="hover">
		              <a slot="reference" :href="imgsrc" target="_blank">
			              <img :src="imgsrc" style="width:50px;height:50px;display:inline-block;margin-right: 10px">
		              </a>
		              <img :src="imgsrc" style="max-height: 300px;max-width: 300px">
	              </el-popover>
              </div>
            </el-form-item>
            <el-form-item label="追评审核状态：">
              <span>{{reviewComments.additional_comment.audit_status | auditStatusFilter}}</span>
            </el-form-item>
        </template>
        <template v-if="reviewComments.additional_comment && reviewComments.additional_comment.reply_status === 1 && reviewComments.additional_comment.reply">
          <el-form-item label="追评商家回复：">
            <span style="color: #FF5722">【{{ reviewComments.additional_comment.reply.create_time | unixToDate }}】 {{ reviewComments.additional_comment.reply.content || '暂无回复' }}</span>
          </el-form-item>
        </template>
      </el-form>
    </el-dialog>
    <!--评论审核-->
    <el-dialog
      title="评论审核"
      center
      :visible.sync="primaryCommentExamine"
      width="25%">
       <el-form :model="primaryCommentInfo" label-width="120px" label-position="right">
         <!--初级评论审核-->
         <template v-if="primaryCommentInfo.audit_status === 'WAIT_AUDIT'">
           <el-form-item label="商品名称：">
             <a :href="MixinBuyerDomain + '/goods/' + primaryCommentInfo.goods_id" class="goods-name" target="_blank">{{primaryCommentInfo.goods_name}}</a>
           </el-form-item>
           <el-form-item label="评价人：">
             <span>{{primaryCommentInfo.member_name}}</span>
           </el-form-item>
           <el-form-item label="初评日期：">
             <span>{{primaryCommentInfo.create_time | unixToDate}}</span>
           </el-form-item>
           <el-form-item label="评论内容：">
             <span style="color: #409EFF">{{ primaryCommentInfo.content }}</span>
             <div v-if="primaryCommentInfo.have_image === 1">
               <a v-for="(image, index) in primaryCommentInfo.images" :href="image" :key="index" target="_blank">
                 <img :src="image" style="max-width: 150px;height: 80px;display: inline-block;margin-right: 10px">
               </a>
             </div>
           </el-form-item>
           <el-form-item label="初评审核：">
             <el-radio v-model="audit_status" label="PASS_AUDIT">审核通过</el-radio>
             <el-radio v-model="audit_status" label="REFUSE_AUDIT">审核拒绝</el-radio>
           </el-form-item>
           <el-form-item>
             <el-button type="primary" @click="submitExamine">确认</el-button>
           </el-form-item>
         </template>
         <!--追加评论审核-->
         <template v-if="primaryCommentInfo.additional_comment">
           <el-form-item label="商品名称：">
             <a :href="MixinBuyerDomain + '/goods/' + primaryCommentInfo.additional_comment.goods_id" class="goods-name" target="_blank">{{primaryCommentInfo.additional_comment.goods_name}}</a>
           </el-form-item>
           <el-form-item label="评价人：">
             <span>{{primaryCommentInfo.additional_comment.member_name}}</span>
           </el-form-item>
           <el-form-item label="追评日期：">
             <span>{{primaryCommentInfo.additional_comment.create_time | unixToDate}}</span>
           </el-form-item>
           <el-form-item label="追评内容：">
             <span style="color: #409EFF">{{ primaryCommentInfo.additional_comment.content }}</span>
             <div v-if="primaryCommentInfo.additional_comment.have_image === 1">
               <a v-for="(image, index) in primaryCommentInfo.additional_comment.images" :href="image" :key="index" target="_blank">
                 <img :src="image" style="max-width: 150px;height: 80px;display: inline-block;margin-right: 10px">
               </a>
             </div>
           </el-form-item>
           <el-form-item label="追评审核：">
             <el-radio v-model="audit_status" label="PASS_AUDIT">审核通过</el-radio>
             <el-radio v-model="audit_status" label="REFUSE_AUDIT">审核拒绝</el-radio>
           </el-form-item>
           <el-form-item>
             <el-button type="primary" @click="submitAppendExamine" >审核</el-button>
           </el-form-item>
         </template>
       </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import * as API_Member from '@/api/member'

  export default {
    name: 'goodsCommentList',
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
        // 查看评论 dialog
        dialogReviewVisible: false,
        // 查看评论
        reviewComments: {},
        // 关键字
        keyword: '',
        // 高级搜索
        advancedForm: {},
        // 初级评论审核 dialog
        primaryCommentExamine: false,
        // 初级评论信息
        primaryCommentInfo: {},
        // 审核状态
        audit_status: 'PASS_AUDIT'
      }
    },
    mounted() {
      this.GET_CommentList()
    },
    filters: {
      gradeFilter(val) {
        switch (val) {
          case 'bad':
            return '差评'
          case 'neutral':
            return '中评'
          default:
            return '好评'
        }
      },
      auditStatusFilter(val) {
        switch (val) {
          case 'WAIT_AUDIT':
            return '待审核'
          case 'PASS_AUDIT':
            return '审核通过'
          default:
            return '审核拒绝'
        }
      }
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_CommentList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_CommentList()
      },

      /** 搜索事件触发 */
      searchEvent(keyword) {
        this.params.keyword = keyword
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        this.params.page_no = 1
        this.GET_CommentList()
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
        this.params.page_no = 1
        this.GET_CommentList()
      },

      /** 查看评论详情 */
      handleViewComments(index, row) {
        this.reviewComments = row
        this.dialogReviewVisible = true
      },
      /** 获取初级评论审核详情 */
      primaryCommentExamineBtn(index, row) {
        this.primaryCommentInfo = row
        this.primaryCommentExamine = true
      },
      /** 提交初评论审核 */
      submitExamine() {
        API_Member.examineMemberComments(this.audit_status, this.primaryCommentInfo.comment_id).then(response => {
          this.$message.success('审核成功！')
          this.primaryCommentExamine = false
          this.GET_CommentList()
        }).catch(() => {})
      },
      /** 提交追加评论审核 */
      submitAppendExamine() {
        API_Member.examineMemberComments(this.audit_status, this.primaryCommentInfo.additional_comment.comment_id).then(response => {
          this.$message.success('审核成功！')
          this.primaryCommentExamine = false
          this.GET_CommentList()
        }).catch(() => {})
      },
      /** 删除评论 */
      handleDeleteComments(index, row) {
        this.$confirm('确定要删除这条评论吗？', '提示', { type: 'warning' }).then(() => {
          API_Member.deleteMemberComments(row.comment_id).then(() => {
            this.$message.success('删除成功！')
            this.GET_CommentList()
          })
        }).catch(() => {})
      },

      /** 获取评论列表 */
      GET_CommentList() {
        this.loading = true
        this.params.comment_type = 'INITIAL'
        API_Member.getMemberComments(this.params).then(response => {
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
  span{
    word-wrap:break-word;
  }
</style>
