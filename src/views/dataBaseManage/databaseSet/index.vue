<template>
  <div v-loading="loadingConfig.loading" :element-loading-text="loadingConfig.text">
    <el-row class= "toolPanel">
      <el-button-group>
        <el-button
          icon="el-icon-plus"
          type="primary"
          size="mini"
          @click="add">新增
        </el-button>
        <el-button
          icon="el-icon-edit"
          type="primary"
          size="mini"
          @click="modify">修改
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
          label="名称"
          prop="name"/>
        <el-table-column
          prop="databaseType"
          label="数据库类型"/>
        <el-table-column
          prop="databaseName"
          label="默认数据库"/>
        <el-table-column
          prop="ip"
          label="IP"/>
        <el-table-column
          prop="port"
          label="端口"
          width="120"/>
        <el-table-column
          prop="userName"
          width="200"
          label="用户名"/>
      </el-table>
    </el-row>
    <div class="wrap">
      <pagination
        :total="total"
        :page.sync="pageCongfig.pageNumber"
        :limit.sync="pageCongfig.pageSize"
        @pagination="getList"/>
    </div>
    <!-- 新增数据库 -->
    <el-dialog
      :title="operateDialogConfig.dialogTitle"
      :visible.sync="operateDialogConfig.showDialog"
      width="30%">
      <div class="boxItem">
        <span class="txt">名称:</span>
        <el-input v-model="form.name" size="mini"/>
      </div>
      <div class="boxItem">
        <span class="txt">数据库类型:</span>
        <el-select v-model="form.databaseType" placeholder="请选择" size="mini">
          <el-option
            v-for="item in dbList"
            :key="item"
            :label="item"
            :value="item"/>
        </el-select>
      </div>
      <div class="boxItem">
        <span class="txt">默认数据库:</span>
        <el-input v-model="form.databaseName" size="mini"/>
      </div>
      <div class="boxItem">
        <span class="txt">IP地址:</span>
        <el-input v-model="form.ip" size="mini"/>
      </div>
      <div class="boxItem">
        <span class="txt">端口:</span>
        <el-input v-model="form.port" size="mini"/>
      </div>
      <div class="boxItem">
        <span class="txt">用户名:</span>
        <el-input v-model="form.userName" size="mini"/>
      </div>
      <div class="boxItem">
        <span class="txt">密码:</span>
        <el-input v-model="form.password" type="password" size="mini"/>
      </div>
      <div class="boxItem">
        <span class="txt">备注:</span>
        <el-input v-model="form.memo" size="mini"/>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="testLink">测试</el-button>
        <el-button type="primary" size="small" @click="confirm">确认</el-button>
        <el-button size="small" @click="operateDialogConfig.showDialog = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { get_db_list, get_db_single, add_db, modify_db, delete_db, testLink_db } from '@/api/project/dataBase/db_set'
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
      dataList: [],
      selectItems: [],
      pageCongfig: {
        pageNumber: 1,
        pageSize: 10
      },
      operateDialogConfig: {
        dialogTitle: '',
        showDialog: false,
        type: ''
      },
      total: 0,
      intervalTime: null,
      loadingConfig: {
        loading: false,
        text: ''
      },
      dbList: [
        'MySql',
        'MariaDB',
        'Oracle',
        'PostgreSQL',
        'SQL Server',
        'Hive2',
        'MongoDB'
      ],
      form: {
        databaseName: '',
        databaseType: '',
        id: '',
        ip: '',
        isDefaultView: '1',
        isdefault: '0',
        memo: '',
        name: '',
        password: '',
        port: '',
        userName: ''
      },
      linkMessage: ''
    }
  },
  watch: {
    'operateDialogConfig.showDialog'(val) {
      if (!val) {
        this.form = {
          databaseName: '',
          databaseType: '',
          id: '',
          ip: '',
          isDefaultView: '1',
          isdefault: '0',
          memo: '',
          name: '',
          password: '',
          port: '',
          userName: ''
        }
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
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

    getList() {
      const data = {
        conditions: {
        },
        pageNumber: this.pageCongfig.pageNumber,
        pageSize: this.pageCongfig.pageSize
      }
      get_db_list({ data }).then((res) => {
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

    add() {
      this.operateDialogConfig = {
        dialogTitle: '新增数据库',
        showDialog: true,
        type: 'add'
      }
    },
    confirm() {
      const data = this.form
      if (this.operateDialogConfig.type === 'add') {
        add_db({ data }, this.dataSourceId).then((res) => {
          if (res.data.code === 200) {
            this.$message({
              message: '新增成功',
              type: 'success'
            })
            this.operateDialogConfig.showDialog = false
            this.getList()
          } else {
            this.$message({
              message: '新增失败',
              type: 'error'
            })
          }
        })
      } else if (this.operateDialogConfig.type === 'modify') {
        modify_db({ data }).then((res) => {
          if (res.data.code === 200) {
            this.$message({
              message: '修改成功',
              type: 'success'
            })
            this.operateDialogConfig.showDialog = false
            this.getList()
          } else {
            this.$message({
              message: '修改失败',
              type: 'error'
            })
          }
        })
      }
    },
    testLink() {
      const data = {
        databaseName: this.form.databaseName,
        databaseType: this.form.databaseType,
        ip: this.form.ip,
        password: this.form.password,
        port: this.form.port,
        userName: this.form.userName
      }
      testLink_db({ data }).then((res) => {
        if (res.data.code === 200) {
          this.$message({
            message: res.data.data,
            type: res.data.data === '连接成功' ? 'success' : 'error'
          })
        } else {
          this.$message({
            message: '连接失败',
            type: 'error'
          })
        }
      })
    },
    getSingle() {
      const id = this.selectItems[0].id
      get_db_single(id).then((res) => {
        if (res.data.code === 200) {
          const data = res.data.data
          this.form = {
            databaseName: data.databaseName,
            databaseType: data.databaseType,
            id: data.id,
            ip: data.ip,
            isDefaultView: data.isDefaultView,
            isdefault: data.isdefault,
            memo: data.memo,
            name: data.name,
            password: data.password,
            port: data.port,
            userName: data.userName
          }
        } else {
          this.$message({
            message: '获取信息失败',
            type: 'error'
          })
        }
      })
    },
    modify() {
      if (this.selectItems.length !== 1) {
        this.$message({
          message: '请选择一条数据！',
          type: 'warning'
        })
        return
      }
      this.operateDialogConfig = {
        dialogTitle: '修改数据库',
        showDialog: true,
        type: 'modify'
      }
      this.getSingle()
    },
    deleteFile() {
      if (this.selectItems.length !== 1) {
        this.$message({
          message: '请选择一条数据！',
          type: 'warning'
        })
        return
      }
      const id = this.selectItems[0].id
      delete_db(id).then((res) => {
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
.boxItem {
  display: flex;
  align-items: center;
  margin: 5px 0;
  .txt {
    display: inline-box;
    width: 110px;
    flex-shrink: 0;
  }
  /deep/ .el-select {
    width: 100%;
  }
}
</style>
