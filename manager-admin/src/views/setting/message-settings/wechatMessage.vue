<template>
	<div>
		<div v-if="!is_Synchronize">
			<el-button type="primary" size="mini" @click="SynchronizeWechatMsg()">同步微信服务消息</el-button>
			<span class="tip-font">如同步失败,请先在微信公众号检测是否申请消息模版插件</span>
		</div>
		<en-table-layout
			v-else
			:toolbar="false"
			:tableData="tableData.data"
			:loading="loading"
		>
			<template slot="table-columns">
				<el-table-column prop="template_id" label="模版ID"/>
				<el-table-column prop="msg_tmp_name" label="模版名称"/>
				<el-table-column prop="is_open" label="状态" :formatter="tplStatus"/>
				<el-table-column label="操作">
					<template slot-scope="scope">
						<el-button
							size="mini"
							type="primary"
							@click="handleEditWechatMessage(scope.row)">编辑</el-button>
						<el-button
							size="mini"
							type="danger"
							@click="handleDelWechatMessage(scope.row)">删除</el-button>
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
			title="修改消息模板"
			:visible.sync="dialogVisible" width="500px"
			:close-on-click-modal="false"
			:close-on-press-escape="false"
		>
			<el-form :model="messageForm" label-width="130px">
				<el-form-item label="状态">
					<el-radio v-model="messageForm.is_open" :label="1">开启</el-radio>
					<el-radio v-model="messageForm.is_open" :label="0">关闭</el-radio>
				</el-form-item>
				<el-form-item label="开头文字提示">
					<el-input v-model="messageForm.msg_first":maxlength="100"></el-input>
				</el-form-item>
				<el-form-item label="备注提示">
					<el-input v-model="messageForm.msg_remark" :maxlength="100"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="submitWechatMessage">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
  import * as API_Message from '@/api/message'

  export default {
    name: 'wechatMessageSettings',
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
        // 消息模板 表单
        messageForm: {},
        // 消息模板 dialog
        dialogVisible: false,
        // 是否已经同步微信服务消息 默认false未同步
        is_Synchronize: false
      }
    },
    async mounted() {
      this.is_Synchronize = await API_Message.getSynchronizeWechatMessage()
      if (this.is_Synchronize) this.GET_MessageSettingList()
    },
    methods: {
      /** 同步微信服务消息 */
      SynchronizeWechatMsg() {
        API_Message.SynchronizeWechatMessage().then(res => {
          if (res) {
            this.$confirm(res, '警告', {
              type: 'warning',
              closeOnClickModal: false,
              showCancelButton: false
            })
          } else {
            this.$message.success('同步成功')
            this.is_Synchronize = true
            this.GET_MessageSettingList()
          }
        })
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_MessageSettingList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_MessageSettingList()
      },

      /** 销售状态格式化 */
      tplStatus(row, column, cellValue) {
        return row.is_open === 1 ? '开启' : '关闭'
      },

      /** 编辑微信消息模版 */
      handleEditWechatMessage(row) {
        this.dialogVisible = true
        API_Message.getWechatMessage(row.id).then(res => {
          this.messageForm = {
            id: row.id,
            ...res
          }
        })
      },

      /** 提交(修改)微信消息 */
      submitWechatMessage() {
        this.loading = true
        API_Message.modifyWechatMessage(this.messageForm.id, this.messageForm).then(res => {
          this.loading = false
          this.$message.success('修正成功')
          this.dialogVisible = false
        })
      },

      /** 删除微信服务消息 */
      handleDelWechatMessage(row) {
        API_Message.delWechatMessage(row.id).then(res => {
          this.$message.success('删除成功')
          this.GET_MessageSettingList()
        })
      },

      /** 获取微信服务消息列表 */
      GET_MessageSettingList() {
        this.loading = true
        API_Message.getWechatMessageList(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>
<style scoped>
	.tip-font {
		font-size: 13px;
		color: #666;
	}
</style>