<template>
  <div v-loading="loadingConfig.loading" :element-loading-text="loadingConfig.text">
    <el-row class= "toolPanel">
      <el-button-group>
        <el-button
          icon="el-icon-document"
          type="primary"
          size="mini"
          @click="save">库备份
        </el-button>
        <el-button
          icon="el-icon-sold-out"
          type="primary"
          size="mini"
          @click="restore">库还原
        </el-button>
        <el-button
          icon="el-icon-upload"
          type="primary"
          size="mini"
          @click="submit">文件提交
        </el-button>
        <el-button
          icon="el-icon-picture"
          type="primary"
          size="mini"
          @click="zipFile">压缩文件
        </el-button>
        <el-button
          icon="el-icon-delete"
          type="primary"
          size="mini"
          @click="deleteFile">删除
        </el-button>
        <el-button
          icon="el-icon-refresh"
          type="primary"
          size="mini"
          @click="getList">刷新
        </el-button>
      </el-button-group>
    </el-row>
    <el-row>
      <el-table
        ref="multipleTable"
        :data="dataList"
        :cell-style="cellStyleFuc"
        border
        height="500"
        stripe
        style="width: 100%"
        @cell-click="detailFuc"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="40"/>
        <el-table-column
          label="数据库名称"
          prop="databaseName"/>
        <el-table-column
          prop="fileName"
          label="文件名称"/>
        <el-table-column
          :formatter="dataFormate"
          prop="backpDate"
          label="创建时间"/>
        <el-table-column
          :formatter="dataFormate"
          prop="updateDate"
          label="更新时间"/>
        <el-table-column
          :formatter="stateFormate"
          prop="state"
          label="状态"
          width="120"/>
        <el-table-column
          prop="descript"
          width="200"
          label="下载">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              plain
              @click.stop="download(scope.$index, scope.row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <div class="wrap">
      <pagination
        :total="total"
        :page.sync="pageCongfig.pageNumber"
        :limit.sync="pageCongfig.pageSize"
        @pagination="pagination"/>
    </div>

    <!-- 文件上传 -->
    <el-dialog
      :title="addFileDialogConfig.dialogTitle"
      :visible.sync="addFileDialogConfig.showDialog"
      width="30%">
      <el-upload
        :limit="20"
        :file-list="fileList"
        :action="uploadApi"
        :data="uploadParams"
        multiple>
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <!-- <el-button @click="addFileDialogConfig.showDialog = false">取 消</el-button> -->
        <el-button type="primary" @click="addFileConfirm">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { baseUrl } from '../../../api/project/request'
import { get_db_backup_list, save_db, restore_db, deleteFile_db, zipFiles_db } from '../../../api/project/dataBase/db_backup'
import Pagination from '../../../components/Pagination/index'
export default {
  components: {
    Pagination
  },
  props: {
    dataSourceId: {
      type: [Number, String],
      default: '1'
    },
    databaseName: {
      type: String,
      default: 'test'
    }
  },
  data() {
    return {
      downloadApi: baseUrl + '/backupandrestore/backupFileDownload/',
      uploadApi: baseUrl + 'backupandrestore/fileUpload/' + this.dataSourceId,
      uploadParams: null,
      dataList: [],
      selectItems: [],
      fileList: [],
      addFileDialogConfig: {
        dialogTitle: '上传文件',
        showDialog: false
      },
      loadingConfig: {
        loading: false,
        text: ''
      },
      pageCongfig: {
        pageNumber: 1,
        pageSize: 10
      },
      total: 0,
      intervalTime: null
    }
  },
  watch: {
    'addFileDialogConfig.showDialog'(val) {
      if (val === false) {
        this.fileList = null
        this.getList()
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    dataFormate(row, column) {
      if (!row[column.property]) return ''
      const date = new Date(row[column.property])
      const hms =
        (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) +
        ':' +
        (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) +
        ':' +
        (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
      const result =
        date.getFullYear() +
        '-' +
        (date.getMonth() + 1 < 10
          ? '0' + (date.getMonth() + 1)
          : date.getMonth() + 1) +
        '-' +
        (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) +
        ' ' +
        hms
      return result
    },
    stateFormate(row) {
      let state
      switch (row.state) {
        case '0':
          state = '正常'
          break
        case '1':
          state = '备份中'
          break
        case '2':
          state = '还原中'
          break
        case '3':
          state = '备份失败'
          break
        case '4':
          state = '还原失败'
          break
        case '5':
          state = '还原成功'
          break
      }
      return state
    },
    cellStyleFuc({ row, column, rowIndex, columnIndex }) {
      if (row.state === '0' && column.label === '状态') {
        return 'color:#67C23A'
      } else if (row.state === '1' && column.label === '状态') {
        return 'color:#909399'
      } else if (row.state === '2' && column.label === '状态') {
        return 'color:#909399'
      } else if (row.state === '3' && column.label === '状态') {
        return 'color:#F56C6C;text-decoration:underline;cursor:pointer'
      } else if (row.state === '4' && column.label === '状态') {
        return 'color:#E6A23C;text-decoration:underline;cursor:pointer'
      } else if (row.state === '5' && column.label === '状态') {
        return 'color:#67C23A'
      }
    },
    detailFuc(row, column) {
      if ((row.state === '3' || row.state === '4') && column.label === '状态') {
        const h = this.$createElement
        this.$notify({
          title: '错误信息',
          message: h('i', { style: 'color: teal' }, `${row.message}`)
        })
      }
    },
    handleSelectionChange(val) {
      this.selectItems = val
    },
    _isStateSuccess(row) {
      if (row.state === '1' || row.state === '2' || row.state === '3') {
        this.$message({
          message: '不能选择操作中或者备份失败的数据！',
          type: 'error'
        })
        return false
      }
      return true
    },
    getListFresh() {
      this.intervalTime = setInterval(this.getList, 2000)
    },
    getList() {
      const data = {
        conditions: {
          dataSourceId: this.dataSourceId,
          databaseName: this.databaseName
        },
        pageNumber: this.pageCongfig.pageNumber,
        pageSize: this.pageCongfig.pageSize
      }
      get_db_backup_list({ data }).then((res) => {
        if (res.data.code === 200) {
          this.dataList = res.data.data.rows
          this.total = res.data.data.total
          const obj = this.dataList.find(item => {
            return item.state === '1' || item.state === '2'
          })
          if (!obj) {
            clearInterval(this.intervalTime)
          }
        } else {
          this.$message({
            message: '获取列表信息失败',
            type: 'error'
          })
        }
      })
    },
    pagination(page) {
      this.pageCongfig = {
        pageNumber: page.page,
        pageSize: page.limit
      }
      this.getList()
    },
    save() {
      const data = {
        databaseName: this.databaseName
      }
      this.loadingConfig = {
        loading: true,
        text: '备份中...'
      }
      save_db({ data }, this.dataSourceId).then((res) => {
        this.loadingConfig.loading = false
        if (res.data.code === 200) {
          this.$message({
            message: '备份成功',
            type: 'success'
          })
          this.getListFresh()
        } else {
          this.$message({
            message: '备份失败',
            type: 'error'
          })
        }
      })
    },
    restore() {
      if (this.selectItems.length === 0) {
        this.$message({
          message: '请选择一条数据！',
          type: 'warning'
        })
        return
      } else if (this.selectItems.length > 1) {
        this.$message({
          message: '只能选择一个文件！',
          type: 'warning'
        })
        return
      }
      if (!this._isStateSuccess(this.selectItems[0])) return
      const id = this.selectItems[0].id
      this.loadingConfig = {
        loading: true,
        text: '还原中...'
      }
      restore_db(id).then((res) => {
        this.loadingConfig.loading = false
        if (res.data.code === 200) {
          this.$message({
            message: '还原成功',
            type: 'success'
          })
          this.getListFresh()
        } else {
          this.$message({
            message: '还原失败',
            type: 'error'
          })
        }
      })
    },
    submit() {
      this.uploadParams = {
        databaseName: this.databaseName
      }
      this.addFileDialogConfig.showDialog = true
    },
    addFileConfirm() {
      this.getList()
      this.addFileDialogConfig.showDialog = false
    },
    zipFile() {
      if (this.selectItems.length === 0) {
        this.$message({
          message: '请选择一条数据！',
          type: 'warning'
        })
        return
      } else if (this.selectItems.length > 1) {
        this.$message({
          message: '只能选择一个文件！',
          type: 'warning'
        })
        return
      }
      if (!this._isStateSuccess(this.selectItems[0])) return
      const id = this.selectItems[0].id
      this.loadingConfig = {
        loading: true,
        text: '压缩中...'
      }
      zipFiles_db(id).then((res) => {
        this.loadingConfig.loading = false
        if (res.data.code === 200) {
          this.$message({
            message: '压缩成功！',
            type: 'success'
          })
          this.getList()
        } else {
          this.$message({
            message: '压缩失败！',
            type: 'error'
          })
        }
      })
    },
    deleteFile() {
      if (this.selectItems.length === 0) {
        this.$message({
          message: '请选择一条数据！',
          type: 'warning'
        })
        return
      }
      this.ids = this.selectItems.map(i => {
        return i.id
      })
      deleteFile_db({ data: { ids: this.ids } }).then((res) => {
        if (res.data.code === 200) {
          this.$message({
            message: '删除成功！',
            type: 'success'
          })
          if (this.dataList.length === 1) {
            this.pageCongfig.pageNumber -= 1
          }
          this.getList()
        } else {
          this.$message({
            message: '删除失败！',
            type: 'error'
          })
        }
      })
    },
    download(index, row) {
      if (!this._isStateSuccess(row)) return
      window.open(this.downloadApi + row.id)
    }
  }
}
</script>

<style scoped lang='scss'>
.toolPanel {
  margin-bottom: 10px;
}
.wrap {
  float: right;
}
</style>
