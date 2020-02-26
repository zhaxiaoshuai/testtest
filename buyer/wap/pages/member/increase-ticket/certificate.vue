<template>
	<div class="certificate-container">
		<van-nav-bar left-arrow title="申请开具增值税专用发票确认书" @click-left="MixinRouterBack"/>
		<h4>申请开具增值税专用发票确认书</h4>
		<p>根据国家税法及发票管理相关规定，任何单位和个人不得要求他人为自己开具与实际经营业务情况不符的增值税专用发票【包括并不限于
      （1）在没有货物采购或者没有接受应税劳务的情况下要求他人为自己开具增值税专用发票；
			（2）虽有货物采购或者接受应税劳务但要求他人为自己开具数量或金额与实际情况不符的增值税专用发票】，否则属于“虚开增值税专用发票”。<br/><br/>
			我已充分了解上述各项相关国家税法和发票管理规定，并确认仅就我司实际购买商品或服务索取发票。
			如我司未按国家相关规定申请开具或使用增值税专用发票，由我司自行承担相应法律后果。</p>
	</div>
</template>

<script>
	export default {
	  name: 'increase-ticket-certificate'
	}
</script>

<style lang="scss" type="text/scss" scoped>
  .certificate-container {
	  padding-top: 46px;
	  h4 {
		  width: 100%;
		  text-align: center;
		  padding: 10px 0;
		  font-size: 15px;
	  }
	  p {
		  text-align: left;
		  padding: 10px;
		  font-size: 12px;
		  color: #aaa;
	  }
  }
</style>
