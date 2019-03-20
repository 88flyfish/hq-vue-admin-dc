<template>
  <div class="box">
    <el-form ref="form" :model="baseInfoForm" :rules="rules" label-width="100px" >
      <el-form-item
        label="名称"
        prop="serviceName">
        <el-input v-model="baseInfoForm.serviceName"/>
      </el-form-item>
      <el-form-item label="名称描述" prop="nameDes">
        <el-input v-model="baseInfoForm.nameDes"/>
      </el-form-item>
      <el-form-item
        label="数据源"
        prop="datasourceId">
        <el-select v-model="baseInfoForm.datasourceId" placeholder="请选择数据源" @change="changeSource">
          <el-option
            v-for="item in datasourceList"
            :key="item.datasourceId"
            :label="item.label"
            :value="item.datasourceId"/>
        </el-select>
      </el-form-item>
      <el-form-item
        label="操作方式"
        prop="serviceType">
        <el-select v-model="baseInfoForm.serviceType" placeholder="请选择操作方式">
          <el-option
            v-for="item in serviceTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="服务描述" prop="serviceDescription">
        <el-input v-model="baseInfoForm.serviceDescription" type="textarea"/>
      </el-form-item>
      <el-form-item label="备注" prop="remarks">
        <el-input v-model="baseInfoForm.remarks"/>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { get_dataSource_list, exist } from '@/api/project/service'
export default {
  props: {
    baseInfo: {
      type: Object,
      default() {
        return {
          serviceName: '',
          nameDes: '',
          datasourceId: '',
          databaseName: '',
          serviceType: '1',
          serviceDescription: '',
          remarks: ''
        }
      }
    },
    winType: {
      type: String,
      default: null
    }
  },
  data() {
    const validName = (rule, value, callback) => {
      this._exist().then(val => {
        if (val) {
          callback(new Error('名字已被使用'))
        } else {
          callback()
        }
      })
    }
    return {
      baseInfoForm: {
        serviceName: '',
        nameDes: '',
        datasourceId: '',
        databaseName: '',
        serviceType: '1',
        serviceDescription: '',
        remarks: ''
      },
      validCheckFlag: false,
      // 修改时的服务名字初始值
      initName: null,
      flag: false,
      isExist: false,
      // 数据源集合
      datasourceList: [],
      serviceTypeList: [
        {
          label: 'search',
          value: '1'
        },
        {
          label: 'insert',
          value: '2'
        },
        {
          label: 'update',
          value: '3'
        },
        {
          label: 'delete',
          value: '4'
        }
      ],
      rules: {
        serviceName: [
          { required: true, message: '请填写数据源名称', trigger: 'blur' },
          { validator: validName, trigger: 'blur' }
        ],
        nameDes: [
          { required: true, message: '请填写数据源名称描述信息', trigger: 'blur' }
        ],
        datasourceId: [
          { required: true, message: '请填写数据源', trigger: 'change' }
        ],
        serviceType: [
          { required: true, message: '请选择操作方式', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    'baseInfoForm.serviceType'(val) {
      this.$emit('changeType', val)
    },
    'baseInfo': {
      handler: function(val) {
        this.baseInfoForm = {
          serviceName: val.serviceName,
          nameDes: val.nameDes,
          datasourceId: val.datasourceId,
          databaseName: val.databaseName,
          serviceType: val.serviceType,
          serviceDescription: val.serviceDescription,
          remarks: val.remarks
        }
        this.initName = val.serviceName
      },
      deep: true
    }
  },
  mounted() {
    this.getDataSourceList()
  },
  methods: {
    init() {
      this.baseInfoForm = {
        serviceName: '',
        nameDes: '',
        datasourceId: '',
        databaseName: '',
        serviceType: '1',
        serviceDescription: '',
        remarks: ''
      }
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
    changeSource(val) {
      this.baseInfoForm.databaseName = this.datasourceList.find(i => {
        return i.datasourceId === val
      }).databaseName
    },
    // 检查是否重名
    _exist() {
      return new Promise((resolve, reject) => {
        exist(this.baseInfoForm.serviceName).then((res) => {
          if (res.data.code === 200) {
            let flag = res.data.data
            if (this.winType === 'modify' && this.initName === this.baseInfoForm.serviceName) {
              flag = false
            }
            resolve(flag)
          } else {
            this.$message({
              message: '查询失败',
              type: 'error'
            })
          }
        }).catch((err) => {
          reject(err)
        })
      })
    },
    validName(rule, value, callback) {
      this._exist().then(val => {
        if (val) {
          callback(new Error('名字已被使用'))
        } else {
          callback()
        }
      })
    },
    async validCheck() {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate((valid) => {
          if (valid) {
            resolve(valid)
          } else {
            resolve(valid)
          }
        })
      })
    }
  }
}
</script>

<style scoped lang='scss'>
.box {
  width: 600px;
  margin: 10px auto !important;
}
</style>
