<template>
  <div class="read-data-wrap">
    <div class="left">
      <draggable
        :list="listForm"
        :options="options"
        class="board-column-content">
        <div v-for="element in listForm" :key="element.id" class="board-item animated pulse">
          <span>{{ element.columnName }}</span>
        </div>
      </draggable>
    </div>
    <div class="right">
      <div class="">
        <div class="tit">字段名</div>
        <draggable
          :list="listSelectForm"
          :options="options"
          class="board-column-content bg">
          <div v-for="(element, i) in listSelectForm" :key="element.id" class="board-item animated pulse">
            <span v-if="element.aliasName==''" style="margin-right: -6px">{{ element.columnName }}</span>
            <span v-else style="margin-right: -6px">{{ element.columnName }} ({{ element.aliasName }})</span>
            <span class="el-icon-edit-outline" style="cursor: pointer" @click="listSelectEditor(element)"/>
          </div>
        </draggable>
      </div>
      <div>
        <div class="tit">
          <span>聚合表达式</span>
          <span class="el-icon-plus" @click="polymeric"/>
        </div>
        <!--<div v-for="item in expAlias" style="margin-top: 5px;text-align: center">-->
        <!--<span class="juhe-alias"> {{ item.name }} </span>-->
        <!--<span class="el-icon-edit-outline" style="cursor: pointer" @click="expEditor(item.id, item.codeValue, item.name)"/>-->
        <!--<span class="el-icon-circle-close-outline" style="cursor: pointer" @click="expDel(item.id,item.name)"/>-->
        <!--</div>-->
        <div v-for="item in serveInfo2Form" style="margin-top: 5px;text-align: center">
          <span class="juhe-alias"> {{ item.aliasName }} </span>
          <span class="el-icon-edit-outline" style="cursor: pointer" @click="expEditor(item.id, item.columnName, item.aliasName)"/>
          <span class="el-icon-circle-close-outline" style="cursor: pointer" @click="expDel(item.id,item.aliasName)"/>
        </div>
      </div>
      <div>
        <div class="tit">
          <span>可选过滤</span>
          <span class="el-icon-plus" @click="addFilter"/>
        </div>
        <!--<div v-for="item in filterAlias" style="margin-top: 5px;text-align: center">-->
        <!--<span class="juhe-alias"> {{ item.name }} </span>-->
        <!--<span class="el-icon-edit-outline" style="cursor: pointer" @click="filterEditor(item.id,item.name)"/>-->
        <!--<span class="el-icon-circle-close-outline" style="cursor: pointer" @click="filterDel(item.id,item.name)"/>-->
        <!--</div>-->
        <div v-for="item in serveInfo3Form" style="margin-top: 5px;text-align: center">
          <span class="juhe-alias"> {{ item.aliasName }} </span>
          <span class="el-icon-edit-outline" style="cursor: pointer" @click="filterEditor(item.id,item.aliasName)"/>
          <span class="el-icon-circle-close-outline" style="cursor: pointer" @click="filterDel(item.id,item.aliasName)"/>
        </div>
      </div>
    </div>
    <!--表达式弹窗-->
    <el-dialog
      :visible.sync="dialogVisible"
      title="表达式"
      append-to-body
      width="40%">
      <el-form :model="form">
        <el-form-item :label-width="formLabelWidth" label="字段">
          <!--<el-input v-model="form.name" autocomplete="off"></el-input>-->
          <ul class="form-ul">
            <li v-for="item in listSelectForm" class="input-item">
              <span @click="selectField(item)">{{ item.columnName }}</span>
            </li>
          </ul>
        </el-form-item>
        <el-form-item :label-width="formLabelWidth" label="聚合">
          <ul class="form-ul">
            <li v-for="item in calcList" class="input-item">
              <span @click="selectCalc(item.name)">{{ item.name }}</span>
            </li>
          </ul>
        </el-form-item>
        <el-form-item :label-width="formLabelWidth" label="表达式">
          <code-mirror ref="codeMirrorEd" :val="selectFields"/>
        </el-form-item>
        <el-form-item :label-width="formLabelWidth" label="别名">
          <el-input v-model="form.aliasName" auto-complete="off"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sure">确 定</el-button>
      </span>
    </el-dialog>
    <!--可选过滤弹窗-->
    <el-dialog
      :visible.sync="dialogVisible2"
      title="可选过滤"
      append-to-body
      width="40%">
      <el-form :model="filterForm">
        <el-form-item :label-width="formLabelWidth" label="字段">
          <ul class="form-ul">
            <li v-for="item in listSelectForm" class="input-item" >
              <span :class="{active : filterFieldActive == item.columnName}" @click="filterSelectField(item.columnName)">{{ item.columnName }}</span>
            </li>
            <li v-for="item in serveInfo2Form" class="input-item" >
              <span :class="{active : filterFieldActive == item.columnName}" @click="filterSelectField(item.columnName)">{{ item.columnName }}</span>
            </li>
          </ul>
        </el-form-item>
        <el-form-item :label-width="formLabelWidth" label="过滤条件">
          <el-select v-model="filterValue" placeholder="请选择">
            <el-option
              v-for="item in filter"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item :label-width="formLabelWidth" label="对应字段">
          <treeSelect
            v-model="filterForm.columnKey"
            :multiple="false"
            :options="reqModelTree"
            :props="defaultProps"
            size="medium"
            @clear="clear" />
        </el-form-item>
        <el-form-item :label-width="formLabelWidth" label="是否必填">
          <el-switch
            v-model="isRequire"
            active-color="#13ce66"
            inactive-color="#ff4949"/>
        </el-form-item>
        <el-form-item :label-width="formLabelWidth" label="别名">
          <el-input v-model="filterForm.aliasName" auto-complete="off"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="sure2">确 定</el-button>
      </span>
    </el-dialog>
    <!--字段别名修改-->
    <el-dialog
      :visible.sync="dialogVisible3"
      title="修改别名"
      append-to-body
      width="40%">
      <el-form :model="filedForm">
        <el-form-item :label-width="formLabelWidth" label="字段">
          <ul class="form-ul">
            <li class="input-item" >
              <span>{{ filedForm.name }}</span>
            </li>
          </ul>
        </el-form-item>
        <el-form-item :label-width="formLabelWidth" label="别名">
          <el-input v-model="filedForm.aliasName" auto-complete="off"/>
        </el-form-item>
        <el-form-item :label-width="formLabelWidth" label="中文描述">
          <el-input v-model="filedForm.description" auto-complete="off"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible3 = false">取 消</el-button>
        <el-button type="primary" @click="sure3">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import codeMirror from '@/components/CodeMirror'
import treeSelect from '@/components/common/treeSelect'
export default {
  name: 'ReadData',
  components: {
    draggable,
    codeMirror,
    treeSelect
  },
  props: {
    options: {
      // 要将元素从一个列表拖动到另一个列表，两个列表必须具有相同的group值。
      type: Object,
      default() {
        return {
          group: 'mission',
          ghostClass: 'ghost'
        }
      }
    },
    list: {
      // 需要渲染的数据
      type: Array,
      default() {
        return []
      }
    },
    listSelect: {
      // 选中后的数据
      type: Array,
      default() {
        return []
      }
    },
    serveInfo2: {
      type: Array,
      default() {
        return []
      }
    },
    serveInfo3: {
      type: Array,
      default() {
        return []
      }
    },
    reqModelTree: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      listForm: [],
      listSelectForm: [],
      serveInfo2Form: [],
      serveInfo3Form: [],
      dialogVisible: false,
      dialogVisible2: false,
      dialogVisible3: false,
      formLabelWidth: '70px',
      calcList: [
        { name: 'sum', id: 1 },
        { name: 'count', id: 2 },
        { name: 'avg', id: 3 },
        { name: 'max', id: 4 },
        { name: 'min', id: 5 },
        { name: 'distinct', id: 6 }
      ],
      defaultProps: {
        value: 'columnKey',
        label: 'columnName',
        children: 'fields'
      },
      form: {
        aliasName: '',
        columnName: ''
      },
      isRequire: false,
      filterForm: {
        columnName: '',
        operator: '',
        aliasName: '',
        columnKey: '',
        isRequire: '2'
      },
      filedForm: {
        name: '',
        aliasName: '',
        description: ''
      },
      selectFields: '',
      expAlias: [],
      filterAlias: [],
      filter: [{
        value: '>',
        label: '>'
      }, {
        value: '<',
        label: '<'
      }, {
        value: '=',
        label: '='
      }, {
        value: '≥',
        label: '≥'
      }, {
        value: '≤',
        label: '≤'
      }, {
        value: '≠',
        label: '≠'
      },
      {
        value: '[a,b)',
        label: '[a,b)'
      },
      {
        value: '(a,b]',
        label: '(a,b]'
      },
      {
        value: '(a,b)',
        label: '(a,b)'
      },
      {
        value: '[a,b]',
        label: '[a,b]'
      }
      ],
      filterValue: '',
      filterFieldActive: '',
      dataSetConfiguration: [],
      expFlat: '',
      filterFlat: '',
      expId: '',
      filterId: ''
    }
  },
  watch: {
    'list': {
      handler(val) {
        this.listForm = val
      },
      deep: true
    },
    'listSelect': {
      handler(val) {
        this.listSelectForm = val
      },
      deep: true
    },
    'serveInfo2': {
      handler(val) {
        this.serveInfo2Form = val
      },
      deep: true
    },
    'serveInfo3': {
      handler(val) {
        this.serveInfo3Form = val
      },
      deep: true
    },
    'isRequire': {
      handler(val) {
        if (val) {
          this.filterForm.isRequire = '1'
        } else {
          this.filterForm.isRequire = '2'
        }
      }
    }
  },
  methods: {
    // 字段别名修改
    listSelectEditor(val) {
      this.dialogVisible3 = true
      this.filedForm.name = val.columnName
      this.filedForm.aliasName = val.aliasName
      this.filedForm.description = val.description
    },
    // 字段修改确定按钮
    sure3() {
      this.dialogVisible3 = false
      const i = this.listSelectForm.findIndex(item => item.columnName === this.filedForm.name)
      this.listSelectForm[i].aliasName = this.filedForm.aliasName
      this.listSelectForm[i].description = this.filedForm.description
    },
    polymeric() {
      if (!this.listSelectForm.length) {
        this.$message({
          message: '请选择字段',
          type: 'warning'
        })
      } else {
        this.expFlat = 'add'
        this.dialogVisible = true
      }
    },
    // 添加表达式选择字段
    selectField(val) {
      this.selectFields = ''
      this.selectFields = val.columnName
    },
    // 添加聚合函数
    selectCalc(name) {
      const calc = name + '()'
      this.selectFields = calc
    },
    // 添加表达式确定按钮
    sure() {
      if (this.form.name === '') {
        this.$message({
          message: '请填写别名',
          type: 'warning'
        })
      } else {
        if (this.expFlat === 'add') {
          // 添加表达式的时候随机生成一个字符串作为id，方便后续修改工作。后期最好改成每添加一个表达式就入库。
          const id = Math.floor(Math.random() * 10000).toString()
          this.serveInfo2Form.push({ id: id, aliasName: this.form.aliasName, columnName: this.$refs.codeMirrorEd.getEditors() })
          this.dialogVisible = false
        } else {
          const i = this.serveInfo2Form.findIndex(item => item.id === this.expId)
          this.serveInfo2Form[i].aliasName = this.form.aliasName
          this.serveInfo2Form[i].columnName = this.$refs.codeMirrorEd.getEditors()
          this.dialogVisible = false
        }
      }
    },
    // 编辑表达式
    expEditor(id, code, name) {
      this.expFlat = 'edit'
      this.dialogVisible = true
      // this.$refs.codeMirrorEd.setEditors(code)
      this.form.aliasName = name
      this.form.columnName = code
      this.expId = id
    },
    // 删除表达式
    expDel(id, name) {
      this.$confirm('此操作将删除该表达式, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.serveInfo2Form.splice(this.serveInfo2Form.findIndex(item => item.id === id), 1)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
    },
    // 添加过滤
    addFilter() {
      if (!this.listSelectForm.length) {
        this.$message({
          message: '请选择字段',
          type: 'warning'
        })
      } else {
        this.filterFlat = 'add'
        this.dialogVisible2 = true
      }
    },
    // 选择过滤字段
    filterSelectField(name) {
      this.filterFieldActive = name
      this.filterForm.columnName = name
    },
    // 添加过滤确定按钮
    sure2() {
      if (this.filterForm.name == '') {
        this.$message({
          message: '请填写别名',
          type: 'warning'
        })
      } else {
        if (this.filterFlat == 'add') {
          // 添加表达式的时候随机生成一个字符串作为id，方便后续修改工作。后期最好改成确定之后就入库。
          const id = Math.floor(Math.random() * 10000).toString()
          this.serveInfo3Form.push(
            {
              id: id,
              columnName: this.filterForm.columnName,
              columnKey: this.filterForm.columnKey,
              operator: this.filterValue,
              aliasName: this.filterForm.aliasName,
              isRequire: this.filterForm.isRequire
            })
          this.dialogVisible2 = false
        } else {
          const i = this.serveInfo3Form.findIndex(item => item.id === this.filterId)
          this.serveInfo3Form[i].columnName = this.filterForm.columnName
          this.dialogVisible2 = false
        }
      }
    },
    // 编辑过滤条件
    filterEditor(id, name) {
      this.filterFlat = 'edit'
      this.dialogVisible2 = true
      this.filterForm.aliasName = name
      this.filterId = id
    },
    // 删除过滤条件
    filterDel(id, name) {
      this.$confirm('此操作将删除该过滤条件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.serveInfo3Form.splice(this.serveInfo3Form.findIndex(item => item.id === id), 1)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
    },
    clear() {
      this.filterForm.columnKey = ''
    },
    condition() {
      for (const i in this.listSelectForm) {
        this.dataSetConfiguration.push(
          { dataSetType: 0, columnName: this.listSelectForm[i].columnName, aliasName: this.listSelectForm[i].aliasName })
      }
      for (const i in this.serveInfo2Form) {
        this.dataSetConfiguration.push(
          { dataSetType: 2, columnName: this.serveInfo2Form[i].columnName, aliasName: this.serveInfo2Form[i].aliasName }
        )
      }
      for (const i in this.serveInfo3Form) {
        this.dataSetConfiguration.push(
          {
            dataSetType: 3,
            columnName: this.serveInfo3Form[i].columnName,
            columnKey: this.serveInfo3Form[i].columnKey,
            aliasName: this.serveInfo3Form[i].aliasName,
            operator: this.serveInfo3Form[i].operator,
            isRequire: this.serveInfo3Form[i].isRequire
          }
        )
      }
    }
  }
}
</script>

<style scoped lang="scss">
.read-data-wrap {
  width: 100%;
  display: flex;
  height: 95%;
  .left {
    flex: 1;
    border: 1px solid #ccc;
    margin-left: 20px;
    margin-top: 30px;
    margin-right: 20px;
    min-height: 260px;
  }
  .right {
    flex: 1.5;
    border: 1px solid #ccc;
    margin-left: 20px;
    margin-top: 30px;
    margin-right: 20px;
    display: flex;
    min-height: 260px;
    > div {
      flex: 1;
      border-right: 1px solid #ccc;
    }
    .tit {
      width: 100%;
      text-align: center;
      margin-top: 5px;
      border-bottom: 1px dotted #ccc;
      .el-icon-plus {
        font-weight: 900;
        cursor: pointer;
      }
    }
    .bg {
      background: url("../../assets/Global-img/dragIn.png") no-repeat center/50%;
    }
  }
  /*拖拽过度效果*/
  .ghost {
    opacity: 0.5;
  }
  .animated {
    -webkit-animation-duration: 0.4s;
    animation-duration: 0.4s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
  }
  @keyframes pulse {
    from {
      -webkit-transform: scale3d(1, 1, 1);
      transform: scale3d(1, 1, 1);
    }
    50% {
      -webkit-transform: scale3d(1.05, 1.05, 1.05);
      transform: scale3d(1.05, 1.05, 1.05);
    }
    to {
      -webkit-transform: scale3d(1, 1, 1);
      transform: scale3d(1, 1, 1);
    }
  }
  .pulse {
    -webkit-animation-name: pulse;
    animation-name: pulse;
  }
}
.form-ul {
  border: 1px solid #dcdfe6;
  overflow: hidden;
}
.input-item {
  float: left;
}
.input-item span {
  cursor: pointer;
  padding: 6px;
  background: #f1f1f1;
  margin: 0 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 12px;
}
.input-item span:hover {
  background: #ddd;
  border: 1px solid #999;
}
.board-column-content {
  min-height: 20px;
  height: 100%;
}

.board-item {
  margin-top: 5px;
  float: left;
}

.board-item span {
  cursor: move;
  padding: 6px;
  display: inline-block;
  background: #f1f1f1;
  margin: 0 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 12px;
}
.juhe-alias {
  padding: 6px;
  display: inline-block;
  background: #f1f1f1;
  margin: 0 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 12px;
}
.input-item .active {
  background: #409eff;
  color: #fff;
  border: 1px solid #409eff;
}
</style>
