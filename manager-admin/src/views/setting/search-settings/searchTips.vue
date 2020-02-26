<template>
	<div>
		<en-table-layout
			:tableData="tableData.data"
			:loading="loading"
		>
			<div slot="toolbar" class="inner-toolbar">
				<div class="toolbar-btns">
					<el-button size="mini" type="primary" @click="addDialogVisible = true">添加提示词</el-button>
				</div>
				<div class="toolbar-search">
					<en-table-search @search="searchEvent"/>
				</div>
			</div>

			<template slot="table-columns">
				<el-table-column prop="words" label="提示词"/>
				<el-table-column label="提示词类型">
					<template slot-scope="scope">
						{{ scope.row.type === 'SYSTEM' ? '系统' : '平台' }}
					</template>
				</el-table-column>
				<el-table-column label="优先级">
					<template slot-scope="scope">
						<el-input-number v-model="scope.row.sort" @change="handleSortChange(scope.row)" :min="0" :max="999999" :precision="0"/>
					</template>
				</el-table-column>
				<el-table-column label="操作">
					<template slot-scope="scope" v-if="scope.row.type !== 'SYSTEM'" >
						<el-button
							size="mini"
							type="danger"
							@click="handleDelTips(scope.index, scope.row)">删除</el-button>
						<el-button
							size="mini"
							type="primary"
							@click="handleModifyCustomTips(scope.index, scope.row)">修改</el-button>
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
		<!--设置提示词-->
		<el-dialog
			title="设置提示词"
			:visible.sync="addDialogVisible"
			width="30%">
			<el-form>
				<el-form-item label="提示词" label-width="100px">
					<el-input v-model="customName" :maxLength="30" placeholder="请输入提示词" autocomplete="off"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
		    <el-button @click="addDialogVisible = false; customName = ''; customId = ''">取 消</el-button>
		    <el-button type="primary" @click=handleAddCustomTips>保 存</el-button>
		  </span>
		</el-dialog>
	</div>

</template>

<script>
  import * as API_search from '@/api/search'

  export default {
    name: 'searchTips',
    data() {
      return {
        /** 列表loading状态 */
        loading: false,

        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10
        },

        /** 搜索列表数据 */
        tableData: '',

        /** 添加提示词是否显示 */
        addDialogVisible: false,

        /** 当前操作id */
        customId: '',

        /** 自定义提示词 */
        customName: ''
      }
    },
    mounted() {
      this.GET_SearchTipsList()
    },
    activated() {
      this.GET_SearchTipsList()
    },
    methods: {

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_SearchTipsList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_SearchTipsList()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          ...this.params,
          keywords: data
        }
        this.params.page_no = 1
        this.GET_SearchTipsList()
      },

      /** 设置自定义提示词 */
      handleAddCustomTips() {
        if (!this.customName) {
          this.$message.error('提示词名称不能为空')
          return
        }
        const words = this.customName
        if (this.customId) { // 修改
          this.loading = true
          API_search.modifyCustomTips(this.customId, { words }).then(_ => {
            this.customId = ''
            this.customName = ''
            this.loading = false
            this.addDialogVisible = false
            this.$message.success('修改成功')
            this.GET_SearchTipsList()
          }).catch(() => (this.loading = false))
        } else { // 添加
          this.loading = true
          API_search.addCustomTips({ words }).then(_ => {
            this.loading = false
            this.addDialogVisible = false
            this.customName = ''
            this.$message.success('添加成功')
            this.GET_SearchTipsList()
          }).catch(() => (this.loading = false))
        }
      },

      /** 修改提示词优先级排序 */
      handleSortChange(row) {
        API_search.modifyCustomTipsSort(row.id, row.sort).then(_ => {
          this.loading = false
        }).catch()
      },

      /** 修改自定义提示词 */
      handleModifyCustomTips(index, row) {
        this.customName = row.words
        this.customId = row.id
        this.addDialogVisible = true
      },

      /** 删除提示词 */
      handleDelTips(index, row) {
        this.$confirm('确定要删除这个提示词么？', '提示', { type: 'warning' }).then(() => {
          this.loading = true
          API_search.delCustomTips(row.id).then(_ => {
            this.loading = false
            this.$message.success('删除成功！')
            this.GET_SearchTipsList()
          }).catch(() => (this.loading = false))
        }).catch(() => {})
      },

      /** 获取提示词列表 */
      GET_SearchTipsList() {
        this.loading = true
        API_search.getTipsList(this.params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => (this.loading = false))
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
	}

	.toolbar-search {
		margin-right: 10px;
	}

	.goods-image {
		width: 50px;
		height: 50px;
	}
	.goods_name {
		color: #4183c4;
		&:hover {
			color: #f42424;
		}
	}
</style>
