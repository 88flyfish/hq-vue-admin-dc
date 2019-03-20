<template>
  <div id="details_main">
    <div id="details_left">
      <Anchor id="details_anchor" :affix="false" show-ink>
        <AnchorLink href="#basic" title="基本信息" />
        <AnchorLink href="#requestparameter" title="请求参数" />
        <AnchorLink href="#responseparameter" title="返回参数" />
        <AnchorLink href="#requestDemo" title="请求示例" />
        <AnchorLink href="#responseDemo" title="返回示例" />
        <AnchorLink href="#code" title="返回码说明" />
        <AnchorLink href="#remarks" title="备注" />
      </Anchor>
    </div>
    <div id="details_right">
      <div class="details_title">
        web服务接口资源
      </div>
      <div class="details_content">
        <el-collapse v-model="activeNames">
          <el-collapse-item id="basic" title="基本信息" name="1">
            <el-table :data="details_basic" border style="width: 100%">
              <el-table-column prop="type" label="参数" width="200"/>
              <el-table-column prop="value" label="值"/>
            </el-table>
          </el-collapse-item>
          <el-collapse-item id="requestparameter" title="请求参数" name="2">
            <el-table :data="request_parameter" border style="width: 100%">
              <el-table-column prop="name" label="名称" width="200"/>
              <el-table-column :show-overflow-tooltip="true" prop="des" label="描述"/>
              <el-table-column prop="demoValue" label="示例值"/>
              <el-table-column prop="type" label="类型"/>
              <el-table-column :formatter="filterRequire" prop="isRequire" label="是否必填"/>
            </el-table>
          </el-collapse-item>
          <el-collapse-item id="responseparameter" title="返回参数" name="3">
            <el-table :data="response_parameter" border style="width: 100%">
              <el-table-column prop="name" label="名称" width="300">
                <template slot-scope="scope">
                  <div style="cursor: pointer;" @click="treeClick(scope.row,scope.$index)">
                    <template v-if="scope.row.children && scope.row.children.length > 0">
                      <i v-if="scope.row.open" :style="'margin-left:'+(scope.row.level-1)+'em;'" class="el-icon-arrow-down"/>
                      <i v-else :style="'margin-left:'+(scope.row.level-1)+'em;'" class="el-icon-arrow-right"/>
                      <span>{{ scope.row.name }}</span>
                    </template>
                    <span v-else :style="'margin-left:'+((scope.row.level-1)+1.25)+'em;'">{{ scope.row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :show-overflow-tooltip="true" prop="des" label="描述"/>
              <el-table-column prop="demoValue" label="示例值"/>
              <el-table-column prop="type" label="类型"/>
            </el-table>
          </el-collapse-item>
          <el-collapse-item id="requestDemo" title="请求示例" name="4">
            <div class="demoborder" v-html="requestDemo"/>
          </el-collapse-item>
          <el-collapse-item id="responseDemo" title="返回示例" name="5">
            <div class="demoborder" v-html="responseDemo"/>
          </el-collapse-item>
          <el-collapse-item id="code" title="返回码说明" name="6">
            <el-table :data="codeParams" border style="width: 100%">
              <el-table-column prop="name" label="名称" width="200"/>
              <el-table-column prop="des" label="描述"/>
              <el-table-column prop="demoValue" label="示例值"/>
              <el-table-column prop="type" label="类型"/>
              <!--<el-table-column prop="responseParamsVoList" label="responseParamsVoList">
                        </el-table-column>-->
            </el-table>
          </el-collapse-item>
          <el-collapse-item id="remarks" title="备注" name="5">
            <div class="demoborder" style="min-height: 200px;" v-html="remarks"/>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
    <div id="returnTop" title="返回顶部" @click="returnTop">
      <i class="el-icon-arrow-up"/>
    </div>
    <div style="clear: both;"/>
  </div>
</template>

<script>
import Anchor from '../../utils/anchor/anchor.vue'
import AnchorLink from '../../utils/anchor/anchor-link.vue'
import fetch from '@/utils/fetch.js'
import Cookies from 'js-cookie'
var util = {}
util.treeTableXcode = function(data, xcode) {
  xcode = xcode || ''
  for (var i = 0; i < data.length; i++) {
    var n = (xcode.split('-')).length
    var item = data[i]
    item.level = n
    item.xcode = xcode + i
    if (item.children && item.children.length > 0) {
      util.treeTableXcode(item.children, item.xcode + '-')
    }
  }
}

export default {
  components: {
    Anchor,
    AnchorLink
  },
  data() {
    return {
      info: {},
      activeNames: ['1', '2', '3', '4', '5', '6'],
      details_basic: [],
      request_parameter: [],
      response_parameter: [],
      requestDemo: '',
      responseDemo: '',
      codeParams: [],
      remarks: ''
    }
  },
  mounted() {
    this.getInfo()
    window.onscroll = function() {
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById('returnTop').style.display = 'block'
      } else {
        document.getElementById('returnTop').style.display = 'none'
      }
    }
  },
  //      filters: {
  //          filterRequire(val){
  //              debugger
  //              return val;
  //          }
  //      },
  methods: {
    getInfo() {
      const _this = this
      var id = Cookies.get('servicedetailsID')
      fetch({
        //                  url: 'http://192.168.1.241:9095/dataset/' + id + '/document',
        url: `service/${id}/document`,
        //                  url: 'http://192.168.1.241:9095/dataset/296318988118528000/document',
        method: 'get'
      }).then(res => {
        if (res.data.code == 200) {
          _this.info = res.data.data
          _this.refreshTable()
        }
      })
    },
    refreshTable() {
      this.details_basic = [{
        type: '接口名称',
        value: this.info.name
      }, {
        type: '请求参数',
        value: this.info.httpMethod
      }, {
        type: '接口地址',
        value: this.info.path
      }, {
        type: '接口描述',
        value: this.info.des
      }, {
        type: '返回类型',
        value: this.info.resultType
      }]
      this.requestDemo = this.formatJson($.parseJSON(this.info.requestDemo))
      this.responseDemo = this.formatJson($.parseJSON(this.info.responseDemo))
      this.request_parameter = this.info.requestParamsList
      this.response_parameter = this.info.responseParmasList
      this.parameterHandle(this.response_parameter)
      this.codeParams = this.info.codeParams
      this.remarks = this.info.remarks
    },
    parameterHandle(val) {
      for (let i = 0; i < val.length; i++) {
        val[i].children = val[i].responseParamsVoList
      }
      util.treeTableXcode(this.response_parameter)
    },
    menuAdd() {

    },
    treeClick(item, index) {
      if (item.open) {
        this.collapse(item, index)
      } else {
        this.expand(item, index)
      }
    },
    expand(item, index) {
      if (!item.children) {
        return index
      }
      // 展开
      for (var i = 0; item.children && i < item.children.length; i++) {
        var child = item.children[i]
        this.response_parameter.splice(++index, 0, child)
        if (child.children && child.children.length > 0 && child.open) {
          index = this.expand(child, index)
        }
      }
      item.open = true
      return index
    },
    collapse(item, index) {
      if (!item.children) {
        return index
      }
      // 收缩
      item.open = false
      var len = 0
      for (var i = index + 1; i < this.response_parameter.length; i++) {
        var xcode = this.response_parameter[i].xcode
        if (xcode.startsWith(item.xcode + '-')) {
          len++
        } else {
          break
        }
      }
      this.response_parameter.splice(index + 1, len)
    },
    // json格式化
    formatJson(msg) {
      var rep = '~'
      var jsonStr = JSON.stringify(msg, null, rep)
      var str = ''
      for (var i = 0; i < jsonStr.length; i++) {
        var text2 = jsonStr.charAt(i)
        if (i > 1) {
          var text = jsonStr.charAt(i - 1)
          if (rep != text && rep == text2) {
            str += '<br/>'
          }
        }
        str += text2
      }
      jsonStr = ''
      for (var i = 0; i < str.length; i++) {
        var text = str.charAt(i)
        if (rep == text) { jsonStr += '        ' } else {
          jsonStr += text
        }
        if (i == str.length - 2) { jsonStr += '<br/>' }
      }
      return jsonStr
    },
    filterRequire(val) {
      if (val.isRequire == '1') {
        val.isRequire = '必填'
      } else {
        val.isRequire = '选填'
      }
      return val.isRequire
    },
    returnTop() {
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0
    }
  }
}
</script>
<style lang="scss">
#details_main {
  width: 80%;
  min-width: 800px;
  min-height: 1000px;
  margin: 0 auto;
  position: relative;
}

#details_left {
  width: 15%;
  height: 300px;
  float: left;
}

#details_right {
  width: 85%;
  float: left;
}

.details_title {
  text-align: center;
  height: 50px;
  line-height: 50px;
  font-size: 20px;
  font-family: 微软雅黑;
}

#details_anchor {
  position: fixed;
  /*margin-left: -150px;*/
  /*top: 180px;*/
  margin-top: 10px;
  font-size: 12px;
  color: #515a6e;
  border-left: 2px solid #ece8e8;
  padding-left: 10px;
}

.el-collapse-item__header {
  /*background: #ecf5ff;*/
  background: #8ff0f3;
  padding-left: 20px;
  color: #fff;
}

.demoborder {
  border: 1px solid #ebeef5;
  padding: 10px;
}

.el-collapse-item__wrap {
  /*padding: 20px;*/
}

#returnTop {
  position: fixed;
  width: 50px;
  height: 50px;
  bottom: 100px;
  right: 50px;
  background: #15aafb;
  border: 2px solid #15aafb;
  border-radius: 100%;
  cursor: pointer;
  &:hover {
    background-color: #fff;
    border: 2px solid #15aafb;
  }
  &:hover > i {
    color: #15aafb;
  }
}

#returnTop i {
  color: #fff;
  position: absolute;
  top: 11px;
  left: 12px;
  font-size: 24px;
  font-weight: 900;
}
</style>
