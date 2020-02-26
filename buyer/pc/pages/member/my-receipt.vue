<template>
  <nuxt-child></nuxt-child>
</template>

<script>
  export default {
    name: 'my-receipt',
    head() {
      return {
        title: `我的发票-${this.site.title}`
      }
    }
  }
</script>
