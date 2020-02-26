<template>
  <div style="display: inline-block">
    <el-select
      v-model="brand_id"
      placeholder="选择品牌"
      @change="handleBrandChanged"
      style="width: 150px"
      filterable
      clearable
      v-bind="$attrs"
    >
      <el-option
        v-for="item in brandList"
        :key="item.brand_id"
        :label="item.name"
        :value="item.brand_id"/>
    </el-select>
  </div>
</template>

<script>
  import * as API_brand from '@/api/brand'

  export default {
    name: 'EnBrandPicker',
    data() {
      return {
        brand_id: '',
        brandList: []
      }
    },
    created() {
      API_brand.getAllBrandList().then(response => (this.brandList = response))
    },
    methods: {
      handleBrandChanged() {
        const brand = this.brandList.filter(item => item.brand_id === this.brand_id)
        this.$emit('changed', brand[0] || { brand_id: 0, name: '全部' })
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>

</style>
