<template>
  <div class="upload-dialog">
    <el-dialog
      :visible.sync="show"
      title="文件上传"
      width="540px">
      <file-uploader
        v-model="upload.files"
        :attach-params="upload.attachParams"
        :multiple="false"
        style="display: inline-block"
        @error="uploadError"/>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          size="small"
          @click="submit">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import FileUploader from '../../components/common/FileUploader'
export default {
  name: 'UploadDialog',
  components: { FileUploader },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    attachParams: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      show: this.visible,
      upload: {
        files: [],
        attachParams: this.attachParams
      }
    }
  },
  watch: {
    visible(newVal) {
      this.show = newVal
    },
    show(newVal) {
      if (newVal) {
        this.upload = {
          files: [],
          attachParams: {}
        }
      } else {
        this.$emit('update:visible', newVal)
      }
    },
    'attachParams': {
      handler(newVal) {
        this.upload.attachParams = newVal
      },
      deep: true
    }
  },
  methods: {
    uploadError() {
      this.$message({
        message: '上传失败',
        type: 'error'
      })
    },
    submit() {
      this.show = false
      this.$emit('refresh')
    }
  }
}
</script>

<style lang="scss" scoped>
  .upload-dialog {
    .upload-label {
      line-height: 30px;
      display: inline-block;
      vertical-align: top;
      margin-right: 6px;
    }
  }
</style>
