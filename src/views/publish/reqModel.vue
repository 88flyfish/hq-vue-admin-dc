<template>
  <div class="modelWrap">
    <el-button
      class="btn"
      size="mini"
      type="primary"
      icon="el-icon-plus"
      plain
      @click="add">添加数据模型字段</el-button>
    <el-tree
      ref="tree"
      :data="treeDataForm"
      :props="resourceProps"
      :expand-on-click-node="false"
      :render-content="renderContent"
      node-key="id"
      default-expand-all/>

  </div>
</template>

<script>
const id = 1000
export default {
  name: 'ReqModel',
  props: {
    treeData: {
      type: Array,
      default() {
        return []
      }
    },
    typeOption: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      flag: true,
      treeDataForm: [],
      resourceProps: {
        label: 'columnName',
        children: 'fields'
      },
      generateRules: [
        {
          name: 'uuid',
          value: '2'
        }
      ]
    }
  },
  computed: {
    types() {
      if (this.typeOption === '0') {
        return [
          {
            name: 'number',
            value: '2'
          },
          {
            name: 'string',
            value: '1'
          },
          {
            name: 'list',
            value: '3'
          },
          {
            name: 'object',
            value: '4'
          },
          {
            name: 'objectList',
            value: '5'
          }
        ]
      } else if (this.typeOption === '1') {
        return [
          {
            name: 'number',
            value: '2'
          },
          {
            name: 'string',
            value: '1'
          },
          {
            name: 'object',
            value: '4'
          }
        ]
      }
    }
  },
  watch: {
    'treeData': {
      handler: function(val) {
        this.treeDataForm = val
      },
      deep: true
    }
  },
  mounted() {
    // this.treeDataForm = this.treeData
  },
  methods: {
    init() {
      this.treeDataForm = []
    },
    // 给树结构数据递归添加 columnKey、parentKey标识
    addKey(tree, parentKey) {
      tree.forEach((item) => {
        item.parentKey = parentKey
        if (parentKey === '') {
          item.columnKey = `${item.columnName}`
        } else {
          item.columnKey = `${parentKey}.${item.columnName}`
        }
        if (item.fields.length > 0) {
          this.addKey(item.fields, item.columnKey)
        }
      })
    },
    renderContent(h, { node, data, store }) {
      return (
        <div>
          <el-row gutter={10} >
            <el-col span={4} class='itemBox'>
              <div>名字:</div>
              <div>
                <el-input v-model={data.columnName} placeholder='请输入' size='mini' on-blur={() => { this._validateName(node, data) }} />
              </div>
            </el-col>
            <el-col span={4} class='itemBox'>
              <div>类型:</div>
              <div>
                <el-select v-model={data.columnType} placeholder='请选择类型' size='mini'>
                  {this.types.map(i => {
                    return <el-option
                      key={i.value}
                      label={i.name}
                      value={i.value} />
                  }
                  )}
                </el-select>
              </div>
            </el-col>
            <el-col span={4} class='itemBox'>
              <div>描述:</div>
              <div>
                <el-input v-model={data.columnDescription} placeholder='请输入' size='mini' />
              </div>
            </el-col>
            <el-col span={5} class='itemBox'>
              <div>自动生成:</div>
              <el-checkbox
                value={data.autoGenerate === '1'}
                on-input={val => data.autoGenerate = val ? '1' : '2'}
              />
              <div>规则:</div>
              <div>
                <el-select v-model={data.generateType} disabled={data.autoGenerate === '2'} placeholder='请选择规则' size='mini'>
                  {this.generateRules.map(i => {
                    return <el-option
                      key={i.value}
                      label={i.name}
                      value={i.value} />
                  }
                  )}
                </el-select>
              </div>
            </el-col>
            <el-col span={3} class='itemBox'>
              <span style='float: right; margin-right: 5px'>
                <el-button size='mini' v-show={data.columnType === '4' || data.columnType === '5'} on-click={() => this.append(node, data)}>添加</el-button>
                <el-button size='mini' on-click={() => this.remove(node, data)}>删除</el-button>
              </span>
            </el-col>
          </el-row>
        </div>)
    },
    generateUUID() {
      var d = new Date().getTime()
      if (window.performance && typeof window.performance.now === 'function') {
        d += performance.now() // use high-precision timer if available
      }
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
      })
      return uuid
    },
    add() {
      this.treeDataForm.push({
        webID: id,
        parentKey: '',
        columnName: null,
        columnType: null,
        columnDescription: null,
        columnKey: '',
        autoGenerate: '2',
        generateType: null,
        fields: []
      })
    },
    append(node, data) {
      if (!data.fields) {
        this.$set(data, 'fields', [])
      }
      const id = this.generateUUID()
      data.fields.push({
        webID: id,
        columnName: null,
        columnType: null,
        columnDescription: null,
        columnKey: '',
        autoGenerate: '2',
        generateType: null,
        fields: []
      })
    },
    remove(node, data) {
      this.$confirm('确认删除该节点吗？')
        .then(() => {
          this.$refs.tree.remove(node)
        })
        .catch(err => console.error(err))
    },
    _validateName(node, data) {
      if (!data.columnName.match(/^[a-zA-Z\d]+$/)) {
        this.flag = false
      } else {
        this.flag = true
      }
      var sum = 0
      node.parent.childNodes.forEach(item => {
        if (item.data.columnName === data.columnName) sum++
      })
      if (sum > 1) {
        this.$message({
          message: '数据模型同级字段不能重名',
          type: 'warning'
        })
        this.flag = false
      }
    }
  }
}
</script>

<style scoped lang='scss'>
.btn {
  display: table;
  width: 35%;
  margin: 5px auto;
}
.tree {
  display: block;
  width: 100%;
  overflow-x: hidden;
  font-size: 13px;
  color: #333;
}

.tree {
  position: relative;
}

.tree li {
  display: block;
  width: calc(99%);
  padding-left: 20px;
  line-height: 28px;
}

.tree li p {
  font-family: iconfont;
  position: relative;
  display: block;
  cursor: pointer;
}
</style>
<style>
.modelWrap .el-tree-node__content {
  height: 45px;
}
.modelWrap .itemBox {
  margin: 5px 0;
  display: flex;
  align-items: center;
}
.modelWrap .el-tree-node > .el-tree-node__children {
  overflow: initial;
}
</style>
