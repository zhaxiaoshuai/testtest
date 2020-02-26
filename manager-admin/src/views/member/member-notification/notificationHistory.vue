<template>
  <div>
    <en-table-layout
      :pagination="true"
      :tableData="tableData.data"
      :loading="loading"
    >
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="primary" icon="el-icon-circle-plus-outline" @click="handleReleaseMessage">发送</el-button>
        </div>
        <div class="toolbar-search">
          <en-table-search
            @search="searchEvent"
            @advancedSearch="advancedSearchEvent"
            advanced
            advancedWidth="465"
          >
            <template slot="advanced-content">
              <el-form ref="advancedForm" :model="advancedForm" label-width="80px">
                <el-form-item label="消息标题">
                  <el-input size="medium" v-model="advancedForm.title" clearable></el-input>
                </el-form-item>
                <el-form-item label="消息内容">
                  <el-input size="medium" v-model="advancedForm.content" clearable></el-input>
                </el-form-item>
                <el-form-item label="发送类型">
                  <el-select v-model="advancedForm.send_type" placeholder="请选择" clearable>
                    <el-option label="全站" value="0"/>
                    <el-option label="指定会员" value="1"/>
                  </el-select>
                </el-form-item>
                <el-form-item label="发送日期">
                  <el-date-picker
                    v-model="advancedForm.send_time_range"
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
        <el-table-column prop="title" label="消息标题"/>
        <el-table-column prop="send_type" label="发送类型"/>
        <el-table-column prop="send_time" :formatter="MixinUnixToDate" label="发送时间"/>
        <el-table-column prop="content" label="消息内容" width="500"/>
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
      title="发送站内消息"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="messageForm" :rules="messageRules" ref="messageForm" label-width="100px">
        <el-form-item label="消息标题" prop="title">
          <el-input v-model="messageForm.title" :maxlength="20" placeholder="标题在20字以内"></el-input>
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder="请输入消息内容"
            v-model="messageForm.content"
            :maxlength="2000">
          </el-input>
        </el-form-item>
        <el-form-item label="发送类型">
          <el-radio-group v-model="messageForm.send_type">
            <el-radio :label="0">全站</el-radio>
            <el-radio :label="1">指定会员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="messageForm.send_type === 1" label="已选会员" prop="member_ids">
          <template v-if="messageForm.member_ids && messageForm.member_ids.length">
            <el-tag
              v-for="(member, index) in messageForm.member_ids"
              :key="member.member_id"
              closable
              @close="handleRemoveMember(index)"
              type="info">
              {{ member.uname }}
            </el-tag>
          </template>
          <el-button v-else size="mini" @click="memberPickerShow = true">选择会员</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitMessageForm('messageForm')">确 定</el-button>
      </span>
    </el-dialog>
    <en-member-picker
      :show="memberPickerShow"
      @close="memberPickerShow = false"
      @confirm="handleMemberPickerConfirm"/>
  </div>
</template>

<script>
  import * as API_Message from '@/api/message'

  export default {
    name: 'notificationHistory',
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
        // 发布消息 dialog
        dialogVisible: false,
        // 发布消息 表单
        messageForm: {
          send_type: 0,
          member_ids: []
        },
        // 发布消息 表单规则
        messageRules: {
          title: [this.MixinRequired('请输入消息标题！')],
          content: [this.MixinRequired('请输入消息内容！')],
          member_ids: [{ type: 'array', required: false, message: '请至少选择一个会员！' }]
        },
        // 会员选择器显示
        memberPickerShow: false,
        // 关键字
        keyword: '',
        // 高级搜索
        advancedForm: {}
      }
    },
    mounted() {
      this.GET_MessageList()
    },
    watch: {
      'messageForm.send_type': function(newVal) {
        this.memberPickerShow = !!newVal
        this.messageRules.member_ids[0].required = !!newVal
        if (newVal === 0) {
          this.messageForm.member_ids = []
        }
      }
    },
    methods: {
      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_MessageList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_MessageList()
      },

      /** 发布消息 */
      handleReleaseMessage() {
        this.messageForm = {
          send_type: 0,
          member_ids: []
        }
        this.dialogVisible = true
      },

      /** 选择会员回调 */
      handleMemberPickerConfirm(memberList) {
        this.messageForm.member_ids = memberList
      },
      /** 移除会员 */
      handleRemoveMember(index) {
        const { member_ids } = this.messageForm
        member_ids.splice(index, 1)
        this.$set(this.messageForm, 'member_ids', member_ids)
      },

      /** 发布消息 表单提交 */
      submitMessageForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            const params = this.MixinClone(this.messageForm)
            if (params.send_type === 1) {
              params.member_ids = params.member_ids.map(item => item.member_id)
            } else {
              delete params.member_ids
            }
            API_Message.releaseMessage(params).then(response => {
              this.dialogVisible = false
              this.$message.success('发布成功！')
              this.GET_MessageList()
            })
          } else {
            this.$message.error('表单填写有误，请检查！')
            return false
          }
        })
      },

      /** 搜索事件触发 */
      searchEvent(keyword) {
        this.params.keyword = keyword
        Object.keys(this.advancedForm).forEach(key => delete this.params[key])
        this.params.page_no = 1
        this.GET_MessageList()
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
        if (this.advancedForm.send_time_range) {
          this.params.start_time = this.advancedForm.send_time_range[0]
          this.params.end_time = this.advancedForm.send_time_range[1]
        }
        delete this.params.send_time_range
        this.params.page_no = 1
        this.GET_MessageList()
      },

      /** 获取站内消息列表 */
      GET_MessageList() {
        this.loading = true
        const params = this.MixinClone(this.params)
        if (params.start_time && params.end_time) {
          params.start_time = parseInt(params.start_time / 1000)
          params.end_time = parseInt(params.end_time / 1000)
        }
        API_Message.getMessageList(params).then(response => {
          this.loading = false
          this.tableData = response
        }).catch(() => { this.loading = false })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  /deep/ .el-tag + .el-tag {
    margin-left: 5px;
  }
</style>
