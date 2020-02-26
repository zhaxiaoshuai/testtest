/**
 * 品牌选择组件
 * 返回brand_id
 */
import Vue from 'vue'
import BrandPicker from './src/main'

BrandPicker.install = () => {
  Vue.component(BrandPicker.name, BrandPicker)
}

export default BrandPicker
