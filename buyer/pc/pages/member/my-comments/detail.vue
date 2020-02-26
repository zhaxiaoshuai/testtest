<template>
  <div id="comments-detail">
      <div class="comments-title">
        <span class="title">评价详情</span>
        <span>快乐的你分享完美的使用心得~</span>
      </div>
      <div class="comments-goods-box">
        <div class="comments-item">
          <a class="comments-goods">
            <div class="show-goods-image" v-if="commentsDetail.goods_images">
              <a :href="'/goods/' + commentsDetail.goods_images.goods_id" target="_blank">
                <img :src="commentsDetail.goods_images.original">
              </a>
            </div>
            <div class="goods-name">
              <a :href="'/goods/' + commentsDetail.goods_id" target="_blank">
                <span>{{ commentsDetail.goods_name }}</span>
                <p class="sku-spec"></p>
              </a>
            </div>
          </a>
          <div class="comments-content">
            <div class="shop-grade" v-if="commentsDetail.member_shop_score">
              <h3>店铺评分</h3>
              <ul>
                <li class="shop-grade-item">描述相符：<el-rate v-model="commentsDetail.member_shop_score.description_score" score-template="{value}分" text-color="#666" show-score></el-rate></li>
                <li class="shop-grade-item">服务态度：<el-rate v-model="commentsDetail.member_shop_score.service_score" score-template="{value}分" text-color="#666" show-score></el-rate></li>
                <li class="shop-grade-item">物流服务：<el-rate v-model="commentsDetail.member_shop_score.delivery_score" score-template="{value}分" text-color="#666" show-score></el-rate></li>
              </ul>
            </div>
            <div class="first-comments">
               <ul>
                 <li>评价：{{commentsDetail.grade | gradeFilter}}</li>
                 <li>初评日期：{{commentsDetail.create_time || '' | unixToDate}}</li>
                 <li>{{commentsDetail.content}}</li>
                 <li>
                   <div v-if="commentsDetail.have_image === 1" class="comment-images">
                     <viewer :images="commentsDetail.images">
                       <a
                         :key="index"
                         class="comment-img-item"
                         v-for="(image, index) in commentsDetail.images"
                       >
                         <img :src="image" alt="">
                       </a>
                     </viewer>
                     <span class="clear"></span>
                   </div>
                 </li>
               </ul>
              <div class="reply-comments" v-if="commentsDetail.reply">
                <ul>
                  <li>初评回复日期：{{commentsDetail.reply.create_time || '' | unixToDate}}</li>
                  <li>{{commentsDetail.reply.content}}</li>
                </ul>
              </div>
            </div>
            <div class="append-comments" v-if="commentsDetail.additional_comment">
              <ul>
                <li>追评日期：{{commentsDetail.additional_comment.create_time | unixToDate}}</li>
                <li>{{commentsDetail.additional_comment.content}}</li>
                <li>
                  <div v-if="commentsDetail.additional_comment.have_image === 1" class="comment-images">
                    <viewer :images="commentsDetail.additional_comment.images">
                      <a
                        :key="index"
                        class="comment-img-item"
                        v-for="(image, index) in commentsDetail.additional_comment.images"
                      >
                        <img :src="image" alt="">
                      </a>
                    </viewer>
                    <span class="clear"></span>
                  </div>
                </li>
              </ul>
              <div class="reply-comments" v-if="commentsDetail.additional_comment.reply">
                <ul>
                  <li>追评回复日期：{{commentsDetail.additional_comment.reply.create_time || '' | unixToDate}}</li>
                  <li>{{commentsDetail.additional_comment.reply.content}}</li>
                </ul>
              </div>
            </div>
            
          </div>
        </div>
      </div>
  </div>
</template>

<script>
  import * as API_Members from '@/api/members'
  import Vue from 'vue'
  import 'viewerjs/dist/viewer.css'
  import Viewer from 'v-viewer'
  import { Rate } from 'element-ui'
  Vue.use(Viewer).use(Rate);
  export default {
    name: 'comments-detail',
    data() {
      return {
        /** 评价详情信息 */
        commentsDetail:'',
        comment_id: this.$route.query.comment_id
      }
    },
    mounted() {
      this.GET_commentsDetail()
    },
    filters: {
      gradeFilter(val) {
        switch (val) {
          case 'bad':
            return '差评';
          case 'neutral':
            return '中评';
          default:
            return '好评'
        }
      }
    },
    methods: {
      /** 获取评价详情 */
      GET_commentsDetail() {
        API_Members.getCommentsDetail(this.comment_id).then(response => {
          this.commentsDetail = response
        })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .comments-title{
    height:60px;
    background:#e4e4e4;
    text-align: center;
    padding-top: 20px;
    span{
      display: block;
    }
    .title{
      color: #000;
      font-size:16px;
      font-weight: bold;
      padding-bottom:5px;
    }
  }
  .comments-goods-box {
    .comments-item {
      border: 1px solid #e4e4e4;
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
      text-align: center;
    }
    .show-goods-image {
      width: 150px;
      height: 150px;
      margin: 15.5%;
      img { width: 100%; height: 100% }
    }
    .goods-image {
      width: 150px;
      height: 150px;
      margin: 5px;
      img { width: 100%; height: 100% }
    }
    .comments-content {
      float: left;
      width: 588px;
      min-height: 300px;
      padding:0 40px;
      border-left: 1px solid #e4e4e4;
      .first-comments{
        padding:40px 0 20px;
        border-top: 1px solid #e4e4e4;
        li{
          line-height:20px;
          padding-bottom:10px;
        }
      }
      .append-comments{
        border-top:1px solid #e4e4e4;
        padding-top: 30px;
        li{
          line-height:20px;
          padding-bottom:10px;
        }
      }
      .reply-comments{
        padding:40px 0 20px;
        li{
          line-height:20px;
          padding-bottom:10px;
        }
      }
    }
  }
  .comment-images {
    padding: 10px 0;
  }
  .comment-img-item {
    float: left;
    display: block;
    width: 50px;
    height: 50px;
    margin-right: 10px;
    cursor: pointer;
    border: 1px solid #e2e2e2;
    padding: 1px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .shop-grade {
    overflow: hidden;
    margin-bottom: 20px;
    h3 {
      font-size: 12px;
      height: 30px;
      line-height: 30px;
      i { margin-right: 5px; font-size: 14px }
    }
    .shop-grade-item {
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
</style>
