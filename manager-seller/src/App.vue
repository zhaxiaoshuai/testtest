<template>
	<div id="app">
		<router-view></router-view>
	</div>
</template>

<script>
  import { api } from '~/ui-domain'
  export default{
    name: 'APP',
    async mounted() {
      const { data } = await this.$http.get(`${process.env.API_BASE || api.base}/site-show`)
      document.title = data.site_name
    }
  }
</script>
