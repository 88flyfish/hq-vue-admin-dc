<template>
  <div style="height: 100%;">
    <div class="panel-box">
      <div class="operation-bar">
        <el-button
          size="small"
          icon="el-icon-upload"
          type="primary"
          @click="addFile">上传文件</el-button>
        <el-button
          icon="el-icon-plus"
          class="button-class"
          size="small"
          @click="addFolder">新建文件夹</el-button>
        <el-button-group v-show="selectedFolderList.length">
          <el-button
            class="button-class"
            size="small"
            icon="el-icon-share">分享</el-button>
          <el-button
            :disabled="isDownload"
            class="button-class"
            size="small"
            icon="el-icon-download"
            @click="downLoaderFolder(selectedFolderList[0])">下载</el-button>
          <el-button
            class="button-class"
            size="small"
            icon="el-icon-delete"
            @click="batchRemoveFolder">删除</el-button>
          <el-button
            :disabled="selectedFolderList.length > 1"
            class="button-class"
            style="height: 33px;"
            size="small"
            @click="EditFolder(selectedFolderList[0])">重命名</el-button>
          <el-button
            class="button-class"
            style="height: 33px;"
            size="small">复制到</el-button>
          <el-button
            class="button-class"
            style="height: 33px;"
            size="small"
            @click="batchMoveFolder">移动到</el-button>
          <el-button
            class="button-class"
            style="height: 33px;"
            size="small">推送到云设备</el-button>
        </el-button-group>
      </div>
      <div class="search-bar">
        <el-input
          v-model.trim="fileName"
          size="small"
          placeholder="搜索您的文件">
          <el-button slot="append" icon="el-icon-search"/>
        </el-input>
      </div>
    </div>
    <div class="breadCrumbs">
      <span
        v-if="pathArr.length>1"
        class=" colorBlue"
        @click="back()">返回上一级&nbsp;|</span>
      <span
        class=" colorBlue"
        @click="backRoot()">全部文件</span>
      <span
        v-for="(node,index) in pathArr"
        :key="index"
        @click.stop="navigate(node,index)">
        <span
          :class="{ colorBlue : index!==(pathArr.length-1)}"
          class="text">{{ node.name }}</span>
        <span
          v-if="index!==(pathArr.length-1)"
          class="colorBlue">&nbsp;>&nbsp;</span>
      </span>
    </div>
    <div v-if="hasFolder==1" class="folder-list">
      <el-table
        ref="folderTable"
        :data="rows"
        :row-class-name="iconChange"
        style="width: 100%"
        height="100%"
        @row-click="singleSelect"
        @cell-mouse-leave="rowLeave"
        @selection-change = "selectChange">
        <el-table-column
          type="selection"
          width="30"/>
        <el-table-column
          label="文件名"
          class-name="fileName">
          <template slot-scope="scope">
            <i class="icon-img" />
            <span style="margin-left: 10px" @click.stop="next(scope.row, scope.column)">
              {{ scope.row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          width="120"
          align="center">
          <template slot-scope="scope">
            <ul class="operation" @click.stop=" return false ">
              <li>
                <span class="el-icon-share"/>
              </li>
              <li v-show="scope.row.isDir ==='0'">
                <span class="el-icon-download" @click.stop="downLoaderFolder(scope.row)"/>
              </li>
              <li class="more-operation">
                <span class="el-icon-more" @click.stop="showMoreOperation(scope.row, $event)"/>
                <ul
                  v-show="scope.row.moreOperationShow"
                  :style="moreOperationStyle"
                  class="more-operation-list">
                  <li @click.stop="moveFolder(scope.row)">移动到</li>
                  <li>复制到</li>
                  <li @click.stop="EditFolder(scope.row)">重命名</li>
                  <li @click.stop="removeFolder(scope.row)">删除</li>
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

    <!-- 新增文件夹对话框 -->
    <el-dialog
      :title="dialogConfig.dialogTitle"
      :visible.sync="dialogConfig.showDialog"
      width="30%">
      <span style="display:inline-block;margin-bottom:5px;">{{ dialogConfig.dialogTip }}</span>
      <el-input v-model="floderForm.name"/>
      <span slot="footer" class="dialog-footer">
        <el-button
          size="mini"
          @click="dialogConfig.showDialog = false">取消</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="confirm">确定</el-button>
      </span>
    </el-dialog>

    <!-- 迁移文件 对话框 -->
    <el-dialog
      :title="moveDialogConfig.dialogTitle"
      :visible.sync="moveDialogConfig.showDialog"
      width="30%">
      <AsynTree
        :tree-data="treeConfig.data"
        :current-item="treeConfig.currentItem"
        @item-click="itemClick">
        <span
          v-for="item in treeConfig.data"
          :key="item.id"
          :slot="item.id">
          <el-button class="success small-button">注册为数据</el-button>
          <el-button class="info small-button">删除</el-button>
        </span>
      </AsynTree>
      <span slot="footer" class="dialog-footer">
        <el-button
          size="mini"
          @click="moveDialogConfig.showDialog = false">取消</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="moveConfirm">确定</el-button>
      </span>
    </el-dialog>

    <!-- 文件上传 -->
    <el-dialog
      :title="addFileDialogConfig.dialogTitle"
      :visible.sync="addFileDialogConfig.showDialog"
      custom-class = "dialogWidth">
      <div class="uploadWrap">
        <span style="font-weight: bold; line-height: 30px;">
          {{ addFileDialogConfig.dialogTip }}:&nbsp;
        </span>
        <FileUpLoader
          v-model="folderConfig.uploadConfig.files"
          :multiple="true"
          :attach-params="folderConfig.currentPath"
          style="display:inline-block"
          class="fileUpButton"
          @error="uploadError"/>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          size="mini"
          @click="addFileDialogConfig.showDialog = false">取消</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="addFileConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 文件夹为空提示 -->
    <NoThings v-if="hasFolder==0" class="pic-nofloder">
      您还没有上传过文件哦，点击
      <el-button type="text" @click="addFile">上传</el-button>
      按钮~
    </NoThings>

  </div>

</template>

<script>
// import request from '../../api/project/request'
import NoThings from './NoThings.vue'
import AsynTree from './AsynTree'
import FileUpLoader from './FileUpLoader'
import { getFolderList, addFolder, removeFolder, removeFolderBatch, modifyFolder, moveFolder, moveBatchFolder, getFolderTree } from '../../api/project/fileSystem'
export default {
  components: {
    NoThings,
    AsynTree,
    FileUpLoader
  },
  props: {
    config: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    var selectedMap = []
    return {
      // 搜索文件名
      fileName: '',
      tableData: [],
      totalChecked: 0,
      // 上传文件列表
      folderConfig: {
        uploadConfig: {
          files: []
        },
        currentPath: {}
      },
      addFolderWindowConfig: {
        type: 'add', // add modify view 分别表示新增，修改以及查看
        show: false,
        parent: this,
        width: '600px',
        height: '180px',
        title: '新建文件夹'
      },
      removeDialogVisible: false,
      // 下载文件接口
      downloadFolderApi: './api/fileSourceView/download/',
      operationType: '',
      // 编辑新增文件夹对话框配置
      dialogConfig: {
        dialogTitle: '',
        showDialog: false,
        dialogTip: '请输入文件夹名字：'
      },
      // 移动文件对话框
      moveDialogConfig: {
        type: '',
        dialogTitle: '移动到',
        showDialog: false,
        dialogTip: '目录',
        form: {
          path: '',
          newPath: ''
        }
      },
      // 删除文件对话框
      addFileDialogConfig: {
        dialogTitle: '上传文件',
        showDialog: false,
        dialogTip: '请选择文件'
      },
      treeConfig: {
        data: [],
        form: {},
        dir: '/',
        currentItem: ''
      },
      hasFolder: -1,
      // 新增文件夹的时候不需要改变pathArr，第一次需要push进初始化页面路径
      pathChangeFlag: true,
      message: '',
      bread: '',
      pathArr: [],
      rows: [],
      // 当前操作行
      operationItem: null,
      // 选中项集合
      selectedList: [],
      selectNames: [],
      selectPaths: [],
      selectedFolderList: [],
      showMask: true,
      selectedMap: selectedMap,
      floderForm: {
        id: '',
        userId: '',
        fileId: '',
        name: '新建文件夹',
        parentPath: '',
        isDir: '',
        path: ''
      },
      moreOperationStyle: {}
    }
  },
  computed: {
    sourceId() {
      return this.$route.query.sourceId ? this.$route.query.sourceId : '-2'
    },
    isDownload() {
      return this.selectedFolderList.length > 1 || this.selectedFolderList.filter(element => element.isDir === '1').length > 0
    }
  },
  mounted() {
    this.getFolders()
  },
  methods: {
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
      this.$set(this.rows, this.rows.findIndex(element => element.id === row.id), row)
    },
    // 更多操作列表的隐藏
    rowLeave(row) {
      row.moreOperationShow = false
      this.$set(this.rows, this.rows.findIndex(element => element.id === row.id), row)
    },
    // 点击行时单选
    singleSelect(row) {
      // 清空所有选中数据
      this.$refs.folderTable.clearSelection()
      this.selectedFolderList.push(row)
      // 设置选中
      this.$refs.folderTable.toggleRowSelection(row)
    },
    getPathArr(pathArr) {
      if (pathArr && pathArr[pathArr.length - 1]) {
        this.folderConfig.currentPath.path =
          pathArr[pathArr.length - 1].parentPath
      } else this.folderConfig.currentPath.path = '/'
      this.folderConfig.currentPath.sourceId = '-2'
    },
    selectChange(val) {
      this.selectedFolderList = val && val.length > 0 ? val : []
      this.selectNames = val.map(i => {
        return i.name
      })
      this.selectPaths = val.map(i => {
        return i.path
      })
    },
    moveFolder(row) {
      this.treeConfig.data = [{
        name: '全部文件',
        parentPath: '',
        isDir: '1',
        isLeafDir: '0'
      }]
      this.moveDialogConfig = {
        type: 'modify',
        dialogTitle: '移动到',
        showDialog: true,
        dialogTip: '目录',
        form: {
          path: '',
          newPath: ''
        }
      }
      this.operationItem = row
    },
    batchMoveFolder() {
      this.treeConfig.data = [{
        name: '全部文件',
        parentPath: '',
        isDir: '1',
        isLeafDir: '0'
      }]
      if (this.selectNames.length === 0) {
        this.$message({
          message: '请先选择文件',
          type: 'warning'
        })
        return
      }
      this.moveDialogConfig = {
        type: 'modifyBatch',
        dialogTitle: '移动到',
        showDialog: true,
        dialogTip: '目录',
        form: {
          path: '',
          newPath: ''
        }
      }
    },
    EditFolder(row) {
      this.operationType = 'editFolder'
      this.dialogConfig = {
        dialogTitle: '重命名',
        showDialog: true,
        dialogTip: '文件名：'
      }
      this.floderForm.name = row.name
      this.operationItem = row
    },
    removeFolder(row) {
      this.operationType = 'removeFolder'
      this.operationItem = row
      this.$confirm(`确认删除 ${row.name} 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.removeConfirm()
      }).catch(() => {
        console.log('取消文件删除')
      })
    },
    batchRemoveFolder() {
      this.operationType = 'removeFolderBatch'
      this.$confirm(`确认删除 ${this.selectNames.join('、')} 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.removeConfirm()
      }).catch(() => {
        console.log('取消文件删除')
      })
    },
    getFolders(r) {
      this.selectedMap = []
      this.isCheckedAll = false
      this.totalChecked = 0
      var conditions = this.config.searchFields

      // 未设置查询条件则重置为空对象
      if (!conditions) {
        conditions = {}
      }
      var form = {
        parentPath: this.config.apiDir,
        name: this.config.searchFields.name
      }
      getFolderList(this.config.api, { data: form }, this.config.sourceId).then(res => {
        this.folderConfig.uploadConfig.files = []
        var rows = res.data.data
        if (rows.length > 0) this.hasFolder = 1
        else this.hasFolder = 0

        if (
          this.pathChangeFlag === true
        ) {
          function PathObj(name, parentPath, path, clickFlag) {
            this.name = name
            this.parentPath = parentPath
            this.path = path
            this.clickFlag = clickFlag
          }
          if (rows.length > 0) {
            var index = rows[0].parentPath.lastIndexOf('/')
            var name = rows[0].parentPath.substr(index + 1)
            var parentPath = rows[0].parentPath
            var path = rows[0].path
            var clickFlag = true
            this.pathArr.push(new PathObj(name, parentPath, path, clickFlag))
          } else if (r) {
            var name = r.name
            if (r.parentPath === '/') { var parentPath = r.parentPath + r.name } else var parentPath = r.parentPath + '/' + r.name
            var path = r.path
            var clickFlag = false
            this.pathArr.push(new PathObj(name, parentPath, path, clickFlag))
          }
        }
        this.getPathArr(this.pathArr)
        this.rows = res.data.data
        // var fields = ['creator', 'creatTime', 'modifier', 'modifyTime']
        this.rows.forEach(element => {
          element.moreOperationShow = false
        })
        if (this.rows.length < 1) {
          this.message = '未查找到相关记录！'
        }
      }).catch(() => {
        this.$message({
          message: '获取失败',
          type: 'error'
        })
      })
    },
    navigate(node, index) {
      if (node.clickFlag === true) {
        this.config.apiDir = node.parentPath
        this.pathArr = this.pathArr.slice(0, index)
        this.pathChangeFlag = true
        this.getFolders()
      }
    },
    next(row, column) {
      if (row.isDir === '1' && column.label === '文件名') {
        this.config.apiDir = row.path
        this.pathChangeFlag = true
        this.selectedFolderList = []
        this.getFolders(row)
      }
    },
    back() {
      this.config.apiDir = this.pathArr[this.pathArr.length - 2].parentPath
      this.pathArr = this.pathArr.slice(0, this.pathArr.length - 2)
      this.pathChangeFlag = true
      this.getFolders()
    },
    backRoot() {
      this.config.apiDir = '/'
      this.pathArr = []
      this.pathChangeFlag = true
      this.getFolders()
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
      var icon
      if (row.isDir === '1') {
        icon = 'icon-folder1'
      } else {
        if (row.name.match(/\.(\w+)$/) == null) {
          var iconKey = ''
        } else {
          var iconKey = row.name.match(/\.(\w+)$/)[1]
        }
        icon = iconConfig[iconKey] || 'icon-unknow'
      }
      return icon
    },
    getSize(row) {
      if (row.isDir === '1') return '-'
      const size = row.size
      var unit = 1
      if (size && size >= 0) {
        let unit = 1
        const unitArr = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
        for (let inx = 0; inx < unitArr.length; inx++) {
          const ele = unitArr[inx]
          if (size < (unit *= 1024)) { return Math.round(size / unit * 1024) + ' ' + ele }
        }
        return size + ' B'
      } else {
        return '0 B'
      }
    },
    addFolder() {
      this.operationType = 'addFolder'
      this.dialogConfig = {
        dialogTitle: '新建文件夹',
        showDialog: true,
        dialogTip: '请输入文件夹名称：'
      }
      // 新建文件夹时，将表单数据置空
      this.floderForm = {
        id: '',
        userId: '',
        fileId: '',
        name: '新建文件夹',
        parentPath: '',
        isDir: '',
        path: ''
      }
      this.addFolderWindowConfig.show = true
      this.pathChangeFlag = false
    },
    confirm() {
      if (this.operationType === 'addFolder') {
        if (this.floderForm.name.trim() === '') {
          this.$message({
            message: '请输入文件夹名称!',
            type: 'warning'
          })
        } else {
          this.addFolderWindowConfig.show = false
          this.floderForm.userId = this.currentUserId
          this.floderForm.isDir = '1'
          if (this.pathArr.length !== 0) {
            if (this.pathArr[this.pathArr.length - 1].parentPath === '/') {
              this.floderForm.path =
                this.pathArr[this.pathArr.length - 1].parentPath +
                this.floderForm.name
            } else {
              this.floderForm.path =
                this.pathArr[this.pathArr.length - 1].parentPath +
                '/' +
                this.floderForm.name
            }
          } else {
            this.floderForm.path = '/' + this.floderForm.name
            this.floderForm.parentPath = '/'
          }
          addFolder({ data: this.floderForm }, this.config.sourceId)
            .then(
              res => {
                this.$message({
                  message: '新建成功',
                  type: 'success'
                })
                this.getFolders()
                this.dialogConfig.showDialog = false
              },
              res => {
                this.$message({
                  message: '新建失败',
                  type: 'error'
                })
                this.dialogConfig.showDialog = false
              }
            )
        }
      } else if (this.operationType === 'editFolder') {
        const form = {
          newName: this.floderForm.name,
          path: this.operationItem.path
        }
        modifyFolder({ data: form }, this.sourceId).then(
          (res) => {
            // 新增完按创建时间降序排序，方便查看最新增加的信息
            if (res.data.code === 200) {
              this.$message({
                message: '修改成功',
                type: 'success'
              })
              this.pathChangeFlag = false
              this.getFolders()
              this.dialogConfig.showDialog = false
            } else {
              this.$message({
                message: '修改失败',
                type: 'error'
              })
              this.dialogConfig.showDialog = false
            }
          },
          (res) => {
            this.$message({
              message: '修改失败',
              type: 'error'
            })
          }
        )
      }
    },
    removeConfirm() {
      if (this.operationType === 'removeFolder') {
        var paramsFrom = {
          cascade: true, // 级联删除
          path: this.operationItem.path
        }
        removeFolder({ data: paramsFrom }, this.sourceId).then(
          (res) => {
            if (res.data.code === 200) {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.pathChangeFlag = false
              this.getFolders()
            } else {
              this.$message({
                message: '删除失败',
                type: 'error'
              })
            }
          }
        )
      } else if (this.operationType === 'removeFolderBatch') {
        const paramsFrom = {
          pathList: this.selectPaths
        }
        removeFolderBatch({ data: paramsFrom }, this.sourceId).then(
          (res) => {
            if (res.data.code === 200) {
              this.$message({
                message: '删除成功',
                type: 'success'
              })
              this.selectPaths = []
              this.pathChangeFlag = false
              this.getFolders()
            } else {
              this.$message({
                message: '删除失败',
                type: 'error'
              })
            }
          },
          (res) => {
            this.$message({
              message: '删除失败',
              type: 'error'
            })
          }
        )
      }
    },

    itemClick(item) {
      var path
      this.treeConfig.currentItem = item
      if (item.isDir === '1') item.open = !item.open
      if (item && item.isDir === '1') {
        if (item.parentPath === '') {
          path = '/'
        } else if (item.parentPath === '/') {
          path = item.parentPath + item.name
        } else {
          path = item.parentPath + '/' + item.name
        }
        var params = {
          path: path
        }
        getFolderTree({ data: params }, this.sourceId).then((res) => {
          var filterDatas = res.data.data
          this.selectedList.push(this.operationItem)
          var newFilterDatas = []
          filterDatas.forEach((ele) => {
            var flag = false
            for (var i = 0, item; item = this.selectedList[i++];) {
              if (item.name === ele.name) {
                flag = true
                break
              }
            }
            if (!flag) {
              newFilterDatas.push(ele)
            }
          })
          this.$set(item, 'children', newFilterDatas)
        })
      }
    },
    // 移动文件对话框
    moveConfirm() {
      this.pathChangeFlag = false
      if (this.moveDialogConfig.type === 'modify') {
        this.moveDialogConfig.form.path = this.operationItem.path
        if (this.treeConfig.currentItem.path === undefined) {
          this.moveDialogConfig.form.newPath = '/' + this.operationItem.name
        } else {
          this.moveDialogConfig.form.newPath = this.treeConfig.currentItem.path + '/' + this.operationItem.name
        }
        moveFolder({ data: this.moveDialogConfig.form }, this.sourceId).then(
          (res) => {
            // 新增完按创建时间降序排序，方便查看最新增加的信息
            if (res.data.code === 200) {
              this.$message({
                message: '移动成功',
                type: 'success'
              })
              this.getFolders()
            } else {
              this.$message({
                message: res.body.message,
                type: 'error'
              })
            }
            this.moveDialogConfig.showDialog = false
          },
          (res) => {
            this.$message({
              message: '移动失败',
              type: 'error'
            })
            this.moveDialogConfig.showDialog = false
          }
        )
      } else if (this.moveDialogConfig.type === 'modifyBatch') {
        var newPath
        if (this.treeConfig.currentItem.path === undefined) {
          newPath = '/'
        } else {
          newPath = this.treeConfig.currentItem.path + '/'
        }
        var paramsFrom = {
          newPath: newPath,
          pathList: this.selectPaths
        }
        moveBatchFolder({ data: paramsFrom }, this.sourceId).then(
          (res) => {
            this.moveDialogConfig.show = false
            if (res.data.code === 200) {
              this.$message({
                message: '移动成功',
                type: 'success'
              })
              this.getFolders()
            } else {
              this.$message({
                message: res.body.message,
                type: 'error'
              })
            }
            this.moveDialogConfig.showDialog = false
          },
          (res) => {
            this.$message({
              message: '批量移动失败',
              type: 'error'
            })
          }
        )
      }
      this.moveDialogConfig.show = false
    },
    // 下载文件
    downLoaderFolder(row) {
      location.href = this.downloadFolderApi + this.sourceId + '?path=' + row.path
    },
    addFile() {
      this.addFileDialogConfig = {
        dialogTitle: '上传文件',
        showDialog: true,
        dialogTip: '请选择文件'
      }
      this.folderConfig.uploadConfig.files = []
    },
    addFileConfirm() {
      this.addFileDialogConfig.showDialog = false
      this.getFolders()
      this.pathChangeFlag = false
    },
    uploadError() {
      this.$message({
        message: '上传失败',
        type: 'error'
      })
    }
  }
}
</script>

<style scoped lang='scss'>
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
  background: url("../../assets/img/icon.png") no-repeat 0 0;
}

.icon-txt .icon-img {
  display: inline-block;
  width: 25px;
  height: 20px;
  background: url("../../assets/img/icon.png") no-repeat -80px 0;
}

.icon-word .icon-img {
  display: inline-block;
  width: 25px;
  height: 20px;
  background: url("../../assets/img/icon.png") no-repeat -105px 0;
}

.icon-pdf i {
  display: inline-block;
  width: 25px;
  height: 20px;
  background: url("../../assets/img/icon.png") no-repeat -105px 0;
}

.icon-rar i {
  display: inline-block;
  width: 25px;
  height: 20px;
  background: url("../../assets/img/icon.png") no-repeat -29px 0;
}

.icon-unknow i {
  display: inline-block;
  width: 25px;
  height: 20px;
  background: url("../../assets/img/icon.png") no-repeat -230px 0;
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
  .el-table__row {
    .operation {
      display: none;
    }
    &:hover {
      .operation {
        display: block;
      }
    }
  }
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
