<template>
	<nuxt-child></nuxt-child>
</template>

<script>
  export default {
    name: 'increase-ticket',
    head() {
      return {
        title: `增票资质-${this.site.title}`
      }
    }
  }
</script>
