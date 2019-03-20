<template>
  <div class="container-box">
    <div class="operation-box">
      <div class="search-bar">
        <div class="search-input">
          <el-form label-width="50px">
            <el-form-item label="名称:" size="mini">
              <el-input
                v-model.trim="conditions.serviceName"
                placeholder="请输入名称"/>
            </el-form-item>
          </el-form>
        </div>
        <div class="search-button">
          <el-button
            type="primary"
            plain
            size="mini"
            icon="el-icon-search"
            @click="search">查询</el-button>
          <el-button
            type="primary"
            plain
            size="mini"
            icon="fa fa-retweet"
            @click="reset">重置</el-button>
        </div>
      </div>
      <div class="operation-bar">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="showServiceWin">服务</el-button>
        <el-button
          type="danger"
          size="mini"
          icon="el-icon-delete"
          @click="batchRemoveConfirm">批量删除</el-button>
      </div>
    </div>
    <div class="table-box">
      <el-table
        v-loading="loading"
        ref="publishTable"
        :data="dataList"
        :default-sort="{prop: 'createTime', order: 'descending'}"
        stripe
        style="width: 100%"
        @row-click="singleSelect"
        @sort-change="sortChange"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="index"
          width="40"
          align="center"/>
        <el-table-column
          type="selection"
          width="40"
          align="center"/>
        <el-table-column
          :sort-orders="['ascending', 'descending']"
          label="名称"
          prop="serviceName"
          sortable="custom"
          align="center"/>
        <el-table-column
          prop="dataSource.name"
          label="数据源"
          align="center"/>
        <el-table-column
          :show-overflow-tooltip="true"
          prop="serverPath"
          label="服务访问地址"
          align="center"/>
        <el-table-column
          :show-overflow-tooltip="true"
          :formatter="formatterFun"
          prop="serviceType"
          label="服务类型"
          align="center"/>
        <el-table-column
          :sort-orders="['ascending', 'descending']"
          prop="createTime"
          label="创建时间"
          sortable="custom"
          align="center"/>
        <el-table-column
          prop="serviceDescription"
          label="描述"
          align="center"/>
        <el-table-column label="操作项" align="center" width="300">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="modify(scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeConfirm(scope.row)">删除</el-button>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-view"
              @click="showDetail(scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <pagination
          :total="total"
          :page.sync="pageConfig.pageNumber"
          :limit.sync="pageConfig.pageSize"
          @pagination="pagination"/>
      </div>
    </div>
    <!-- 服务 -->
    <el-dialog
      :visible.sync="serviceWinConfig.dialogVisible"
      :title="serviceWinConfig.title"
      custom-class = "dialogStyle">
      <!-- insert/delete/update/search -->
      <el-steps v-show="serviceWinConfig.serviceType ==='1'" :active="serviceWinConfig.active" align-center>
        <el-step title="基础操作"/>
        <el-step title="构建参数数据模型"/>
        <el-step title="选择关联关系"/>
        <el-step title="聚合"/>
      </el-steps>
      <el-steps v-show="serviceWinConfig.serviceType ==='2'" :active="serviceWinConfig.active" align-center >
        <el-step title="基础操作"/>
        <el-step title="构建参数数据模型"/>
        <el-step title="匹配表字段"/>
      </el-steps>
      <el-steps v-show="serviceWinConfig.serviceType ==='3'" :active="serviceWinConfig.active" align-center >
        <el-step title="基础操作"/>
        <el-step title="构建参数数据模型"/>
        <el-step title="构建条件数据模型"/>
        <el-step title="匹配字段及过滤条件"/>
      </el-steps>
      <el-steps v-show="serviceWinConfig.serviceType ==='4'" :active="serviceWinConfig.active" align-center >
        <el-step title="基础操作"/>
        <el-step title="构建条件数据模型"/>
        <el-step title="过滤条件"/>
      </el-steps>

      <!-- 第一步 基础信息填写-->
      <baseInfo
        v-show="serviceWinConfig.active===0"
        ref="baseInfo"
        :win-type="serviceWinConfig.type"
        :base-info="baseInfo"
        @changeType="changeType"/>
      <!-- search-->
      <reqModel
        v-show="serviceWinConfig.active===1&&serviceWinConfig.serviceType ==='1'"
        ref="reqModelSearch"
        :tree-data="treeData"/>
      <linkCondition
        v-show="serviceWinConfig.active===2&&serviceWinConfig.serviceType ==='1'"
        ref="linkCondition"
        :win-config = "serviceWinConfig"
        :flag.sync="flag"
        :master-table-name="masterTableName"
        :base-info="baseInfo"
        :link-condition="linkCondition"
        @execute="execute"/>
      <readData
        v-show="serviceWinConfig.active===3&&serviceWinConfig.serviceType ==='1'"
        ref="readData"
        :list="list"
        :list-select="listSelect"
        :req-model-tree="reqModelTree"
        :serve-info2="serveInfo2"
        :serve-info3="serveInfo3"/>
      <!-- insert-->
      <reqModel
        v-show="serviceWinConfig.active===1&&serviceWinConfig.serviceType ==='2'"
        ref="reqModelInsert"
        :tree-data="treeData"/>
      <matchField
        v-show="serviceWinConfig.active===2&&serviceWinConfig.serviceType ==='2'"
        ref="matchField"
        :base-info="baseInfo"
        :req-model-tree="reqModelTree"
        :service-metadata-arr="serviceMetadataList"/>
      <!-- update -->
      <reqModel
        v-show="serviceWinConfig.active===1&&serviceWinConfig.serviceType ==='3'"
        ref="reqModelA"
        :tree-data="treeDataA"
        type-option="1"/>
      <reqModel
        v-show="serviceWinConfig.active===2&&serviceWinConfig.serviceType ==='3'"
        ref="reqModelB"
        :tree-data="treeDataB"/>
      <updateFilter
        v-show="serviceWinConfig.active===3&&serviceWinConfig.serviceType ==='3'"
        ref="updateFilter"
        :base-info="baseInfo"
        :req-model-tree-b="reqModelTreeB"
        :req-model-tree-a="reqModelTreeA"
        :service-metadata-arr="serviceMetadataList"/>
      <!-- delete -->
      <reqModel
        v-show="serviceWinConfig.active===1&&serviceWinConfig.serviceType ==='4'"
        ref="reqModelDelete"
        :tree-data="treeData"/>
      <deleteFilter
        v-show="serviceWinConfig.active===2&&serviceWinConfig.serviceType ==='4'"
        ref="deleteFilter"
        :base-info="baseInfo"
        :req-model-tree="reqModelTree"
        :service-metadata-arr="serviceMetadataList"/>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="serviceWinConfig.dialogVisible = false">取 消</el-button>
        <el-button v-if="preBtnCb()" type="primary" @click="preFn">上一步</el-button>
        <el-button v-if="nextBtnCb()" type="primary" @click="nextFn">下一步</el-button>
        <el-button v-if="confirmBtnCb()" type="primary" @click="confirmService">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '../../components/Pagination/index'
import linkCondition from './linkCondition'
import readData from './readData'
import baseInfo from './baseInfo'
import reqModel from './reqModel'
import matchField from './matchField'
import updateFilter from './updateFilter'
import deleteFilter from './deleteFilter'
import { getServiceList, deleteById, batchRemove } from '../../api/project/publish'
import { saveService, getDataService, editService } from '../../api/project/service'
export default {
  components: {
    Pagination,
    linkCondition,
    readData,
    baseInfo,
    reqModel,
    matchField,
    updateFilter,
    deleteFilter
  },
  data() {
    return {
      serveConfig: {
        dialogVisible: false,
        active: 1,
        title: '',
        type: ''
      },
      serviceWinConfig: {
        dialogVisible: false,
        active: 0,
        title: '',
        serviceType: '', // search='1' insert = '2' update='3' delete = '4'
        type: '' // add modify
      },
      flag: false,
      operationItem: null,
      linkCondition: {
        'serviceSql': '',
        'sqlType': '0',
        'joinTableList': []
      },
      loading: true,
      dataList: [],
      total: 0,
      pageConfig: {
        pageNumber: 1,
        pageSize: 10
      },
      conditions: {
        serviceName: ''
      },
      orderFields: [],
      ids: [],
      masterTableName: '',
      list: [],
      listSelect: [],
      serveInfo2: [],
      serveInfo3: [],
      baseInfo: {
        datasourceId: '',
        serviceName: '',
        nameDes: '',
        remarks: '',
        serviceType: '1',
        databaseName: '',
        serviceDescription: ''
      },

      // 聚合运算
      dcServiceMetadata: [],
      serviceMetadataList: [],
      treeData: [],
      treeDataA: [],
      treeDataB: [],
      reqModelTree: null,
      reqModelTreeA: null,
      reqModelTreeB: null,
      // 表集合
      tableList: []
    }
  },
  watch: {
    'serviceWinConfig.dialogVisible'(val) {
      if (val === true && this.serviceWinConfig.type === 'add') {
        this.$nextTick(() => {
          this.$refs.baseInfo.init()
          this.$refs.reqModelA.init()
          this.$refs.reqModelB.init()
          this.$refs.reqModelSearch.init()
          this.$refs.reqModelInsert.init()
          this.$refs.reqModelDelete.init()
          this.$refs.matchField.init()
          this.$refs.updateFilter.init()
          this.$refs.deleteFilter.init()
        })
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    changeType(val) {
      this.serviceWinConfig.serviceType = val
    },
    formatterFun(row) {
      switch (row.serviceType) {
        case '1':
          return 'search'
        case '2':
          return 'insert'
        case '3':
          return 'update'
        case '4':
          return 'delete'
      }
    },
    preBtnCb() {
      if (this.serviceWinConfig.active === 0) {
        return false
      } else {
        return true
      }
    },
    nextBtnCb() {
      if (this.serviceWinConfig.serviceType === '2' || this.serviceWinConfig.serviceType === '4') {
        if (this.serviceWinConfig.active !== 2) {
          return true
        } else {
          return false
        }
      } else if (this.serviceWinConfig.serviceType === '1' || this.serviceWinConfig.serviceType === '3') {
        if (this.serviceWinConfig.active !== 3) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    confirmBtnCb() {
      if (this.serviceWinConfig.serviceType === '2' || this.serviceWinConfig.serviceType === '4') {
        if (this.serviceWinConfig.active === 2) {
          return true
        } else {
          return false
        }
      } else if (this.serviceWinConfig.serviceType === '1' || this.serviceWinConfig.serviceType === '3') {
        if (this.serviceWinConfig.active === 3) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    },
    // 单选功能
    singleSelect(row) {
      this.$refs.publishTable.clearSelection()
      this.$refs.publishTable.toggleRowSelection(row)
    },
    preFn() {
      this.serviceWinConfig.active--
      this.preBtnCb()
      this.nextBtnCb()
    },
    async _isAllowNext() {
      //   const existName = await this.$refs.baseInfo._exist()
      const validCheck = await this.$refs.baseInfo.validCheck()
      if (this.serviceWinConfig.active === 0 && !validCheck) {
        this.$message({
          message: '请填写完整正确信息',
          type: 'warning'
        })
        return false
      } else if (this.serviceWinConfig.active === 1) {
        return true
      } else if (this.serviceWinConfig.active === 2) {

      }
      return true
    },
    nextFn() {
      this._isAllowNext().then(val => {
        if (val) {
          this.serviceWinConfig.active++
          this._nextFun()
        } else {
          return
        }
      })
    },
    _nextFun() {
      if (this.serviceWinConfig.active === 1) { // 第一步
        this.baseInfo = {
          serviceName: this.$refs.baseInfo.baseInfoForm.serviceName,
          nameDes: this.$refs.baseInfo.baseInfoForm.nameDes,
          datasourceId: this.$refs.baseInfo.baseInfoForm.datasourceId,
          databaseName: this.$refs.baseInfo.baseInfoForm.databaseName,
          serviceType: this.$refs.baseInfo.baseInfoForm.serviceType,
          remarks: this.$refs.baseInfo.baseInfoForm.remarks,
          serviceDescription: this.$refs.baseInfo.baseInfoForm.serviceDescription
        }
      } else if (this.serviceWinConfig.active === 2) { // 第二步
        if (this.serviceWinConfig.serviceType === '1') { // search
          this.$refs.reqModelSearch.addKey(this.$refs.reqModelSearch.treeDataForm, '')
          this.reqModelTree = this.$refs.reqModelSearch.treeDataForm
        } else if (this.serviceWinConfig.serviceType === '2') { // insert
          this.$refs.reqModelInsert.addKey(this.$refs.reqModelInsert.treeDataForm, '')
          this.reqModelTree = this.$refs.reqModelInsert.treeDataForm
        } else if (this.serviceWinConfig.serviceType === '3') { // update
          this.$refs.reqModelA.addKey(this.$refs.reqModelA.treeDataForm, '')
          this.reqModelTreeA = this.$refs.reqModelA.treeDataForm
        } else if (this.serviceWinConfig.serviceType === '4') { // delete
          this.$refs.reqModelDelete.addKey(this.$refs.reqModelDelete.treeDataForm, '')
          this.reqModelTree = this.$refs.reqModelDelete.treeDataForm
        }
      } else if (this.serviceWinConfig.active === 3) { // 第三步
        if (this.serviceWinConfig.serviceType === '1') { // search
          this.$refs.linkCondition.executeSql()
        } else if (this.serviceWinConfig.serviceType === '3') {
          this.$refs.reqModelB.addKey(this.$refs.reqModelB.treeDataForm, '')
          this.reqModelTreeB = this.$refs.reqModelB.treeDataForm
        }
      }
      this.preBtnCb()
      this.nextBtnCb()
    },
    execute(val) {
      if (val.rows.length === 0) {
        this.$message({
          message: '该表为空，请重新选择',
          type: 'warning'
        })
        this.serveConfig.active = 0
        return
      } else {
        if (this.dcServiceMetadata.length > 0) {
          const arr = []
          Object.keys(val.rows[0]).forEach((item, i) => {
            arr.push({ columnName: item, aliasName: '', id: i, description: '' })
          })
          const _that = this
          const _arr = arr.filter(i => {
            for (const j in _that.dcServiceMetadata) {
              if (i.name === _that.dcServiceMetadata[j].columnName) {
                return false
              }
            }
            return i
          })
          // 取出去重后的已有字段名
          this.list = _arr
          console.log(2331, this.dcServiceMetadata, this.list)
          for (const k in this.dcServiceMetadata) {
            if (this.dcServiceMetadata[k].dataSetType === '0') {
              // 取出serviceMetadata中的dataSetType分别为0，2，3的值,并去重
              const selectArr = []
              selectArr.push(this.dcServiceMetadata[k])
              this.listSelect = selectArr
            } else if (this.dcServiceMetadata[k].dataSetType === '2') {
              const serveInfoArr2 = []
              serveInfoArr2.push(this.dcServiceMetadata[k])
              this.serveInfo2 = serveInfoArr2
            } else if (this.dcServiceMetadata[k].dataSetType === '3') {
              const serveInfoArr3 = []
              serveInfoArr3.push(this.dcServiceMetadata[k])
              this.serveInfo3 = serveInfoArr3
            }
          }
        } else {
          const arr = []
          console.log(Object.keys(val.rows[0]))
          Object.keys(val.rows[0]).forEach((item, i) => {
            arr.push({ columnName: item, aliasName: '', id: i, description: '' })
          })
          this.list = arr
        }
      }
    },
    getSingleService(row) {
      getDataService(row.id).then(
        res => {
          if (res.status === 200) {
            this.operationItem = res.data.data
            this.serviceWinConfig.serviceType = this.operationItem.serviceType
            // 基础信息提取
            Object.keys(this.baseInfo).forEach(i => {
              if (i === 'databaseName') {
                this.baseInfo[i] = this.operationItem.dataSource[i]
              } else {
                this.baseInfo[i] = this.operationItem[i]
              }
            })
            if (this.serviceWinConfig.serviceType === '1') {
              this.linkCondition = {
                'serviceSql': this.operationItem.serviceSql,
                'sqlType': this.operationItem.sqlType,
                'joinTableList': this.operationItem.joinTableList
              }
              this.masterTableName = this.operationItem.serviceSql.match(/from\s+(\w+)\s+/i)[1]
              this.dcServiceMetadata = this.operationItem.serviceMetadataList
              this.treeData = this.operationItem.treeData
            } else if (this.serviceWinConfig.serviceType === '2') {
              this.treeData = this.operationItem.treeData
              this.serviceMetadataList = this.operationItem.serviceMetadataList
            } else if (this.serviceWinConfig.serviceType === '3') {
              this.treeDataA = this.operationItem.treeData
              this.treeDataB = this.operationItem.conditionTreeData
              this.serviceMetadataList = this.operationItem.serviceMetadataList
            } else if (this.serviceWinConfig.serviceType === '4') {
              this.treeData = this.operationItem.conditionTreeData
              this.serviceMetadataList = this.operationItem.serviceMetadataList
            }
          } else {
            this.$message({
              type: 'error',
              message: '获取服务信息失败'
            })
          }
        }
      ).catch(() => {
        this.$message({
          type: 'error',
          message: '获取服务信息失败'
        })
      })
    },
    modify(row) {
      this.getSingleService(row)
      this.serviceWinConfig = Object.assign(this.serviceWinConfig, {
        dialogVisible: true,
        active: 0,
        title: '修改服务',
        type: 'modify'
      })
    },
    pagination(page) {
      this.pageConfig = {
        pageNumber: page.page,
        pageSize: page.limit
      }
      this.getList()
    },
    removeConfirm(row) {
      this.$confirm(`确定要删除名称为${row.serviceName}的服务吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.removeById(row.id)
      }).catch(() => {
        console.log('取消批量删除')
      })
    },
    removeById(id) {
      deleteById(id).then(
        res => {
          if (res.data.code === 200) {
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.search()
          } else {
            this.$message({
              type: 'error',
              message: '删除失败'
            })
          }
        }
      ).catch(() => {
        this.$message({
          type: 'error',
          message: '删除失败'
        })
      })
    },
    handleSelectionChange(rows) {
      this.ids = rows.map(element => {
        return element.id
      })
    },
    batchRemoveConfirm() {
      if (this.ids.length === 0) {
        this.$message({
          type: 'warning',
          message: '请选择至少一条记录'
        })
      } else {
        this.$confirm(`确定要批量删除选中的服务吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.batchDelete()
        }).catch(() => {
          console.log('取消批量删除')
        })
      }
    },
    batchDelete() {
      batchRemove({ data: this.ids }).then(
        res => {
          if (res.data.code === 200) {
            this.$message({
              type: 'success',
              message: '批量删除成功'
            })
            this.search()
          } else {
            this.$message({
              type: 'success',
              message: '批量删除失败'
            })
          }
        }
      ).catch(() => {
        this.$message({
          type: 'success',
          message: '批量删除失败'
        })
      })
    },
    search() {
      this.pageConfig.pageNumber = 1
      this.getList()
    },
    reset() {
      this.conditions.serviceName = ''
      this.search()
    },
    sortChange(item) {
      this.orderFields = [
        { field: item.prop, sortType: item.order === 'descending' ? 'desc' : 'asc' }
      ]
      this.getList()
    },
    getList() {
      this.loading = true
      const data = {
        conditions: this.conditions,
        orderFields: this.orderFields,
        pageNumber: this.pageConfig.pageNumber,
        pageSize: this.pageConfig.pageSize
      }
      getServiceList({ data }).then(
        res => {
          if (res.data.code === 200) {
            this.dataList = res.data.data.rows
            this.total = res.data.data.total
            this.loading = false
          }
        }
      ).catch(() => {
        this.loading = false
        console.error('服务异常')
      })
    },
    showDetail(row) {
      this.$router.push({ name: 'detail', params: row })
    },
    showServiceWin() {
      this.serviceWinConfig = {
        dialogVisible: true,
        active: 0,
        title: '新增服务',
        serviceType: '1',
        type: 'add'
      }
    },
    confirmService() {
      let data
      if (this.serviceWinConfig.serviceType === '1') {
        this.$refs.readData.condition()
        data = Object.assign(
          this.$refs.baseInfo.baseInfoForm,
          this.$refs.linkCondition.condition(),
          { 'treeData': this.$refs.reqModelSearch.treeDataForm },
          { 'serviceMetadataList': this.$refs.readData.dataSetConfiguration }
        )
        console.log(this.$refs.reqModelSearch.treeDataForm, 897)
      } else if (this.serviceWinConfig.serviceType === '2') {
        this.$refs.matchField.fillArr()
        const baseInfoForm = this.$refs.baseInfo.baseInfoForm
        const treeDataForm = { 'treeData': this.$refs.reqModelInsert.treeDataForm }
        const serviceMetadataList = { 'serviceMetadataList': this.$refs.matchField.serviceMetadataList }
        data = Object.assign(baseInfoForm, treeDataForm, serviceMetadataList)
      } else if (this.serviceWinConfig.serviceType === '3') {
        this.$refs.updateFilter.fillArr()
        const baseInfoForm = this.$refs.baseInfo.baseInfoForm
        const treeData = { 'treeData': this.$refs.reqModelA.treeDataForm }
        const conditionTreeData = { 'conditionTreeData': this.$refs.reqModelB.treeDataForm }
        const serviceMetadataList = { 'serviceMetadataList': this.$refs.updateFilter.serviceMetadataList }
        data = Object.assign(baseInfoForm, treeData, conditionTreeData, serviceMetadataList)
      } else if (this.serviceWinConfig.serviceType === '4') {
        this.$refs.deleteFilter.fillArr()
        const baseInfoForm = this.$refs.baseInfo.baseInfoForm
        const conditionTreeData = { 'conditionTreeData': this.$refs.reqModelDelete.treeDataForm }
        const serviceMetadataList = { 'serviceMetadataList': this.$refs.deleteFilter.serviceMetadataList }
        data = Object.assign(baseInfoForm, conditionTreeData, serviceMetadataList)
      }
      this._confirmSeriveReq(data)
    },
    _confirmSeriveReq(data) {
      if (this.serviceWinConfig.type === 'add') {
        saveService(data).then(
          res => {
            if (res.data.code === 200) {
              this.getList()
              this.serviceWinConfig.dialogVisible = false
            } else {
              this.$message({
                type: 'error',
                message: '添加失败'
              })
              const h = this.$createElement
              this.$notify({
                title: '报错文本',
                message: h('i', { style: 'color: teal' }, `${res.data.message}`)
              })
            }
          }
        ).catch(() => {
          this.loading = false
          console.error('服务异常')
        })
      } else if (this.serviceWinConfig.type === 'modify') {
        data = Object.assign({ id: this.operationItem.id }, data)
        editService(data).then(
          res => {
            if (res.data.code === 200) {
              this.$message({
                type: 'success',
                message: '修改成功'
              })
              this.getList()
              this.serviceWinConfig.dialogVisible = false
            } else {
              this.$message({
                type: 'error',
                message: '修改失败'
              })
            }
          }
        ).catch(() => {
          this.loading = false
          console.error('修改失败')
        })
      }
    }
  }
}
</script>

<style scoped lang='scss'>
.container-box {
  height: 100%;
  overflow: hidden;
  .operation-box {
    height: 50px;
    background-color: #eff1f5;
    padding: 10px 20px;
    border-bottom: 1px solid #ddd;
    .search-bar {
      display: inline-block;
      > div {
        display: inline-block;
        .search-input {
          width: 200px;
        }
      }
    }
    .operation-bar {
      float: right;
    }
  }
  .table-box {
    height: calc(100% - 50px);
    padding: 10px 0 0;
    overflow: auto;
    .pagination {
      text-align: right;
      padding: 0 25px 20px 0;
      .pagination-container {
        padding: 0;
        margin-top: 25px;
      }
    }
    &::-webkit-scrollbar {
      width: 8px;
      background-color: transparent;
      border-radius: 4px;
      height: 8px;
    }
    /*定义滚动条轨道 内阴影+圆角*/
    &::-webkit-scrollbar-track {
      background-color: transparent;
      border: none;
      border-radius: 4px;
    }

    /*定义滑块 内阴影+圆角*/
    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background-color: #ddd;
      background-color: rgba(222, 222, 222, 0.7);
    }

    &::-webkit-scrollbar-thumb:hover {
      border-radius: 4px;
      background-color: #aaa;
    }
  }
}
/deep/ .dialogStyle {
  width: 1000px;
  min-height: 500px;
}
</style>

<style lang="scss">
.table-box {
  .el-table--medium td,
  .el-table--medium th {
    padding: 10px 0 !important;
  }
}
</style>
