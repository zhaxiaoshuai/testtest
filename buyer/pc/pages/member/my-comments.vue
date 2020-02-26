<template>
  <div id="my-comments">
    <div class="member-nav" v-if="$route.path !== '/member/my-comments/detail'">
      <ul class="member-nav-list">
        <li v-for="item in navList" :key="item.status">
	        <nuxt-link v-if="item.status === 'WAIT_COMMENT'" :to="'./my-comments'">{{ item.title }}</nuxt-link>
          <nuxt-link v-else :to="'./my-comments?comments_status=' + item.status">{{ item.title }}</nuxt-link>
        </li>
      </ul>
    </div>
    <wait-comment v-if="!$route.query.comments_status && !$route.query.comment_id"></wait-comment>
    <wait-chase v-if="$route.query.comments_status === 'WAIT_CHASE'"></wait-chase>
    <finished v-if="$route.query.comments_status === 'FINISHED'"></finished>
    <detail v-if="$route.path === '/member/my-comments/detail'"></detail>
  </div>
</template>

<script>
  import * as API_Members from '@/api/members'
  export default {
    name: 'my-comments',
    head() {
      return {
        title: `我的评论-${this.site.title}`
      }
    },
    data() {
      return {
        navList: [
          { title: '待评价订单', status: 'WAIT_COMMENT' },
          { title: '待追评', status: 'WAIT_CHASE' },
          { title: '已评价', status: 'FINISHED' }
        ]
      }
    },
    components: {
      'wait-comment': resolve => require(['./my-comments/walt-comment.vue'], resolve),
      'wait-chase': resolve => require(['./my-comments/wait-chase.vue'], resolve),
      'finished': resolve => require(['./my-comments/finished.vue'], resolve),
      'detail': resolve => require(['./my-comments/detail.vue'], resolve)
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
</style>
