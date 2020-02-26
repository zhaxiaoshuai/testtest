<template>
  <nuxt-child></nuxt-child>
</template>

<script>
  export default {
    name: 'my-comments',
    head() {
      return {
        title: `我的订单-${this.site.title}`
      }
    }
  }
</script>
