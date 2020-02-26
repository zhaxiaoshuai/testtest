/**
 * 商品规格选择器
 */
import Vue from 'vue'
import UploadSortable from './src/main'

UploadSortable.install = () => {
  Vue.component(UploadSortable.name, UploadSortable)
}

export default UploadSortable
