<template>
  <div class="minibableBox">
    <toggleBox
      v-for="(item,index) in serviceMetadata"
      :key="index"
      :ref="`box${index}`"
      @deleteBox="deletetable(index)">
      <div slot="top" class="top">
        <span>选择表:</span>
        <el-select v-model="item.tableName" placeholder="请选择" size="mini" @visible-change="getTableList" @change="selectChange(item.tableName,index)">
          <el-option
            v-for="i in tableList"
            :key="i.id"
            :label="i.name"
            :value="i.name"/>
        </el-select>
      </div>
      <div slot="bottom" class="bottom">
        <div class="wrap">
          <span v-for="(j,idx) in item.fieldList" :key="idx" class="tip" >
            {{ j.column_name }}<i class="el-icon-edit el-icon--right"/>
          </span>
        </div>
        <div class="titleBox">
          <div class="txt">过滤条件</div>
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-plus"
            @click="edit(item,index)">添加过滤条件</el-button>
        </div>
        <el-table
          :data="item.matchTable"
          border
          style="width: 100%">
          <el-table-column
            prop="columnName"
            align="center"
            label="字段名"/>
          <el-table-column
            prop="operator"
            align="center"
            label="运算符"/>
          <el-table-column
            prop="columnKey"
            align="center"
            label="匹配条件"/>
          <el-table-column
            prop="filterValue"
            align="center"
            label="过滤值"/>
          <el-table-column label="操作项" align="center" width="200">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="modify(scope.row,scope.$index,item)">编辑</el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="remove(scope.row,scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </toggleBox>
    <!-- 对话框 -->
    <el-dialog
      :visible.sync="winConfig.dialogVisible"
      title="过滤条件"
      append-to-body
      width="30%">
      <el-form ref="form" :model="formTmp" label-width="100px" >
        <el-form-item
          :rules="{
            required: true, message: '字段名不能为空', trigger: 'change'
          }"
          label="字段名"
          prop="columnName">
          <el-select
            v-model="formTmp.columnName"
            placeholder="请选择字段名">
            <el-option
              v-for="i in fieldListTmp"
              :key="i.column_name"
              :label="i.column_name"
              :value="i.column_name"/>
          </el-select>
        </el-form-item>
        <el-form-item
          :rules="{
            required: true, message: '运算符不能为空', trigger: 'change'
          }"
          label="运算符"
          prop="operator">
          <el-select v-model="formTmp.operator" placeholder="请选择运算符">
            <el-option
              v-for="item in operatorList"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item
          :rules="{
            required: true, message: '匹配条件不能为空', trigger: 'change'
          }"
          label="匹配条件"
          prop="columnKey">
          <treeSelect
            v-model="formTmp.columnKey"
            :multiple="false"
            :options="reqModelTree"
            :props="defaultProps"
            size="medium"
            @clear="clear" />
        </el-form-item>
        <el-form-item label="过滤值" prop="nameDes">
          <el-input v-model="formTmp.filterValue"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="winConfig.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmFilter">确 定</el-button>
      </span>
    </el-dialog>
    <el-button
      class="btn"
      size="mini"
      type="primary"
      icon="el-icon-plus"
      plain
      @click="addtable">选择表</el-button>

  </div>
</template>

<script>
import toggleBox from '@/components/common/toggleBox'
import { get_table_list, get_tableField_listArr } from '@/api/project/service'
import treeSelect from '@/components/common/treeSelect'
export default {
  components: {
    toggleBox,
    treeSelect
  },
  props: {
    baseInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    reqModelTree: {
      type: Array,
      default() {
        return []
      }
    },
    serviceMetadataArr: {
      type: Array,
      default() {
        return []
      }
    }

  },
  data() {
    return {
      serviceMetadata: [],
      serviceMetadataList: [],
      winConfig: {
        dialogVisible: false,
        type: ''
      },
      isMounted: null,
      tableList: [],
      operatorList: [
        {
          value: '=',
          label: '='
        },
        {
          value: '>',
          label: '>'
        },
        {
          value: '<',
          label: '<'
        },
        {
          value: '<>',
          label: '<>'
        },
        {
          value: '>=',
          label: '>='
        },
        {
          value: '<=',
          label: '<='
        }
      ],
      matchList: [],
      operationRowIndex: '',
      fieldListTmp: [],
      'formTmp': {
        columnName: '',
        operator: '',
        columnKey: '',
        filterValue: null
      },
      defaultProps: {
        value: 'columnKey',
        label: 'columnName',
        children: 'fields'
      }
    }
  },
  watch: {
    'baseInfo.datasourceId'() {
      //   if (this.baseInfo.serviceType !== '4') return
      //   this.getTableList()
    },
    'serviceMetadataArr': {
      handler: function(val) {
        if (this.baseInfo.serviceType !== '4') return
        this.serviceMetadata = []
        var arrTmp = []
        val.forEach((item, index) => {
          if (item.dataSetType === '6') {
            const tmp = {
              'fieldList': [],
              'tableName': item.tableName,
              'tableOrder': item.tableOrder,
              'matchTable': []
            }
            this.serviceMetadata.push(tmp)
            // 显示表字段
            this.isMounted = true
            this.serviceMetadata.forEach((item, index) => {
              this.selectChange(item, index)
            })
            this.isMounted = false
          }
          if (item.dataSetType === '8') {
            const tmp = {
              columnName: item.columnName,
              isPrimarykey: item.isPrimarykey,
              tableName: item.tableName,
              tableOrder: item.tableOrder,
              columnKey: item.columnKey,
              filterValue: item.filterValue,
              operator: item.operator,
              dataSetType: '8'
            }
            arrTmp.push(tmp)
          }
        })
        if (arrTmp.length > 0) {
          arrTmp.forEach(item => {
            const index = this.serviceMetadata.findIndex(i => {
              return i.tableName === item.tableName
            })
            const idx = item.columnKey.lastIndexOf('.') === -1 ? 0 : item.columnKey.lastIndexOf('.') + 1
            this.serviceMetadata[index].matchTable.push({
              modelField: item.columnKey.substr(idx),
              columnName: item.columnName,
              operator: item.operator,
              columnKey: item.columnKey.substr(idx),
              filterValue: item.filterValue
            })
          })
        }
      },
      deep: true
    }
  },
  methods: {
    init() {
      this.serviceMetadata = []
      this.serviceMetadataList = []
    },
    getTableList() {
      if (this.tableList.length > 0) return
      const id = this.baseInfo.datasourceId
      get_table_list(id).then((res) => {
        if (res.data.code === 200) {
          this.tableList = res.data.data.filter(i => {
            return i.type === 'table'
          })
        } else {
          this.$message({
            message: res.data.message ? res.data.message : '获取列表信息失败',
            type: 'error'
          })
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    addtable() {
      this.serviceMetadata.push(
        {
          'fieldList': [],
          'tableName': '',
          'tableOrder': null,
          'matchTable': []
        }
      )
    },
    deletetable(index) {
      this.$confirm('确认删除该配置吗？')
        .then(() => {
          this.serviceMetadata.splice(index, 1)
        })
        .catch(err => console.error(err))
    },
    selectChange(val, index) {
      if (!this.isMounted && this.serviceMetadata[index].matchTable.length > 0) {
        this.$confirm('切换表会删除当前表的配置,确定此操作？')
          .then(() => {
            this.serviceMetadata[index].matchTable = []
          })
          .catch(err => console.error(err))
      }
      if (val.length > 0) {
        this.$refs[`box${index}`][0].isShow = true
      }
      const id = this.baseInfo.datasourceId
      const data = {
        databaseName: this.baseInfo.databaseName,
        sql: `SELECT * from ${this.serviceMetadata[index].tableName}`,
        tableName: this.serviceMetadata[index].tableName
      }
      get_tableField_listArr(
        id, data
      ).then((res) => {
        if (res.data.code === 200) {
          if (res.data.data.length === 0) return
          if (res.data.data.length > 0) {
            this.serviceMetadata[index].fieldList = res.data.data
            this.serviceMetadata[index].tableOrder = index
          }
        } else {
          this.$message({
            message: res.data.message ? res.data.message : '获取表字段信息失败',
            type: 'error'
          })
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    edit(item, index) {
      this.winConfig.dialogVisible = true
      this.winConfig.type = 'add'
      this.serviceMetadataIndex = index
      this.fieldListTmp = item.fieldList
      this.formTmp = {
        columnName: '',
        operator: '',
        columnKey: '',
        filterValue: null
      }
    },
    confirmFilter() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.winConfig.type === 'add') {
            this.serviceMetadata[this.serviceMetadataIndex].matchTable.push(Object.assign({}, this.formTmp))
          } else if (this.winConfig.type === 'modify') {
            this.serviceMetadata[this.serviceMetadataIndex].matchTable.splice(this.operationRowIndex, 1, Object.assign({}, this.formTmp))
          }
          this.winConfig.dialogVisible = false
        } else {
          return false
        }
      })
    },

    modify(row, index, item) {
      this.winConfig.dialogVisible = true
      this.winConfig.type = 'modify'
      this.operationRowIndex = index
      this.fieldListTmp = item.fieldList
      this.formTmp = Object.assign(this.formTmp, row)
      this.serviceMetadata.forEach((item, index) => {
        item.matchTable.forEach(i => {
          if (JSON.stringify(i) === JSON.stringify(row)) {
            this.serviceMetadataIndex = index
          }
        })
      })
    },
    remove(row, index) {
      this.serviceMetadata.forEach((item, index) => {
        item.matchTable.forEach(i => {
          if (JSON.stringify(i) === JSON.stringify(row)) {
            this.serviceMetadataIndex = index
          }
        })
      })
      this.$confirm('确认删除该配置吗？')
        .then(() => {
          this.serviceMetadata[this.serviceMetadataIndex].matchTable.splice(index, 1)
        })
        .catch(err => console.error(err))
    },
    fillArr() {
      this.serviceMetadataList = []
      this.serviceMetadata.forEach(item => {
        if (item.matchTable.length !== 0) {
          this.serviceMetadataList.push({
            'dataSetType': '6',
            'tableName': item.tableName,
            'tableOrder': item.tableOrder
          })
        }
        item.matchTable.forEach(i => {
          const field = item.fieldList.find(j => {
            return i.columnName === j.column_name
          })
          this.serviceMetadataList.push({
            columnName: i.columnName,
            isPrimarykey: field.primaryKey || null,
            tableName: item.tableName,
            tableOrder: item.tableOrder,
            columnKey: i.columnKey,
            filterValue: i.filterValue,
            operator: i.operator,
            dataSetType: '8'
          })
        })
      })
    },
    clear() {
      this.formTmp.columnKey = ''
    }

  }
}
</script>

<style scoped lang='scss'>
.top {
  display: flex;
  align-items: center;
}
.bottom {
  .tip {
    display: inline-block;
    background: rgba(144, 147, 153, 0.1);
    padding: 5px 10px;
    border-radius: 5px;
    margin: 5px 6px;
    &:hover {
      cursor: pointer;
    }
  }
  .selected {
    background-color: #ffb44b;
  }
  .wrap {
    padding: 6px 0;
  }
}
.btn {
  display: table;
  width: 35%;
  margin: 5px auto;
}
.titleBox {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 10px 20px;
  border-top: 1px solid #d5e3ef;
  .txt {
    font-size: 15px;
    color: #478fca !important;
  }
}
</style>
