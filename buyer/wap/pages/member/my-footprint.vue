<template>
	<div id="my-footprints">
		<van-nav-bar left-arrow title="浏览记录" @click-left="MixinRouterBack">
			<div slot="right" class="btn-top" v-if="footPrintsList && footPrintsList.length">
				<span v-if="!isEdit" @click="clearFootPrints">清空</span>&nbsp;&nbsp;<span v-if="!isEdit" @click="editFootPrints">编辑</span>
				<span v-if="isEdit" @click="finishedFootPrints">完成</span>
			</div>
		</van-nav-bar>
		<div class="footprints-container">
			<empty-member v-if="finished && !footPrintsList.length">还没有足迹？快去逛逛吧</empty-member>
			<van-list
				v-else
				v-model="loading"
				:finished="finished"
				@load="onLoad"
			>
				<div class="foot-print" v-for="(footprint, index) in footPrintsList" :key="index">
					<p class="foot-print-time">{{ footprint.time | unixToDate('yyyy-MM-dd') }}</p>
					<div v-for="(goods, _index) in footprint.history" :key="_index">
						<van-swipe-cell ref="goodslist" :right-width="65" :left-width="65" :on-close="onClose">
							<div class="goods-info-exit">
								<nuxt-link :to="`/goods/${goods.goods_id}`">
									<img class="goods-img" :src="goods.goods_img" alt="">
								</nuxt-link>
								<div class="goods-text">
									<nuxt-link :to="`/goods/${goods.goods_id}`">
										<p class="goods-name">{{ goods.goods_name }}</p>
									</nuxt-link>
									<p class="goods-price">￥{{ goods.goods_price | unitPrice }} </p>
								</div>
							</div>
							<div slot="left" class="sku-check" @click="handleChangeCheck(goods)">
								<van-icon :name="goods.checked ? 'checked' : 'check'"/>
							</div>
							<span slot="right" class="del-sku" @click="deleteFootPrintsId(goods)">删除</span>
						</van-swipe-cell>
					</div>
				</div>
			</van-list>
			<van-submit-bar
				v-if="isEdit"
				button-text="删除"
				@submit="deleteAll"
			>
				<div class="all-check" @click="handleChangeCheckAll">
					<van-icon :name="checkedAll ? 'checked' : 'check'"/>全选
				</div>
			</van-submit-bar>
		</div>
	</div>
</template>

<script>
  import * as API_Members from '@/api/members'
  export default {
    name: 'my-footprints',
    head() {
      return {
        title: `我的足迹-${this.site.title}`
      }
    },
    data() {
      return {
        footPrintsList: [],
        loading: false,
        finished: false,
        params: {
          page_no: 0,
          page_size: 10
        },
	      // 是否是编辑状态
	      isEdit: false,
	      // 是否全选
        checkedAll: false
      }
    },
    methods: {
      onLoad(page) {
        this.params.page_no += 1
        this.GET_footprints()
      },

	    /** 获取浏览足迹 */
      GET_footprints() {
        this.loading = false
        API_Members.queryHistoryList(this.params).then(response => {
          this.loading = false
          const { data } = response
          if (!data || !data.length) {
            this.finished = true
          } else {
            data.forEach(key => {
              key.history.forEach(item => {
                if(!item.checked) {
                  this.$set(item, 'checked', false)
                }
              })
            })
            this.footPrintsList.push(...data)
          }
        })
      },

	    /** 清空浏览记录 */
      clearFootPrints() {
        API_Members.clearHistoryList().then(_ => {
	        this.footPrintsList = []
          this.params = { page_no: 0, page_size: 10 }
          this.finished = true
        })
      },

	    /** 编辑 */
      editFootPrints() {
		    if (this.$refs.goodslist) {
          this.isEdit = true
          this.$refs.goodslist.forEach(key => { key.open('left') })
		    }
      },

	    /** 完成编辑 */
      finishedFootPrints() {
        if (this.$refs.goodslist) {
          this.isEdit = false
          this.$refs.goodslist.forEach(key => { key.close('left') })
	        // 重置所有选择框为未选中状态
          this.footPrintsList.forEach(key => {
            key.history.forEach(item => {
              item.checked = false
            })
          })
        }
      },

	    /** 点击勾选/不勾选 */
      handleChangeCheck(goods) {
		    goods.checked = !goods.checked
		    // 检测是否全选
		    const isCheckedAll = this.footPrintsList.every(key => {
          return key.history.every(item => item.checked)
		    })
		    // 如果是全选
        this.checkedAll = isCheckedAll
      },

	    /** 执行全选 */
      handleChangeCheckAll() {
        this.checkedAll = !this.checkedAll
        this.footPrintsList.forEach(key => {
          key.history.forEach(item => {
            item.checked = this.checkedAll
          })
        })
      },

	    /** 监听关闭 左侧不得自动关闭*/
      onClose(clickPosition, instance) {
        switch (clickPosition) {
          case 'left': return false
        }
      },

	    /** 根据id删除足迹 */
      deleteFootPrintsId(goods) {
        this.footPrintsList = []
        API_Members.deleteHistoryListId(goods.id).then(_ => {
          this.GET_footprints()
        })
      },

	    /** 执行删除 所有选择的id */
      deleteAll() {
        this.footPrintsList.forEach(key => {
          key.history.forEach(item => {
	          if(item.checked) {
              this.deleteFootPrintsId(item)
	          }
          })
        })
		    this.finishedFootPrints()
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
	@import "../../assets/styles/color";
	/deep/ {
		.van-swipe-cell__left {
			background-color: #fff;
		}
		.van-submit-bar__bar {
			padding-left: 10px;
		}
	}
	.btn-top {
		& > span {
			cursor:pointer;
		}
	}
	.footprints-container {
		padding-top: 46px;
		padding-bottom: 46px;
	}
	.foot-print {
		width: 100%;
		border-bottom: 2px solid #e5e5e5;
		& > .foot-print-time {
			width: 100%;
			border-bottom: 1px solid #f1f1f1;
			padding: 10px;
			font-size: 16px;
		}
	}
	.goods-info-exit {
		padding:10px;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		.goods-img {
			display: block;
			width: 75px;
			height: 75px;
		}
		& > .goods-text {
			width: calc(100% - 75px - 10px);
			margin-left: 10px;
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			align-items: flex-start;
			& > .goods-name {
				font-size: 12px;
				color: #333;
			}
			& > .goods-price {
				color: #f42424;
				font-size: 13px;
			}
		}
	}
  /deep/ {
	  .van-icon {
		  font-size: 18px;
		  color: #666;
	  }
	  .van-icon-checked {
		  color: $color-main
	  }
  }
	.all-check {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		.van-icon {
			margin-right: 5px;
		}
	}

</style>
