<template>
  <div id="comments">
    <el-form v-if="!cantComments" :model="commentsForm" :rules="commentsRules" ref="commentsForm">
      <div class="shop-grade" v-if="isFirstComment">
        <h3><i class="el-icon-warning"></i>请给店铺评分</h3>
        <div class="shop-grade-item">描述相符：<el-rate v-model="commentsForm.description_score" :colors="rateColors" score-template="{value}分" text-color="#666" show-score></el-rate></div>
        <div class="shop-grade-item">服务态度：<el-rate v-model="commentsForm.service_score" :colors="rateColors" score-template="{value}分" text-color="#666" show-score></el-rate></div>
        <div class="shop-grade-item">物流服务：<el-rate v-model="commentsForm.delivery_score" :colors="rateColors" score-template="{value}分" text-color="#666" show-score></el-rate></div>
      </div>
      <div class="comments-goods-box">
        <div v-for="(comment, index) in commentsForm.comments" :key="index" class="comments-item">
          <!-- 商品展示 -->
          <a :href="'/goods/' + skulist[index].goods_id + '?sku_id=' + skulist[index].sku_id" target="_blank" class="comments-goods">
            <div class="goods-image"><img :src="skulist[index].goods_image" :alt="skulist[index].name"></div>
            <div class="goods-name">
              <span>{{ skulist[index].name }}</span>
              <p class="sku-spec">{{ skulist[index] | formatterSkuSpec }}</p>
            </div>
          </a>
          <!-- 评价 -->
          <div class="comments-content">
            <div class="comments-grade" v-if="isFirstComment">评分：
              <el-radio-group
                v-model="comment.grade"
                @change="(value) => { commentsRules.comments[index].content[0].required = value !== 'good' }"
              >
                <el-radio label="good">好评</el-radio>
                <el-radio label="neutral">中评</el-radio>
                <el-radio label="bad">差评</el-radio>
              </el-radio-group>
            </div>
            <ul class="comments_score" v-else>
              <template v-if="comment.$$goods_comment">
                <li>初评日期：{{comment.$$goods_comment.create_time | unixToDate}}</li>
                <li>初评评分：{{comment.$$goods_comment.grade ==='good' ? '好评' : comment.$$goods_comment.grade ==='neutral' ? '中评' : comment.$$goods_comment.grade ==='bad' ? '差评': ''}}</li>
                <li>初评内容：{{comment.$$goods_comment.content}}</li>
	              <li v-if="comment.$$goods_comment && comment.$$goods_comment.length">
		              <span style="float:left;">初评图片：</span>
		              <img class="comments-images" v-for="(img, index) in comment.$$goods_comment.images" :key="index" :src="img" alt=""/>
	              </li>
                <li>
                  初评审核状态：
                  <span v-if="comment.$$goods_comment.audit_status === 'WAIT_AUDIT'">您的初评待审核，不能进行追评</span>
                  <span v-if="comment.$$goods_comment.audit_status === 'REFUSE_AUDIT'">您的初评审核未通过，不能进行追评</span>
                  <span v-if="comment.$$goods_comment.audit_status === 'PASS_AUDIT'">您的初评审核通过</span>
                </li>
              </template>
            </ul>
            <div class="comments-input" v-if="isFirstComment || comment.$$goods_comment.audit_status === 'PASS_AUDIT'">
              <el-form-item :prop="'comments.' + index + '.content'" label="">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 3, maxRows: 10 }"
                  :maxlength="300"
                  placeholder="请在此处输入您的评论"
                  v-model="comment.content">
                </el-input>
              </el-form-item>
            </div>
            <div :class="['comments-images', comment.images.length >= 5 && 'limit']" v-if="isFirstComment || comment.$$goods_comment.audit_status === 'PASS_AUDIT'">
              <el-upload
                :action="MixinUploadApi"
                list-type="picture-card"
                multiple
                :on-exceed="() => { $message.error('超过最大可上传数！') }"
                :limit="5"
                :on-success="(res, file, fileList) => { comment.images = fileList }"
                :on-remove="(file, fileList) => { comment.images = fileList }"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
            </div>
            <p v-if="isFirstComment || comment.$$goods_comment.audit_status === 'PASS_AUDIT'">您收到的商品是什么样的呢？晒个照片吧（最多可上传5张照片）</p>
          </div>
        </div>
      </div>
      <div class="comments-btn-box">
        <el-button type="danger" v-if="button_show" @click="submitForm">发表评论</el-button>
      </div>
    </el-form>
    <div v-else class="cant-comments">
      <h3><i class="el-icon-warning"></i>该订单不能评论！</h3>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { Rate, RadioGroup, Radio, Upload } from 'element-ui'
  Vue.use(Rate).use(RadioGroup).use(Radio).use(Upload);
  import * as API_Order from '@/api/order'
  import * as API_Members from '@/api/members'
  export default {
    name: 'comments',
    head() {
      return {
        title: `评价商品-${this.site.title}`
      }
    },
    data() {
      return {
        order_sn: this.$route.query.order_sn,
        skulist: '',
        commentsForm: {},
        commentsRules: {
          comments: []
        },
        // 评分颜色
        rateColors: ['#99A9BF', '#F7BA2A', '#FF9900'],
        // 不能评论【已评论过】
        cantComments: false,
        // 是否为初评 默认为true ==> 初评
        isFirstComment: true,
        // 商品评论信息
        goodsCommentsInfo: {}
      }
    },
    computed: {
      button_show () {
        let { comments = [] } = this.commentsForm;
        if (this.isFirstComment) return true;
        return comments.some(item => item.$$goods_comment.audit_status === 'PASS_AUDIT')
      }
    },
    mounted() {
      let { append_comment = '' } = this.$route.query;
      if (append_comment === 'review') this.isFirstComment = false;
	    let commentResult;
	    const sku_id = this.$route.query.sku_id;
      API_Order.getOrderDetail(this.order_sn).then(async response => {
        this.skulist = commentResult = response.order_sku_list;
        if (append_comment === 'review') {
          this.goodsCommentsInfo = commentResult = await API_Members.getGoodsFirstComments({ order_sn: this.order_sn, sku_id })
        }
        this.commentsForm = {
          order_sn: this.order_sn,
          delivery_score: 5,
          description_score: 5,
          service_score: 5,
          comments: commentResult.map((item, index) => {
            this.commentsRules.comments[index] = {};
            this.commentsRules.comments[index].content = [{ required: false, message: '可以告诉我们您遇到了什么问题吗？', trigger: 'blur' }];
            return {
              $$goods_comment: item,
              sku_id: item.sku_id,
              content: '',
              grade: 'good',
              images: []
            }
          })
        }
      })
    },
    methods: {
      submitForm() {
        this.$refs['commentsForm'].validate((valid) => {
          if (valid) {
            const params = JSON.parse(JSON.stringify(this.commentsForm));
	          // 默认好评
	          params.comments.forEach(key => {
	            if(!key.grade) key.grade = 'good';
	            if(!this.isFirstComment && !key.comment_id) key.comment_id = key.$$goods_comment.comment_id;
		          key.images = key.images.map(item => item.response.url)
	          });
	          // 追评校验
	          if(!this.isFirstComment) {
              params.comments = params.comments.filter(key => key.$$goods_comment.audit_status === 'PASS_AUDIT');
              const result = params.comments.some(key => !key.content);
              if(result) {
                this.$message.error('请填写追评内容！');
                return false
              }
	          }
            API_Members[this.isFirstComment?'commentsOrder':'AppendCommentsOrder'](this.isFirstComment ? params : params.comments).then(() => {
              this.$message.success('发表成功');
              this.$router.replace({ path: '/member/my-comments' })
            })
          } else {
            this.$message.error('表单填写有误，请检查！');
            return false
          }
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .shop-grade {
    overflow: hidden;
    margin-bottom: 20px;
    h3 {
      font-size: 12px;
      color: #fc982c;
      height: 30px;
      line-height: 30px;
      i { margin-right: 5px; font-size: 14px }
    }
    .shop-grade-item {
      display: inline-block;
      margin-right: 20px;
      .el-rate {
        position: relative;
        top: -2px;
        display: inline-block;
        .el-rate__text {
          font-size: 12px;
        }
      }
    }
  }
  .comments-goods-box {
    overflow: hidden;
    .comments-item {
      width: 100%;
      border-top: 1px solid #e4e4e4;
      overflow: hidden;
      ::before {
        display: block;
        clear: both;
      }
    }
    .comments-goods {
      display: block;
      float: left;
      width: 219px;
      padding: 30px 50px;
    }
    .goods-image {
      width: 150px;
      height: 150px;
      margin: 0 auto;
      img { width: 100%; height: 100% }
    }
	  .goods-name {
		  text-align: center;
	  }
    .comments-content {
      float: left;
      width: 630px;
      min-height: 300px;
      padding-left: 40px;
      border-left: 1px solid #e4e4e4;
    }
    .comments-grade {
      margin: 20px 0;
    }
    .comments_score {
      margin: 12px 0;
      li{
        line-height:26px;
        color:#999;
	      .comments-images {
		      width: 75px;
		      height: 75px;
		      object-fit: contain;
	      }
      }
    }
    .comments-input /deep/ .el-form-item.is-success .el-textarea__inner {
      border-color: #dcdfe6;
    }

    .comments-images {
      width: 630px;
      height: 113px;
      overflow: hidden;
      &.limit /deep/ .el-upload--picture-card { display: none !important; }
      /deep/ {
        .el-upload-list__item, .el-upload--picture-card, .el-progress {
          width: 100px;
          height: 100px;
        }
        .el-upload--picture-card, .el-progress {
          line-height: 100px;
        }
        .el-upload-list__item-status-label i {
          margin-top: 6px !important;
        }
        .el-progress-circle {
          width: 75px !important;
          height: 75px !important;
          margin: 12.5px !important;
        }
        .el-progress__text {
          font-size: 14px !important;
        }
        .el-icon-plus {
          line-height: inherit !important;
        }
      }
    }
  }
  .comments-btn-box {
    width: 100%;
    text-align: center;
    margin-top: 30px;
    .el-button {
      width: 175px;
      background-color: #df3033;
      &:hover {
        background-color: #be2629
      }
    }
  }
  .cant-comments {
    width: 100%;
    text-align: center;
    line-height: 100px;
    font-size: 18px;
    color: #fc982c;
    i { margin-right: 10px }
  }
</style>
