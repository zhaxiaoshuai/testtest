<template>
  <div class="upload-queue" @change="updateList(goods_gallery_list)">
    <draggable v-model="goods_gallery_list" @start="drag=true" @end="drag=false" 
      class="el-upload-list el-upload-list--picture-card">
      <div class="el-upload-list__item" v-for="(item, index) in goods_gallery_list" :key="index">
      <img :src="item.url" class="el-upload-list__item-thumbnail">
      <span class="el-upload-list__item-actions">
        <span class="el-upload-list__item-preview" @click="handlePreview(item.url)">
          <i class="el-icon-zoom-in"></i>
        </span>
        <span class="el-upload-list__item-delete" @click="handleDraggableRemove(item, index)">
          <i class="el-icon-delete"></i>
        </span>
      </span>
      </div>
    </draggable>
    <el-upload
      class="avatar-uploader goods-images"
      :action="`${MixinUploadApi}?scene=goods`"
      :show-file-list='false'
      list-type="picture-card"
      :multiple='true'
      :file-list="goods_gallery_list"
      :on-preview="handlePictureCardPreview"
      :before-upload="beforeAvatarUpload"
      :on-remove="handleRemove"
      :on-error="handleError"
      :on-success="handleSuccess">
      <i class="el-icon-plus avatar-uploader-icon"></i>
      <div slot="tip" class="el-upload__tip">建议上传jpg/png文件，且不超过1MB</div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl">
    </el-dialog>
  </div>
</template>

<script>
  import draggable from 'vuedraggable'
  export default {
    name: 'UploadSortable',
    components: { draggable },
    props: {
      max: {
        type: Number,
        default: 15
      },
      goodsGalleryList: {
        type: Array,
        default: () => []
      },
      param: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        drag: false,
        dragOptions: {
          animation: 200,
          group: 'description',
          disabled: false,
          ghostClass: 'ghost'
        },
        /** 用来校验的商品相册 */
        goods_gallery: [],
        dialogImageUrl: '',
        dialogVisible: false
      }
    },

    computed: {
      goods_gallery_list: {
        get() {
          return this.goodsGalleryList
        },
        set(val) {
          this.updateList(val)
        }
      }
    },

    methods: {
      updateList(list) {
        this.$emit('change', list)
      },

      /** 点击已上传的文件链接时的钩子 放大 */
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url
        this.dialogVisible = true
      },

      /** 图片上传之前的校验  */
      beforeAvatarUpload(file) {
        const isType = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'
        const isLt1M = file.size / 1024 / 1024 < 1

        if (!isType) {
          this.$message.error('上传头像图片只能是 JPG/JPEG/PNG 格式!')
        }
        if (!isLt1M) {
          this.$message.error('上传商品相册图片大小不能超过 1MB!')
        }

        /** 重复校验*/
        const isExit = this.goods_gallery_list.some(key => {
          return file.name === key.name
        })
        if (isExit) {
          this.$message.error('图片已存在')
        }

        return isType && isLt1M && !isExit
      },

      /** 文件列表上传成功时的钩子  上传成功校验 */
      handleSuccess(response, file, fileList) {
        if (fileList[fileList.length - 1].response) {
          fileList.map(item => {
            if (item.response) {
              this.goods_gallery_list.push({
                img_id: -1,
                original: item.response.url,
                url: item.response.url,
                sort: 0,
                name: item.response.name
              })
              this.$emit('change', this.goods_gallery_list)
            }
          })
        }
      },

      handleError() {
        this.$message.error('上传失败!')
      },

      handleDraggableRemove(file, index) {
        this.goods_gallery_list.splice(index, 1)
        this.$emit('change', this.goods_gallery_list)
      },

      handleRemove(file, fileList) {
        this.goods_gallery_list.forEach((key, index) => {
          if (key.img_id !== -1) {
            if (key.img_id === file.img_id) {
              this.goods_gallery_list.splice(index, 1)
            }
          } else {
            if (key.name === file.response.name) {
              this.goods_gallery_list.splice(index, 1)
            }
          }
        })
        if (fileList.length <= 0) {
          this.goods_gallery_list = []
        }
      },

      handlePreview(url) {
        this.dialogImageUrl = url
        this.dialogVisible = true
      }
    }
  }
</script>

<style lang="scss">
  @import './index.scss';
</style>
