<template>
  <div id="comments-detail">
    <van-nav-bar
      left-arrow
      title="评价详情"
      @click-left="MixinRouterBack"
    >
    </van-nav-bar>
    <div class="comments-goods-box">
      <div class="comments-item">
        <a class="comments-goods" v-if="commentsDetail.goods_images">
          <div class="goods-image">
            <a :href="'/goods/' + commentsDetail.goods_images.goods_id" target="_blank">
              <img :src="commentsDetail.goods_images.original">
            </a>
          </div>
          <div class="goods-name">
            <span>{{commentsDetail.goods_name}}</span>
            <p class="sku-spec"></p>
          </div>
        </a>
        <div class="comments-content">
          <div class="first-comments">
            <ul>
              <li>初评日期：{{commentsDetail.create_time | unixToDate }}</li>
              <li>{{commentsDetail.grade | gradeFilter }}</li>
              <li>{{commentsDetail.content }}</li>
	            <li>
		            <p v-if="commentsDetail.have_image === 1" @click="showPreImg = true;indexes = 0">
			            <van-image-preview
				            v-model="showPreImg"
				            :images="commentsDetail.images"
				            @change="(index) => { indexes = index }"
			            >
				            <template v-slot:index>第{{ indexes }}张</template>
			            </van-image-preview>
			            <img v-for="(imgsrc,imgindex) in commentsDetail.images" :src="imgsrc" class="goods-image" :key="imgindex" style="width:50px;height:50px;"/>
		            </p>
	            </li>
            </ul>
          </div>
          <div class="append-comments" v-if="commentsDetail.additional_comment">
            <ul>
              <li>追评日期：{{commentsDetail.additional_comment.create_time | unixToDate}}</li>
              <li>{{commentsDetail.additional_comment.content}}</li>
	            <li>
		            <p v-if="commentsDetail.additional_comment.have_image === 1" @click="showPreImg = true;indexes = 0">
			            <van-image-preview
				            v-model="showPreImg"
				            :images="commentsDetail.additional_comment.images"
				            @change="(index) => { indexes = index }"
			            >
				            <template v-slot:index>第{{ indexes }}张</template>
			            </van-image-preview>
			            <img v-for="(addimg,addimgindex) in commentsDetail.additional_comment.images" :src="addimg" class="goods-image" :key="addimgindex" style="width:50px;height:50px;"/>
		            </p>
	            </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
	import Vue from 'vue'
  import { ImagePreview } from 'vant'
  Vue.use(ImagePreview)
  import * as API_Members from '@/api/members'
  export default {
    name: 'comments-detail',
    data() {
      return {
        /** 评价详情信息 */
        commentsDetail:'',
        comment_id: this.$route.query.comment_id,
        indexes: 0,
	      /** 是否显示图片预览 */
        showPreImg: false
      }
    },
    mounted() {
      this.GET_commentsDetail()
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
  @import "../../../assets/styles/color";
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
	  padding-top: 46px;
    .comments-item {
      overflow: hidden;
      ::before {
        display: block;
        clear: both;
      }
    }
    .comments-goods {
      padding: 10px 40px;
	    display: flex;
	    flex-wrap: nowrap;
	    flex-direction: row;
	    justify-content: flex-start;
	    align-items: center;
    }
    .goods-image {
      width: 75px;
      height: 75px;
      margin: 0 auto;
	    flex:1;
	    padding: 2px;
      img {
	      width: 75px;
	      height: 75px;
      }
    }
	  .goods-name {
		  flex: 4;
		  margin-left: 5px;
		  span {
			  word-break: break-all;
		  }
	  }
    .comments-content {
      padding:0 40px;
      .first-comments{
        border-bottom:1px solid #e4e4e4;
        li{
          line-height:20px;
          padding-bottom:10px;
        }
      }
      .append-comments{
        padding-top: 30px;
        li{
          line-height:20px;
          padding-bottom:10px;
        }
      }
    }
  }
</style>
