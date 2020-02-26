<template>
  <div id="footer">
    <span class="clr"></span>
    <div class="help-center-footer">
      <div class="w" v-if="categorys">
	      <dl v-if="index < 5" v-for="(cate, index) in categorys" :key="index" :class="`fore${++index}`">
          <dt>{{ cate.name }}</dt>
          <dd v-for="article in cate.articles" :key="article.article_id">
	          <a target="_blank" :href="`/help/${article.article_id}`">{{ article.article_name }}</a>
          </dd>
        </dl>
        <span class="clr"></span>
      </div>
    </div>
    <div class="link-footer">
      <div class="w">
        <a href="/">首页</a>
        | <nuxt-link to="/member">会员中心</nuxt-link>
        | <a href="/shop/apply" target="_blank">商家入驻</a>
        | <a href="/help/100" target="_blank">关于网站</a>
        | <a href="/help/98" target="_blank">关于我们</a>
        | <a href="/help/99" target="_blank">联系我们</a>
        | <a href="https://www.javamall.com.cn" title="JAVA B2B2C网店系统">网店系统</a>
      </div>
    </div>
  </div>
</template>

<script>
  import * as API_Article from '@/api/article'
  export default {
    name: 'EnFooter',
	  data() {
      return {
        categorys: []
      }
	  },
	  async mounted() {
      const { children } = await API_Article.getArticleCategory('HELP');
		  this.categorys = children.reverse()
	  }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  @import "../assets/styles/color";
  /* Footer */
  #footer {
    background-color: #f5f6f5;
    a { color: #666 }
    a:hover { color: $color-main }
    .help-center-footer {
      border-bottom: solid 1px #eaeaea;
      padding: 20px 0;
      dl {
        box-sizing: border-box;
        width: 20%;
        float: left;
        padding-left: 75px;
        line-height: 22px;
      }
      dt {
        padding-bottom: 6px;
        font-weight: 700;
        font-size: 14px;
        color: #777;
        height: 22px;
      }
      dd {
        font-size: 12px;
        color: #666;
        height: 22px;
        overflow: hidden;
      }
    }
    .link-footer {
      text-align: center;
      height: 40px;
      line-height: 40px;
    }
  }
</style>
