<template>
  <div class="boxWrap">
    <div class="boxItem">
      <span class="txt">表查询方式:</span>
      <el-radio-group v-model="form.sqlType" size="mini">
        <el-radio-button label="0">语句查询</el-radio-button>
        <el-radio-button label="1">自动查询</el-radio-button>
      </el-radio-group>
    </div>
    <div v-if="form.sqlType=='0'" class="boxItem">
      <span class="txt">语句查询:</span>
      <code-mirror v-if="winConfig.active===2" ref="codeMirrorEd" :val="sqlVal" class="CodeMirror"/>
    </div>
    <div v-show="form.sqlType=='1'">
      <div class="boxItem">
        <span class="txt">数据库表名:</span>
        <el-select v-model="masterTableId" placeholder="请选择" size="mini" @visible-change="getTableList" >
          <el-option
            v-for="item in tableList"
            :key="item.id"
            :label="item.name"
            :value="item.id"/>
        </el-select>
      </div>
      <div v-for="(item,index) in form.joinTableList" :key="index" class="boxItem_table">
        <div class="largeBox">
          <div class="smallBox">
            <div class="wrap">
              <span class="txt">关联表{{ index+1 }}:</span>
              <el-select v-model="item.linkTableID" placeholder="请选择" size="mini" @change="linktabelChange(item,index,'link')">
                <el-option
                  v-for="i in tableList"
                  :key="i.id"
                  :label="i.name"
                  :value="i.id"/>
              </el-select>
            </div>
            <div class="wrap">
              <span class="txt">关联字段:</span>
              <el-select v-model="item.linkField" placeholder="请选择" size="mini">
                <el-option
                  v-for="i in item.linkFieldList"
                  :key="i"
                  :label="i"
                  :value="i"/>
              </el-select>
            </div>
            <div class="wrap">
              <span class="txt">连接方式:</span>
              <el-select v-model="item.linkType" placeholder="请选择" size="mini">
                <el-option
                  v-for="item in linkTypes"
                  :key="item.label"
                  :label="item.label"
                  :value="item.value"/>
              </el-select>
            </div>
            <div class="wrap">
              <span class="txt">被关联表:</span>
              <el-select v-model="item.islinkTableID" placeholder="请选择" size="mini" @change="linktabelChange(item,index,'islink')">
                <el-option
                  v-for="i in item.isLinktableList"
                  :key="i.id"
                  :label="i.name"
                  :value="i.id"/>
              </el-select>
            </div>
            <div class="wrap">
              <span class="txt">被关联字段:</span>
              <el-select v-model="item.islinkField" placeholder="请选择" size="mini">
                <el-option
                  v-for="item in item.islinkFieldList"
                  :key="item"
                  :label="item"
                  :value="item"/>
              </el-select>
            </div>
          </div>
          <div v-for="(i,idx) in item.OtherLinkFieldList" v-show="item.OtherLinkFieldList.length>0" :key="idx" class="smallBox sBox">
            <div class="wrap">
              <span class="txt">连接方式:</span>
              <el-select v-model="i.linkRelationType" placeholder="请选择" size="mini">
                <el-option
                  v-for="item in linkRelationTypes"
                  :key="item"
                  :label="item"
                  :value="item"/>
              </el-select>
            </div>
            <div class="wrap">
              <span class="txt">关联字段:</span>
              <el-select v-model="i.linkField" placeholder="请选择" size="mini">
                <el-option
                  v-for="item in item.linkFieldList"
                  :key="item"
                  :label="item"
                  :value="item"/>
              </el-select>
            </div>
            <div class="wrap">
              <span class="txt">被关联字段:</span>
              <el-select v-model="i.islinkField" placeholder="请选择" size="mini">
                <el-option
                  v-for="item in item.islinkFieldList"
                  :key="item"
                  :label="item"
                  :value="item"/>
              </el-select>
            </div>
            <el-button type="danger" icon="el-icon-minus" circle size="mini" @click="deleteLink(index,idx)"/>
          </div>
        </div>
        <div class="btnWrap">
          <div class="btnBox">
            <el-button type="primary" icon="el-icon-plus" circle size="mini" @click="addLink(index)"/>
          </div>
          <div class="btnBox">
            <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="deleteLinktable(index)"/>
          </div>
        </div>
      </div>
    </div>
    <el-button
      v-show="form.sqlType=='1'"
      class="btn"
      size="mini"
      type="primary"
      icon="el-icon-plus"
      plain
      @click="addLinktable">添加关联表</el-button>
  </div>
</template>

<script>
import { get_dataSource_list, get_table_list, execute_sql, get_tableField_listArr } from '@/api/project/service'
import codeMirror from '@/components/CodeMirror'
export default {
  components: {
    codeMirror
  },
  props: {
    winConfig: {
      type: Object,
      default() {
        return {
          dialogVisible: false,
          active: 0,
          title: '',
          serviceType: '',
          type: ''
        }
      }
    },
    masterTableName: {
      type: String,
      default: ''
    },
    linkCondition: {
      type: Object,
      default() {
        return {
          'sqlType': '0',
          'serviceSql': '',
          'joinTableList': []
        }
      }
    },
    baseInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    flag: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 当前数据源
      currentDatasource: {},
      // 数据源集合
      datasourceList: [],
      // 当前主表信息
      masterTableId: '',
      // 表集合
      tableList: [],
      sqlVal: '',
      flagA: this.flag,
      // 主表字段名集合
      masterFieldList: [],
      isExist: false,
      linkTypes: [
        { label: '内连接', value: 'inner' },
        { label: '左连接', value: 'left' },
        { label: '右连接', value: 'right' }
      ],
      linkRelationTypes: ['and', 'or'],
      // linkTableID关联表ID islinkTableID被关联表ID linkFieldList关联表字段名集合 islinkFieldList被关联表字段名集合
      // linkField关联表选择字段 islinkField被关联表选择字段 linkType连接方式 OtherLinkFieldList其他关联方式 isLinktableList可选被关联表可选
      //   joinTableList : [{
      //     linkTableID: '',
      //     islinkTableID: '',
      //     linkFieldList: [],
      //     islinkFieldList: [],
      //     linkField: '',
      //     islinkField: '',
      //     linkType: '',
      //     OtherLinkFieldList: [],
      //     isLinktableList: []
      //   }]
      form: {
        'sqlType': '0',
        'serviceSql': '',
        'joinTableList': []
      }
    }
  },
  watch: {
    'flag': {
      handler(newVal) {
        this.flagA = newVal
      },
      immediate: true
    },
    flagA(newVal) {
      this.$emit('update:flag', newVal)
    },
    'masterTableName'(val) {

    },
    'masterTableId'() {
      this.mastertabelChange()
    },
    'baseInfo.datasourceId': {
      handler(val) {
        this.currentDatasource = this.datasourceList.filter(item => {
          return item.datasourceId === this.baseInfo.datasourceId
        })[0]
      }
    },
    'linkCondition': {
      handler(val) {
        this.form = {
          'serviceSql': val.serviceSql,
          'sqlType': val.sqlType,
          'joinTableList': JSON.parse(val.joinTableList ? val.joinTableList : [])
        }
        this.getTableList()
        if (val.sqlType === '0') {
          this.$refs.codeMirrorEd.setEditors(val.serviceSql)
        }
      },
      deep: true
    }
  },
  mounted() {
    this.getDataSourceList()
  },
  methods: {
    init() {
      this.form = {
        'sqlType': '0',
        'serviceSql': '',
        'joinTableList': []
      }
      this.masterTableId = ''
    },

    getDataSourceList() {
      get_dataSource_list().then((res) => {
        if (res.data.code === 200) {
          this.datasourceList = res.data.data.map(item => {
            return {
              datasourceId: item.id,
              label: `【 ${item.databaseType} 】 ${item.name}`,
              type: item.databaseType,
              databaseName: item.databaseName
            }
          })
          this.currentDatasource = this.datasourceList[0]
        } else {
          this.$message({
            message: res.data.message ? res.data.message : '获取列表信息失败',
            type: 'error'
          })
        }
      }).catch((err) => {
        console.error(err)
      })
    },
    getTableList() {
      if (this.tableList.length > 0) return
      const id = this.baseInfo.datasourceId
      get_table_list(id).then((res) => {
        if (res.data.code === 200) {
          this.tableList = res.data.data.filter(i => {
            return i.type === 'table'
          })
          const tableName = this.form.serviceSql.substr(this.form.serviceSql.indexOf('from') + 4).match(/\s+[^\s]+\s/)
          this.masterTableId = this.tableList.find(i => {
            return i.name === tableName[0].trim()
          }).id
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

    async _executeSqlValidate() {
      if (!this.validataTable()) {
        return true
      }
      return false
    },
    validataTable() {
      if (this.form.joinTableList.length > 0) {
        const obj = this.form.joinTableList[this.form.joinTableList.length - 1]
        if (obj.OtherLinkFieldList.length > 0) {
          const relationObj = obj.OtherLinkFieldList[obj.OtherLinkFieldList.length - 1]
          if (relationObj.linkRelationType === '' ||
            relationObj.islinkField === '' ||
            relationObj.linkField === '') {
            this.$message({
              message: '请填写完整关联信息',
              type: 'error'
            })
            return false
          }
        }
        if (obj.linkTableID === '' ||
          obj.islinkTableID === '' ||
          obj.linkType === '' ||
          obj.linkField === '' ||
          obj.islinkField === '') {
          this.$message({
            message: '请填写完整关联信息',
            type: 'error'
          })
          return false
        }
      }
      return true
    },
    executeSql() {
      this._executeSqlValidate().then(v => {
        this.flagA = false
        if (v) return
        this.flagA = true
        const id = this.baseInfo.datasourceId
        let handleSql
        if (this.form.sqlType === '1' || this.form.sqlType === 1) {
          // 生成26个英文字母数组
          // abc 主表别名 可随意取
          const aliasArr = Array.from(Array(26), (item, index) => String.fromCharCode(index + 97))
          const masterTableName = this.tableList.find(i => {
            return i.id === this.masterTableId
          }).name
          let filedsStr = ''
          this.masterFieldList.forEach((i, index) => {
            if (index !== this.masterFieldList.length - 1) {
              filedsStr += `abc.${i} as ${masterTableName}_${i},`
            } else {
              filedsStr += `abc.${i} as ${masterTableName}_${i}`
            }
          })
          if (this.validataTable() && this.form.joinTableList.length === 0) {
            handleSql = `select ${filedsStr} from ${masterTableName} abc`
          }
          const aliasList = [{
            name: masterTableName,
            alias: 'abc'
          }]
          if (this.validataTable() && this.form.joinTableList.length > 0) {
            this.form.joinTableList.forEach((item, index) => {
              const alias = aliasArr[index]
              // 关联表信息
              const linkTable = this.tableList.find(i => {
                return item.linkTableID === i.id
              })
              // 被关联表信息
              const islinkTable = this.tableList.find(i => {
                return item.islinkTableID === i.id
              })
              item.linkFieldList.forEach(i => {
                filedsStr += `,${aliasArr[index]}.${i} as ${linkTable.name}_${i}`
              })
              handleSql = `select ${filedsStr} from ${masterTableName} abc`
              aliasList.push({
                name: linkTable.name,
                alias: alias
              })
              let islinkTableAlias = ''
              aliasList.forEach(i => {
                if (i.name === islinkTable.name) {
                  islinkTableAlias = i.alias
                }
              })
              handleSql += ` ${item.linkType} join ${linkTable.name} ${alias} on ${alias}.${item.linkField} = ${islinkTableAlias}.${item.islinkField} `
              if (item.OtherLinkFieldList.length > 0) {
                item.OtherLinkFieldList.forEach((i, idx) => {
                  handleSql += ` ${i.linkRelationType} ${alias}.${i.linkField} = ${islinkTableAlias}.${i.islinkField}`
                })
              }
            })
          }
        }
        const data = {
          databaseName: this.currentDatasource.databaseName,
          sql: this.form.sqlType === '0' ? this.$refs.codeMirrorEd.getEditors() : handleSql
        }
        this.form.serviceSql = data.sql
        execute_sql({ data }, id).then((res) => {
          if (res.data.code === 200) {
            this.$emit('execute', res.data.data)
          } else {
            this.$message({
              message: '查询失败',
              type: 'error'
            })
          }
        }).catch((err) => {
          console.log(err)
        })
      })
    },
    mastertabelChange() {
      const masterTableName = this.tableList.find(i => {
        return i.id === this.masterTableId
      }).name
      const id = this.baseInfo.datasourceId
      const data = {
        databaseName: this.baseInfo.databaseName,
        sql: `SELECT * from ${masterTableName}`,
        tableName: masterTableName
      }
      get_tableField_listArr(
        id, data
      ).then((res) => {
        if (res.data.code === 200) {
          if (res.data.data === 0) return
          if (res.data.data.length > 0) {
            this.masterFieldList = res.data.data.map(i => {
              return i.column_name
            })
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
    linktabelChange(val, index, type) {
      const table = this.tableList.find(i => {
        if (type === 'link') {
          return i.id === val.linkTableID
        } else if (type === 'islink') {
          return i.id === val.islinkTableID
        }
      })
      if (type === 'link') {
        this.form.joinTableList[index].isLinktableList = []
        this.form.joinTableList.forEach(j => {
          if (j.linkTableID !== this.form.joinTableList[index].linkTableID) {
            this.tableList.forEach(i => {
              if (j.linkTableID === i.id) {
                this.form.joinTableList[index].isLinktableList.push(i)
              }
            })
          }
        })
        const masterTable = this.tableList.find(i => {
          return i.id === this.masterTableId
        })
        this.form.joinTableList[index].isLinktableList.push(masterTable)
      }
      const id = this.baseInfo.datasourceId
      const data = {
        databaseName: this.baseInfo.databaseName,
        sql: `SELECT * from ${table.name}`,
        tableName: table.name
      }
      get_tableField_listArr(
        id, data
      ).then((res) => {
        if (res.data.code === 200) {
          if (res.data.data.length === 0) return
          if (res.data.data.length > 0) {
            if (type === 'link') {
              this.form.joinTableList[index].linkFieldList = res.data.data.map(i => {
                return i.column_name
              })
            } else if (type === 'islink') {
              this.form.joinTableList[index].islinkFieldList = res.data.data.map(i => {
                return i.column_name
              })
            }
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

    addLinktable() {
      if (!this.validataTable() && this.form.joinTableList.length !== 0) { return }
      this.form.joinTableList.push({
        linkTableID: '',
        islinkTableID: '',
        linkFieldList: [],
        islinkFieldList: [],
        linkField: '',
        islinkField: '',
        linkType: '',
        OtherLinkFieldList: [],
        isLinktableList: []
      })
    },
    deleteLinktable(index) {
      this.form.joinTableList.splice(index, 1)
    },
    validataLink(index) {
      const arr = this.form.joinTableList[index].OtherLinkFieldList
      if (arr.length > 0) {
        const relationObj = arr[arr.length - 1]
        if (relationObj.linkRelationType === '' ||
          relationObj.islinkField === '' ||
          relationObj.linkField === '') {
          this.$message({
            message: '请填写完整关联信息',
            type: 'error'
          })
          return false
        }
      }
      return true
    },
    addLink(index) {
      if (!this.validataLink(index)) { return }
      this.form.joinTableList[index].OtherLinkFieldList.push({
        linkRelationType: '',
        islinkField: '',
        linkField: ''
      })
    },
    deleteLink(index, idx) {
      this.form.joinTableList[index].OtherLinkFieldList.splice(idx, 1)
    },
    condition() {
      const form = {
        'serviceSql': this.form.serviceSql,
        'sqlType': this.form.sqlType + '',
        'joinTableList': JSON.stringify(this.form.joinTableList)
      }
      return form
    }
  }
}
</script>

<style scoped lang='scss'>
/deep/ .boxItem .CodeMirror {
  width: 100%;
  height: 200px;
  border: 1px solid #ddd;
  cursor: pointer;
}

/deep/.tableDetail .el-input--medium .el-input__inner {
  height: 26px;
  line-height: 26px;
}
/deep/.tableDetail .el-icon-arrow-up:before {
  position: absolute;
  top: -5px;
}
.boxWrap {
  width: 90%;
  margin: 0 auto;
}
.boxItem {
  display: flex;
  align-items: center;
  margin: 5px 0;
  .txt {
    display: inline-box;
    width: 100px;
    flex-shrink: 0;
  }
  .mirrorTxt {
    width: 100%;
  }
  /deep/ .el-select {
    width: 100%;
  }
}
.boxItem_table {
  display: flex;
  align-items: center;
  margin: 5px 0;
  background: #eef1f6;
  .largeBox {
    padding: 5px;
    border-right: 3px solid #c7cfdd;
    .smallBox {
      display: flex;
      align-items: center;
      justify-content: between-space;
      margin: 4px 0;
      .wrap {
        display: flex;
        align-items: center;
        margin: 0 5px;
        .txt {
          display: inline-box;
          width: 75px;
          flex-shrink: 0;
          text-align: right;
        }
        /deep/ .el-select {
          width: 100%;
        }
      }
    }
    .sBox {
      width: 90%;
      padding: 3px 12px 3px 3px;
      margin-left: 8%;
      justify-content: flex-end;
      .wrap {
        width: 22%;
      }
    }
  }

  .btnWrap {
    display: flex;
    align-items: center;
    justify-content: space-around;
    // background-color: #e3eaf5;
    .btnBox {
      margin: 5px;
    }
  }
}
.btn {
  display: table;
  width: 35%;
  margin: 5px auto;
}
.star {
  color: #f56c6c;
  margin-right: 4px;
}
</style>
