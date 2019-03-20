<template>
  <div class="wrap">
    <div style="height: 100%;">
      <div class="panel-box">
        <div class="operation-bar">
          <el-button
            size="small"
            icon="el-icon-upload"
            type="primary"
            @click="addFile">上传文件
          </el-button>
          <el-button
            icon="el-icon-plus"
            class="button-class"
            size="small"
            @click="addFolder">新建文件夹
          </el-button>
          <el-button-group v-show="selectedFileList.length">
            <el-button
              class="button-class"
              size="small"
              icon="el-icon-share">分享</el-button>
            <el-button
              :disabled="isDownload"
              class="button-class"
              size="small"
              icon="el-icon-download">下载</el-button>
            <el-button
              class="button-class"
              size="small"
              icon="el-icon-delete"
              @click="deleteFile(null)">删除</el-button>
            <el-button
              :disabled="selectedFileList.length > 1"
              class="button-class"
              style="height: 33px;"
              size="small"
              @click="fileEdit(selectedFileList[0])">重命名</el-button>
            <el-button
              class="button-class"
              style="height: 33px;"
              size="small"
              @click="copyFile(null)">复制到</el-button>
            <el-button
              class="button-class"
              style="height: 33px;"
              size="small"
              @click="moveFile(null)">移动到</el-button>
          </el-button-group>
        </div>
        <div class="search-bar">
          <el-input
            v-model.trim="name"
            size="small"
            placeholder="搜索您的文件">
            <el-button slot="append" icon="el-icon-search"/>
          </el-input>
        </div>
      </div>
      <div class="breadCrumbs">
        <span
          v-show="parentListShow"
          class="colorBlue"
          @click.stop="getPreFileList">返回上一级&nbsp;|</span>
        <span class="colorBlue" @click.stop="getAllFileList">全部文件</span>
        <span>
          <span></span>
          <span>&nbsp;>&nbsp;</span>
        </span>
      </div>
      <div v-if="fileList.length" class="folder-list">
        <el-table
          v-loading="loading"
          ref="folderTable"
          :data="fileList"
          :row-class-name="iconChange"
          style="width: 100%"
          height="100%"
          @row-click="singleSelect"
          @cell-mouse-enter="rowEnter"
          @cell-mouse-leave="rowLeave"
          @selection-change="selectChange">
          <el-table-column
            :selectable="selectable"
            type="selection"
            width="30"/>
          <el-table-column
            label="文件名"
            class-name="fileName">
            <template slot-scope="scope">
              <i class="icon-img"/>
              <template v-if="scope.row.isEdit">
                <el-input
                  ref="fileNameInput"
                  v-model="scope.row.name"
                  style="margin-left: 10px; width: 50%; min-width: 220px;"
                  class="edit-input"
                  size="small"/>
                <el-button
                  style="margin-left: 10px;"
                  class="file-button"
                  size="mini"
                  type="success"
                  icon="el-icon-check"
                  @click.stop="confirmClick(scope.row)"/>
                <el-button
                  class="file-button"
                  size="mini"
                  type="danger"
                  icon="el-icon-close"
                  @click.stop="cancelClick(scope.row)"/>
              </template>
              <span
                v-else
                style="margin-left: 10px"
                @click.stop="getSubFileList(scope.row)">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            width="120"
            align="center">
            <template slot-scope="scope">
              <ul
                v-show="scope.row.operationShow"
                class="operation"
                @click.stop=" return false ">
                <li>
                  <span class="el-icon-share"/>
                </li>
                <li v-if="scope.row.isDir ==='0'">
                  <span class="el-icon-download" @click.stop="download(scope.row)"/>
                </li>
                <li class="more-operation">
                  <span class="el-icon-more" @click.stop="showMoreOperation(scope.row, $event)"/>
                  <ul
                    v-show="scope.row.moreOperationShow"
                    :style="moreOperationStyle"
                    class="more-operation-list">
                    <li @click.stop="moveFile(scope.row)">移动到</li>
                    <li @click.stop="copyFile(scope.row)">复制到</li>
                    <li @click.stop="fileEdit(scope.row)">重命名</li>
                    <li @click.stop="deleteFile(scope.row)">删除</li>
                    <li>设置共享</li>
                  </ul>
                </li>
              </ul>
            </template>
          </el-table-column>
          <el-table-column
            :formatter="getSize"
            label="大小"
            width="120"/>
          <el-table-column
            label="创建人"
            prop="creator"
            width="200"/>
          <el-table-column
            label="修改时间"
            align="center"
            prop="createDate"
            width="260"/>
        </el-table>
      </div>

      <!-- 没有文件夹提示 -->
      <no-things v-if="fileList.length === 0">
        您还没有上传过文件哦，点击
        <el-button type="text" @click="addFile">上传</el-button>
        按钮~
      </no-things>
    </div>

    <!-- 文件夹树组件 -->
    <folder-tree
      :original-list="folderTreeConfig.originalList"
      :operation="folderTreeConfig.operationType"
      :visible.sync="folderTreeConfig.show"
      :title="folderTreeConfig.title"
      @refresh = "getList"/>

    <!-- 上传文件组件 -->
    <upload-dialog
      :visible.sync="uploadConfig.show"
      :attach-params="uploadConfig.attachParams"
      @refresh = "getList"/>
  </div>
</template>

<script>
import { getFileList, saveFolder, modifyFile, deleteFolder } from '../../api/project/fileManage'
import NoThings from '../../components/common/NoThings'
import FolderTree from './FolderTree'
import UploadDialog from './UploadDialog'

export default {
  components: {
    UploadDialog,
    FolderTree,
    NoThings
  },
  data() {
    return {
      // 根据名称搜索
      name: '',
      // 数据列表
      fileList: [],
      // 查询条件
      conditions: {
        parentId: 0
      },
      // 文件上传
      uploadConfig: {
        show: false,
        attachParams: {}
      },
      // 更多操作定位样式
      moreOperationStyle: {},
      // 上一级
      skips: [{ parentId: 0, parentPath: '' }],
      // 操作类型（新建文件夹/重命名）
      operationType: '',
      selectedFileList: [],
      // 树形文件夹
      folderTreeConfig: {
        show: false,
        title: '',
        originalList: [],
        operationType: ''
      },
      loading: false
    }
  },
  computed: {
    parentListShow() {
      return this.conditions.parentId !== 0
    },
    isDownload() {
      return this.selectedFileList.length > 1 || this.selectedFileList.filter(element => element.isDir === '1').length > 0
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    selectable() {
      return this.fileList.filter(element => element.isEdit).length === 0
    },
    // 更多操作列表的显示
    showMoreOperation(row, event) {
      const windowInnerHeight = window.innerHeight
      // 132为更多操作ul的高度
      const positionHeight = event.clientY + 132
      if (positionHeight >= windowInnerHeight) {
        this.moreOperationStyle = {
          bottom: '35px',
          left: row.isDir === '1' ? '22px' : '55px'
        }
      } else {
        this.moreOperationStyle = {
          left: row.isDir === '1' ? '22px' : '55px'
        }
      }
      row.moreOperationShow = true
    },
    // 显示操作列表
    rowEnter(row) {
      const isExistsEdit = this.fileList.filter(element => element.isEdit)
      if (isExistsEdit && isExistsEdit.length > 0) {
        return
      }
      row.operationShow = true
      this.$set(this.fileList, this.fileList.findIndex(element => element.id === row.id), row)
    },
    // 更多操作列表的隐藏
    rowLeave(row) {
      row.operationShow = false
      row.moreOperationShow = false
      this.$set(this.fileList, this.fileList.findIndex(element => element.id === row.id), row)
    },
    getList() {
      this.loading = true
      getFileList(this.conditions.parentId).then(
        res => {
          if (res.data.code === 200) {
            this.fileList = res.data.data
            this.fileList = this.fileList.map(element => {
              this.$set(element, 'isEdit', false)
              this.$set(element, 'operationShow', false)
              this.$set(element, 'moreOperationShow', false)
              element.originalName = element.name
              return element
            })
            this.loading = false
          }
        }
      ).catch(() => {
        this.loading = true
        this.$message({
          message: '获取文件列表失败',
          type: 'error'
        })
      })
    },
    selectChange(rows) {
      this.selectedFileList = rows
    },
    // 全部文件
    getAllFileList() {
      this.conditions.parentId = 0
      this.skips = [{ parentId: 0, parentPath: '' }]
      this.getList()
    },
    // 获取子文件夹
    getSubFileList(row) {
      this.conditions.parentId = row.id
      this.skips.push({
        parentId: row.id,
        parentPath: row.name
      })
      this.getList()
    },
    /**
     * 返回上一级
     */
    getPreFileList() {
      this.conditions.parentId = this.skips[this.skips.length - 2].parentId
      this.skips.splice(this.skips.length - 1, 1)
      this.getList()
    },
    // 下载文件
    download(row) {
      window.location.href = `./fileManage/download/?path=${row.path}&fileServer=1`
    },
    addFile() {
      const parentId = this.skips[this.skips.length - 1].parentId
      const dir = this.skips.map(element => element.parentPath).join('/')
      this.uploadConfig = {
        show: true,
        attachParams: {
          parentId: parentId,
          dir: dir
        }
      }
    },
    addFolder() {
      // 新建文件夹前清空选择项和编辑项
      if (this.$refs.folderTable) {
        this.$refs.folderTable.clearSelection()
      }
      this.operationType = 'createFolder'
      const editRow = this.fileList.filter(element => element.isEdit)
      if (editRow && editRow.length > 0) {
        this.$refs.fileNameInput.select()
        return
      }
      const row = {
        isEdit: true,
        name: '新建文件夹',
        createDate: '-',
        isDir: '1',
        moreOperationShow: false,
        operationShow: false
      }
      this.fileList.unshift(row)
      this.$nextTick(() => {
        this.$refs.fileNameInput.select()
      })
    },
    fileEdit(row) {
      this.operationType = 'rename'
      row.isEdit = true
      this.$nextTick(() => {
        this.$refs.fileNameInput.select()
      })
    },
    confirmClick(row) {
      if (row.name === null || row.name.trim() === '') {
        this.$message({
          type: 'error',
          message: '文件(夹)名称不能为空,请输入文件名称'
        })
        return
      }
      if (this.operationType === 'createFolder') {
        this.submitSaveFolder(row)
      } else if (this.operationType === 'rename') {
        this.rename(row)
      }
    },
    // 名称重复处理
    renameDuplicateName(row) {
      let count = 0
      let name = row.name
      while (count++ <= 999) {
        if (!this.fileList.filter(element => element.name === name && element.id !== row.id).length > 0) {
          return name
        }
        if (row.isDir === '1') {
          name = `${name.substring(0, name.lastIndexOf('(') === -1 ? name.length : name.lastIndexOf('('))}(${count})`
        } else {
          name = `${name.substring(0, name.lastIndexOf('(') === -1 ? name.lastIndexOf(('.')) : name.lastIndexOf('('))}(${count})${name.substr(name.lastIndexOf('.'))}`
        }
      }
    },
    // 保存文件夹
    submitSaveFolder(row) {
      const parentId = this.conditions.parentId
      let path = this.skips.map(element => element.parentPath).join('/')
      path = path + '/' + this.renameDuplicateName(row)
      const form = {
        parentId: parentId,
        name: this.renameDuplicateName(row),
        isDir: '1',
        isLeafDir: parentId === 0 ? '0' : '1',
        path: path,
        fileServer: '1'
      }
      saveFolder(form).then(
        res => {
          if (res.data.code === 200) {
            this.$message({
              type: 'success',
              message: '新建文件夹成功'
            })
            this.getList()
          } else {
            this.$message({
              type: 'error',
              message: '新建文件夹失败'
            })
          }
        }
      ).catch(() => {
        this.$message({
          type: 'error',
          message: '服务异常'
        })
      })
    },
    // 重命名
    rename(row) {
      const path = this.skips.map(element => element.parentPath).join('/') + '/' + this.renameDuplicateName(row)
      const form = {
        id: row.id,
        name: this.renameDuplicateName(row),
        path: path,
        oldPath: row.path,
        isDir: row.isDir,
        fileServer: row.fileServer
      }
      modifyFile(form).then(
        res => {
          if (res.data.code === 200) {
            this.$message({
              type: 'success',
              message: '重命名成功'
            })
            this.getList()
          } else {
            this.$message({
              type: 'error',
              message: '重命名失败'
            })
          }
        }
      ).catch(() => {
        this.$message({
          type: 'error',
          message: '服务异常'
        })
      })
    },
    showFolderTree(title, operationType, originalList) {
      this.folderTreeConfig = {
        show: true,
        title: title,
        operationType: operationType,
        originalList: originalList
      }
    },
    // 移动或复制的源文件数据
    moveCopyData(row) {
      let originalList = []
      if (row === null) {
        originalList = this.selectedFileList
      } else {
        row.operationShow = false
        row.moreOperationShow = false
        originalList.push(row)
      }
      return originalList
    },
    // 移动到
    moveFile(row) {
      this.showFolderTree('移动到', 'moveFile', this.moveCopyData(row))
    },
    // 复制到
    copyFile(row) {
      this.showFolderTree('复制到', 'copyFile', this.moveCopyData(row))
    },
    // 删除
    deleteFile(row) {
      this.$confirm(`确认要删除所选文件吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.removeConfirm(row)
      }).catch(() => {
        console.log('取消删除')
      })
    },
    removeConfirm(row) {
      let data = []
      if (row !== null) {
        data.push(row)
      } else {
        data = this.selectedFileList.map(element => {
          delete element.isEdit
          delete element.moreOperationShow
          return element
        })
      }
      deleteFolder(data).then(
        res => {
          if (res.data.code === 200) {
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.selectedFileList = []
            this.getList()
          } else {
            this.$message({
              type: 'error',
              message: '删除失败'
            })
          }
        }
      ).catch(() => {
        console.log('取消删除')
      })
    },
    cancelClick(row) {
      if (this.operationType === 'rename') {
        row.name = row.originalName
        row.isEdit = false
      } else if (this.operationType === 'createFolder') {
        this.fileList.splice(this.fileList.findIndex(element => element.id === row.id), 1)
      }
    },
    singleSelect(row) {
      if (!this.fileList.filter(element => element.isEdit).length) {
        // 清空所有选中数据
        this.$refs.folderTable.clearSelection()
        this.selectedFileList.push(row)
        // 设置选中
        this.$refs.folderTable.toggleRowSelection(row)
      }
    },
    iconChange({ row }) {
      const iconConfig = {
        folder: 'icon-folder1',
        txt: 'icon-txt',
        doc: 'icon-word',
        docx: 'icon-word',
        rar: 'icon-rar',
        zip: 'icon-rar'
      }
      let icon
      if (row.isDir === '1') {
        icon = 'icon-folder1'
      } else {
        let iconKey
        if (row.name.match(/\.(\w+)$/) == null) {
          iconKey = ''
        } else {
          iconKey = row.name.match(/\.(\w+)$/)[1]
        }
        icon = iconConfig[iconKey] || 'icon-unknow'
      }
      return icon
    },
    getSize(row) {
      if (row.isDir === '1') return '-'
      const size = row.size
      if (size && size >= 0) {
        let unit = 1
        const unitArr = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
        for (let inx = 0; inx < unitArr.length; inx++) {
          const ele = unitArr[inx]
          if (size < (unit *= 1024)) {
            return Math.round(size / unit * 1024) + ' ' + ele
          }
        }
        return size + ' B'
      } else {
        return '0 B'
      }
    }
  }
}
</script>

<style scoped lang='scss'>
  .wrap {
    padding: 8px;
    height: 100%;
    .panel-box {
      padding: 0 25px 3px 10px;
      .operation-bar {
        display: inline-block;
        .button-class {
          color: #409eff;
          border-color: #409eff;
          font-weight: bold;
          &.el-button.is-disabled, .el-button.is-disabled:hover, .el-button.is-disabled:focus {
            color: #c0c4cc;
            cursor: not-allowed;
            background-color: #fff;
          }
        }
      }
      > .search-bar {
        width: 300px;
        float: right;
      }
    }

    .folder-list {
      height: calc(100% - 58px);
      .operation {
        > li {
          float: left;
          width: calc(100% / 3);
          &.more-operation {
            > .more-operation-list {
              position: absolute;
              z-index: 999;
              border: 1px solid #c3eaff;
              background-color: #fff;
              width: 80px;
              border-radius: 4px;
              > li {
                color: #09aaff;
                font-size: 12px;
                cursor: pointer;
                padding: 5px 0;
                line-height: normal;
                &:hover {
                  width: 100%;
                  background-color: #f6faff;
                }
              }
            }
          }
          > span {
            display: inline-block;
            font-size: 14px;
            cursor: pointer;
            vertical-align: middle;
            font-weight: bold;
            color: #09aaff;
          }
        }
      }
      .file-button {
        padding: 7px;
        &:last-child {
          margin-left: 5px;
        }
      }
    }

    .handleButton {
      float: right;
      margin: 4px 5px 0 0;
    }
    .colorBlue {
      font-size: 12px;
      color: #4287ed;
      margin: 0 1px;
    }

    .text {
      font-size: 12px;
      cursor: text !important;
    }
    .uploadWrap {
      display: flex;
    }
    .icon-img {
      position: relative;
    }
    .icon-folder1 .icon-img {
      display: inline-block;
      width: 25px;
      height: 20px;
      background: url(../../assets/img/icon.png) no-repeat 0 0;
    }

    .icon-txt .icon-img {
      display: inline-block;
      width: 25px;
      height: 20px;
      background: url(../../assets/img/icon.png) no-repeat -80px 0;
    }

    .icon-word .icon-img {
      display: inline-block;
      width: 25px;
      height: 20px;
      background: url(../../assets/img/icon.png) no-repeat -105px 0;
    }

    .icon-pdf i {
      display: inline-block;
      width: 25px;
      height: 20px;
      background: url(../../assets/img/icon.png) no-repeat -105px 0;
    }

    .icon-rar i {
      display: inline-block;
      width: 25px;
      height: 20px;
      background: url(../../assets/img/icon.png) no-repeat -29px 0;
    }

    .icon-unknow i {
      display: inline-block;
      width: 25px;
      height: 20px;
      background: url(../../assets/img/icon.png) no-repeat -230px 0;
    }
  }
</style>
<style lang="scss">
  .fileName span:hover {
    color: #3b8cff;
    cursor: pointer;
  }

  .fileName .cell {
    display: flex;
    align-items: center;
    line-height: 16px;
  }

  .fileName .cell i {
    flex-shrink: 0;
  }

  .breadCrumbs {
    line-height: 30px;
    padding-left: 10px;
    font-size: 12px;
    span {
      cursor: pointer;
    }
  }

  .dialogWidth {
    width: 650px;
  }

  .folder-list {
    /*.el-table__row {
      .operation {
        display: none;
      }
      &:hover {
        .operation {
          display: block;
        }
      }
    }*/
    .el-table--medium td, .el-table--medium th {
      padding: 10px 0 !important;
    }
  }

  .button-class {
    [class*=" el-icon-"], [class^=el-icon-] {
      font-weight: bold;
    }
  }

  ::-webkit-scrollbar {
    width: 8px;
    background-color: transparent;
    border-radius: 4px;
    height: 8px;
  }

  /*定义滚动条轨道 内阴影+圆角*/

  ::-webkit-scrollbar-track {
    background-color: transparent;
    border: none;
    border-radius: 4px;
  }

  /*定义滑块 内阴影+圆角*/

  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: #ddd;
    background-color: rgba(222, 222, 222, 0.7);
  }

  ::-webkit-scrollbar-thumb:hover {
    border-radius: 4px;
    /*background-color:#35baf6;*/
    background-color: #aaa;
  }
</style>
