import FloorTagsPicker from './FloorTagsPicker'
import FloorTitlePicker from './FloorTitlePicker'
import GradeEditor from './GradeEditor'
import ShopPicker from './ShopPicker'
import BrandPicker from './BrandPicker'
import UE from './UE'

const components = {
  FloorTagsPicker,
  FloorTitlePicker,
  GradeEditor,
  ShopPicker,
  BrandPicker
}

components.install = function(Vue) {
  Object.keys(components).forEach(key => {
    key !== 'install' && Vue.component(components[key].name, components[key])
  })
}

export default components

export {
  FloorTagsPicker,
  FloorTitlePicker,
  GradeEditor,
  ShopPicker,
  BrandPicker,
  UE
}
