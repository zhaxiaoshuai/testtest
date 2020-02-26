<template>
	<div>
		<div class="member-nav">
			<ul class="member-nav-list">
				<li class="active">
					<a href="./my-footprint">我的足迹</a>
				</li>
			</ul>
		</div>
		<empty-member v-if="footPrints && !footPrints.data.length">暂无足迹信息</empty-member>
		<div v-else class="foot-print-container">
			<el-timeline :reverse="reverse">
				<el-timeline-item
					v-for="(foot, index) in footPrints.data"
					:key="index"
					:timestamp="foot.time | unixToDate('yyyy-MM-dd')"
					placement="top"
					type="danger"
					color="hex"
				>
					<span class="del-item" @click="Del_HistoryDetail(foot)">删除</span>
					<div class="goods-print-out">
						<div class="goods-print" v-for="(goods, _index) in foot.history" :key="_index">
							<nuxt-link target="_blank" :to="`/goods/${goods.goods_id}`">
								<img :src="goods.goods_img" :alt="goods.goods_name"/>
								<p class="goods-name">{{ goods.goods_name }}</p>
							</nuxt-link>
							<span class="goods-price">¥{{ goods.goods_price | unitPrice }}</span>
							<i class="el-icon-close" @click="Del_HistoryDetailId(goods.id)"></i>
						</div>
					</div>
				</el-timeline-item>
			</el-timeline>
			<div class="member-pagination">
				<el-pagination
					@current-change="handleCurrentPageChange"
					:current-page.sync="params.page_no"
					:page-size="params.page_size"
					layout="total, prev, pager, next"
					:total="footPrints.data_total">
				</el-pagination>
			</div>
			<el-button
				class="clear-btn"
				@click="Clear_HistoryList()"
				size="mini"
				type="danger"
				plain
				icon="el-icon-delete">清空</el-button>
		</div>
	</div>
</template>

<script>
	import Vue from 'vue'
  import { Timeline, TimelineItem } from 'element-ui'
  Vue.use(Timeline).use(TimelineItem);
	import * as API_Member from '@/api/members'
  export default {
    name: 'my-footprint',
	  data() {
      return {
        // 参数
        params: {
          page_no: 1,
	        pase_size: 10
        },
        // 是否倒序
        reverse: false,
	      // 足迹列表
        footPrints: ''
      }
	  },
	  mounted(){
      this.GET_HistoryDetail()
	  },
	  methods: {
      /** 当前页数发生改变 */
      handleCurrentPageChange(cur) {
        this.params.page_no = cur;
        this.GET_HistoryDetail()
      },

		  /** 根据日期清空会员足迹 */
		  Del_HistoryDetail(foot) {
        API_Member.deleteHistoryDetailDate(foot.time).then(_ => {
          this.footPrints = '';
          this.GET_HistoryDetail()
        })
		  },

      /** 根据id清空会员足迹 */
      Del_HistoryDetailId(goods_id) {
        API_Member.deleteHistoryDetailId(goods_id).then(_ => {
          this.footPrints = '';
          this.GET_HistoryDetail()
        })
      },

      /** 清空会员足迹 */
      Clear_HistoryList() {
        API_Member.clearHistoryList().then(_ => {
	        this.footPrints = { data: [] }
        })
      },

      /** 获取我的会员足迹列表 */
      GET_HistoryDetail() {
        API_Member.queryHistoryDetail(this.params).then(response => {
          this.footPrints = response
        })
      }
	  }
  }
</script>

<style type="text/scss" lang="scss" scoped>
	.member-nav {
		margin-bottom: 10px;
	}
	.foot-print-container {
		background-color: #f1f1f1;
		padding: 20px;
		position: relative;
	}
	.el-timeline-item__content {
		position: relative;
		& > span.del-item {
			position: absolute;
			top: 1.5px;
			left: 110px;
			font-size: 12px;
			color: #f42424;
			cursor: pointer;
		}
	}
	.goods-print-out {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-start;
	}
  .goods-print {
	  margin: 5px 20px;
	  padding: 15px;
	  background-color: white;
	  width: 160px;
	  height: 220px;
	  display: inline-block;
	  position: relative;
	  img {
		  width: 160px;
		  height: 160px;
	  }
	  .goods-name {
		  display: -webkit-box;
		  -webkit-box-orient: vertical;
		  -webkit-line-clamp: 2;
		  overflow: hidden;
		  height: 36px;
	  }
	  & > .goods-price {
		  display: inline-block;
		  width: 100%;
		  text-align: center;
      color: #f42424;
		  margin-top:5px;
	  }
	  & > i {
		  position: absolute;
		  top: 8px;
		  right: 8px;
		  width: 15px;
		  height: 15px;
		  cursor: pointer;
		  display: inline-block;
		  background-color: #fff;
		  border-radius: 50%;
	  }
  }
  /** 清空按钮*/
	.clear-btn {
    position: absolute;
		top: 10px;
		right: 10px;
	}
</style>
