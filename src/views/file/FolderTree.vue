<template>
  <div class="folder-tree">
    <el-dialog
      :visible.sync="show"
      :title="title"
      width="520px">
      <el-tree
        ref="folderTree"
        :data="folderList"
        :props="defaultProps"
        :default-expanded-keys="[0]"
        current-node-key="0"
        highlight-current
        node-key="id">
        <span slot-scope="{ node, data }">
          <span>
            <i class="icon-folder"/>{{ node.label }}
          </span>
        </span>
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="show = false">取消</el-button>
        <el-button
          type="primary"
          size="small"
          @click="submit">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getAllFolder, moveFile, copyFile } from '../../api/project/fileManage'

export default {
  name: 'FolderTree',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    operation: {
      type: String,
      default: ''
    },
    originalList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      show: this.visible,
      folderList: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      srcFileList: this.originList,
      operationType: this.operation
    }
  },
  watch: {
    visible(newVal) {
      this.show = newVal
    },
    show(newVal) {
      if (newVal) {
        this.listFolder()
      } else {
        this.$emit('update:visible', newVal)
      }
    },
    'originalList': {
      handler(newVal) {
        this.srcFileList = newVal
      },
      deep: true
    },
    operation(newVal) {
      this.operationType = newVal
    }
  },
  methods: {
    listFolder() {
      getAllFolder().then(
        res => {
          if (res.data.code === 200) {
            const list = res.data.data
            list.unshift({
              id: 0,
              parentId: -1,
              name: '全部文件',
              isDir: '1',
              path: ''
            })
            this.folderList = this.generateTreeData(list)
            this.$nextTick(() => {
              this.$refs.folderTree.setCurrentKey(this.folderList[0].id)
            })
          } else {
            this.$message({
              type: 'error',
              message: '获取文件夹失败'
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
    /**
     * 生成树结构数据
     *
     * @param data
     * @returns {Array}
     */
    generateTreeData(data) {
      const map = {}
      data.forEach(element => {
        map[element.id] = element
      })
      const list = []
      data.forEach(element => {
        const parent = map[element.parentId]
        if (parent) {
          (parent.children || (parent.children = [])).push(element)
        } else {
          list.push(element)
        }
      })
      return list
    },
    copy(data) {
      copyFile(data).then(
        res => {
          if (res.data.code === 200) {
            this.$message({
              type: 'success',
              message: '复制成功'
            })
            this.show = false
            this.$emit('refresh')
          } else {
            this.$message({
              type: 'error',
              message: res.data.message
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
    move(data) {
      moveFile(data).then(
        res => {
          if (res.data.code === 200) {
            this.$message({
              type: 'success',
              message: '移动成功'
            })
            this.show = false
            this.$emit('refresh')
          } else {
            this.$message({
              type: 'error',
              message: res.data.message
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
    submit() {
      const destFileManage = this.$refs.folderTree.getCurrentNode()
      delete destFileManage.children
      const data = {
        originList: this.srcFileList,
        destFileManage: destFileManage
      }
      if (this.operationType === 'moveFile') {
        this.move(data)
      } else if (this.operationType === 'copyFile') {
        this.copy(data)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .folder-tree {
    .icon-folder {
      display: inline-block;
      width: 30px;
      height: 20px;
      background: url(../../assets/img/icon.png) no-repeat 0 0;
      vertical-align: bottom;
    }
  }
</style>

<style lang="scss">
  .folder-tree {
    .el-dialog {
      .el-dialog__body {
        height: 320px;
        padding: 10px 20px;
        .el-tree {
          height: 100%;
          overflow: auto;
          .el-tree-node__content{
            height: 34px;
            .el-tree-node__expand-icon {
              color: #333;
              font-size: 12pt;
              &.is-leaf {
                color: transparent !important;
              }
              &:before {
                font-family: FontAwesome;
                content: "\f196";
              }
              &.expanded {
                font-family: FontAwesome;
                transform: none;
                &:before {
                  content: "\f147";
                }
              }
            }
          }
        }
      }
    }
    .el-dialog__wrapper {
      overflow: hidden;
    }
  }
</style>
