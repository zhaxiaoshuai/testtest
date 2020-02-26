<template>
	<div id="my-receipt">
		<van-nav-bar left-arrow title="我的发票" @click-left="MixinRouterBack"/>
		<div class="receipt-container">
			<empty-member v-if="finished && !receiptList.length">暂无发票信息</empty-member>
			<van-list
				v-else
				v-model="loading"
				:finished="finished"
				@load="onLoad"
			>
				<div class="order-item" v-for="(receipt, index) in receiptList" :key="index">
					<div class="sn-order-item">
						<span>订单号:{{ receipt.order_sn }}</span>
						<span>{{ receipt.add_time | unixToDate }}</span>
					</div>
					<div class="info-order-item">
						<p>
							<span>状<i></i>态：</span>
							<em v-if="receipt.status === 0" style="color: #3985ff;">未开</em>
							<em v-if="receipt.status === 1" style="color: #3985ff;">已开</em>
						</p>
						<p><span>类<i></i>型：</span><em>{{ receipt.receipt_type | receiptType }}</em></p>
						<div class="order-btns" v-if="receipt.status === 1">
							<nuxt-link :to="'/member/my-receipt/detail?history_id=' + receipt.history_id">查看详情</nuxt-link>
						</div>
					</div>
					<div class="sku-order-item" v-for="(sku, index) in JSON.parse(receipt.goods_json)" :key="index">
						<div class="sku-content">
							<a :href="'/goods/' + sku.goods_id" class="img-info">
							 <img :src="sku.goods_image" :alt="sku.name">
							</a>
							<nuxt-link :to="'/goods/' + sku.goods_id" style="margin-top: 10px">
							  <div class="sku-name">{{ sku.name }}</div>
							  <p>
								  <span class="sku-spec" style="margin-right: 5px">{{ sku | formatterSkuSpec }}</span>
								  <span>{{ sku.num }}件</span>
							  </p>
						  </nuxt-link>
						</div>
					</div>
				</div>
			</van-list>
		</div>
	</div>
</template>

<script>
  import * as API_Members from '@/api/members'
  export default {
    name: 'my-receipt-index',
    data() {
      return {
        // 加载中
        loading: false,
        // 是否请求完毕
        finished:false,
        // 请求参数
        params: {
          page_no: 0,
          page_size: 10,
        },
        // 发票列表
        receiptList: []
      }
    },
    filters: {
      receiptType(type) {
        switch (type) {
          case 'VATORDINARY' : return '增值税普通发票'
          case 'ELECTRO' : return '电子普通发票'
          case 'VATOSPECIAL' : return '增值税专用发票'
          default: return ''
        }
      }
    },
    methods: {
      /** 加载发票记录 */
      onLoad() {
        this.params.page_no += 1
        this.GET_ReceiptData()
      },

      GET_ReceiptData() {
        this.loading = true
        API_Members.queryReceiptInfoList(this.params).then(response => {
          this.loading = false
          const { data } = response
          if (!data || !data.length) {
            this.finished = true
          } else {
            this.receiptList.push(...data)
          }
        })
      }
    }
  }
</script>

<style lang="scss" type="text/scss" scoped>
	@import "../../../assets/styles/color";
	.receipt-container {
		padding-top: 46px;
	}
	/deep/ {
		.van-swipe-cell__left {
			background-color: #fff;
		}
		.van-submit-bar__bar {
			padding-left: 10px;
		}
	}
	.order-item {
		margin-top: 10px;
		background-color: #fff;
		padding: 0 10px 10px 10px;
		.sn-order-item {
			position: relative;
			height: 45px;
			line-height: 45px;
			font-size: 14px;
			color: #333;
			& > span:first-child {
				float: left;
			}
			& > span:last-child {
				float: right;
				color: $color-main;
			}
			&::after {
				content: "";
				position: absolute;
				z-index: 1;
				pointer-events: none;
				background-color: #e5e5e5;
				height: 1px;
				left: 0;
				right: 0;
				bottom: 0;
				margin: 0 -10px;
			}
		}
		.info-order-item {
			display: block;
			padding: 10px 0;
			position: relative;
			&::after {
				content: "";
				height: 0;
				display: block;
				border-bottom: 1px solid #e5e5e5;
				position: absolute;
				left: 0;
				right: 0;
				bottom: 0;
			}
			p {
				line-height: 20px;
				font-size: 12px;
				color: #999;
				span { color: #666 }
				i {
					display: inline-block;
					width: 24px;
				}
			}
		}
		.order-btns {
			position: absolute;
			top: 17px;
			right: 0;
			a {
				display: inline-block;
				width: 65px;
				height: 30px;
				margin-left: 5px;
				text-align: center;
				color: #fff;
				line-height: 30px;
				z-index: 1;
				border-radius: 2px;
				background: #e4393c;
				-webkit-tap-highlight-color: rgba(0,0,0,0);
				outline: 0;
				border: none;
			}
		}
		.shop-order-item {
			display: block;
			position: relative;
			height: 40px;
			line-height: 40px;
			font-size: 14px;
			color: $color-href;
			em {
				display: block;
				position: relative;
				padding-right: 20px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				font-style: normal;
				&::after {
					position: absolute;
					content: "";
					display: block;
					width: 8px;
					height: 8px;
					border-top: 1px solid #666;
					border-left: 1px solid #666;
					transform-origin: 50%;
					transform: rotate(135deg);
					right: 5px;
					top: 14px;
				}
			}
		}
		.sku-order-item {
			position: relative;
			margin-top: 10px;
			.sku-content {
				display: block;
				overflow: hidden;
				position: relative;
				a.img-info {
					& > span {
						display: inline-block;
						position: absolute;
						bottom: 0;
						left: 27px;
						z-index: 9;
						background-color: $color-main;
						color: #fff;
					}
				}
				img {
					position: relative;
					display: block;
					width: 75px;
					height: 75px;
					float: left;
					margin-right: 10px;
				}
			}
		}
		.sku-name {
			width: calc(100% - 85px);
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			min-height: 25px;
		}
		.sku-assemble {
			display: inline-block;
			margin-left: 5px;
			float: right;
			& > em {
				color: $color-main;
			}
		}
	}
	.after-btn {
		a {
			color: $color-main;
		}
	}
</style>