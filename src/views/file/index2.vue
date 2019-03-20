<template>
  <div class="wrap">
    <Folder :config="folderConfig" @getPathArr="getPathArr"/>
  </div>
</template>

<script>

import Folder from '../../components/common/Folder.vue'
export default {
  components: {
    Folder
  },
  data() {
    return {
      folderConfig: {
        sourceId: this.$route.query.sourceId ? this.$route.query.sourceId : '-2',
        api: '/api/fileSourceView/getContentList/',
        apiDir: '/',
        searchFields: {
          type: '',
          sourceType: '',
          name: ''
        },
        pathArr: [],
        uploadConfig: {
          files: []
        },
        currentPath: {}
      }
    }
  },
  methods: {
    // 获取目前文件夹组件的面包屑导航的path集合
    getPathArr(pathArr) {
      if (pathArr && pathArr[pathArr.length - 1]) { this.folderConfig.currentPath.path = pathArr[pathArr.length - 1].parentPath } else { this.folderConfig.currentPath.path = '/' }
      this.folderConfig.currentPath.sourceId = this.sourceId
    }
  }
}
</script>

<style scoped lang='scss'>
.wrap {
  padding: 8px;
  height: 100%;
}
</style>
