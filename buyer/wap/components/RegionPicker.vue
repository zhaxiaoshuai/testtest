<template>
  <div></div>
</template>

<script>
  import { api } from '@/ui-domain'
  export default {
    name: 'EnRegionPicker',
    data(){
      return{
        value:null
      }
    },
    props: {
      default: {
        default: null
      },
      api: {
        type: String,
        default: `${api.base}/regions/@id/children`
      },
      show: {
        default: false
      }
    },
    watch: {
      default(next) {
        this.value = Array.isArray(next) ? next : null
        this.initAddressSelect()
      },
      show(newVal) {
        newVal && $(this.$el).click()
      }
    },
    mounted() {
      this.initAddressSelect()
    },
    methods: {
      callback(object) {
        this.$emit('changed', object)
      },
      closed() {
        this.$emit('closed')
      },
      initAddressSelect() {
        this.$nextTick(() => {
          $(this.$el).addressSelect({
            api: this.api,
            callback: this.callback,
            deData: this.value,
            closed: this.closed
          })
        })
      }
    },
    destroyed() {
      $('#selectAddressApp').remove()
      $('#addressSelectorStyle').remove()
    }
  }
</script>
