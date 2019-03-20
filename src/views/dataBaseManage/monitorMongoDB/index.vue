<template>
  <div style="padding:15px; overflow: auto; height: 100%;">
    <div v-if="showFlag" >
      <el-row class= "toolPanel">
        <el-button-group>
          <el-button
            icon="el-icon-refresh"
            type="primary"
            size="mini"
            @click="getList">刷新
          </el-button>
          <el-tooltip :content="freshTime" class="item" effect="dark" placement="top">
            <el-button
              icon="el-icon-star-on"
              type="primary"
              size="mini"/>
          </el-tooltip>
        </el-button-group>
      </el-row>
      <el-row type="flex" justify="space-around" class="boxWrap">
        <el-col :span= "4">
          <div class="txtBox col-b">
            <span>{{ totalData.collections }}</span>
            <span>collections</span>
          </div>
        </el-col>
        <el-col :span= "4">
          <div class="txtBox col-g">
            <span>{{ totalData.dataSize }}</span>
            <span>dataSize(MB)</span>
          </div>
        </el-col>
        <el-col :span= "4">
          <div class="txtBox col-y">
            <span>{{ totalData.connections }}</span>
            <span>connections</span>
          </div>
        </el-col>
        <el-col :span= "4">
          <div class="txtBox col-r">
            <span>{{ totalData.resident }}</span>
            <span>MEM(MB)</span>
          </div>
        </el-col>
        <el-col :span= "4">
          <div class="txtBox col-bl">
            <span>{{ totalData.uptime }}</span>
            <span>uptime(秒)</span>
          </div>
        </el-col>
      </el-row>
      <!-- 网络流量 -->
      <el-row class="boxWrap">
        <NetworkFlow :chart-data="NetworkFlowChartData"/>
      </el-row>
      <!-- 命令执行情况 -->
      <el-row class="boxWrap">
        <Command :chart-data="CommandChartData"/>
      </el-row>
      <!-- 全局锁信息 -->
      <el-row class="boxWrap">
        <Lock :chart-data="LockChartData"/>
      </el-row>
    </div>
  </div>
</template>

<script>
import { db_monitor_status } from '@/api/project/dataBase/db_monitor_noSql'
import NetworkFlow from './charts/networkFlow'
import Lock from './charts/lock'
import Command from './charts/command'
export default {
  name: 'MonitorMongoDB',
  components: {
    NetworkFlow,
    Lock,
    Command
  },
  props: {
    dataSourceId: {
      type: [Number, String],
      default: '2'
    }
  },
  data() {
    return {
      timeTicket: 0,
      showFlag: true,
      totalData: {
        collections: 0,
        dataSize: 0,
        connections: 0,
        resident: 0,
        uptime: 0
      },
      NetworkFlowChartData: {
        xData: [],
        series: [
          {
            name: 'Bytes_in',
            type: 'line',
            data: []
          },
          {
            name: 'Bytes_out',
            type: 'line',
            data: []
          }]
      },
      CommandChartData: {
        xData: [],
        series: [
          {
            name: 'insert',
            type: 'line',
            data: []
          },
          {
            name: 'query',
            type: 'line',
            data: []
          },
          {
            name: 'update',
            type: 'line',
            data: []
          },
          {
            name: 'delete',
            type: 'line',
            data: []
          }]
      },
      LockChartData: {
        xData: [],
        series: [
          {
            name: 'globalLock_total',
            type: 'line',
            data: []
          },
          {
            name: 'globalLock_readers',
            type: 'line',
            data: []
          },
          {
            name: 'globalLock_writers',
            type: 'line',
            data: []
          }]
      }
    }
  },
  computed: {
    freshTime() {
      return '刷新时间' + this.timeTicket / 1000 + '秒'
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    init() {
      this.NetworkFlowChartData = {
        xData: [],
        series: [
          {
            name: 'Bytes_in',
            type: 'line',
            data: []
          },
          {
            name: 'Bytes_out',
            type: 'line',
            data: []
          }]
      }
      this.CommandChartData = {
        xData: [],
        series: [
          {
            name: 'insert',
            type: 'line',
            data: []
          },
          {
            name: 'query',
            type: 'line',
            data: []
          },
          {
            name: 'update',
            type: 'line',
            data: []
          },
          {
            name: 'delete',
            type: 'line',
            data: []
          }]
      }
      this.LockChartData = {
        xData: [],
        series: [
          {
            name: 'globalLock_total',
            type: 'line',
            data: []
          },
          {
            name: 'globalLock_readers',
            type: 'line',
            data: []
          },
          {
            name: 'globalLock_writers',
            type: 'line',
            data: []
          }]
      }
    },
    getList() {
      // 初始化
      this.init()
      db_monitor_status(this.dataSourceId).then((res) => {
        const obj = res.data.data.reverse()
        var timeF = new Date(obj[0].record_date)
        var timeB = new Date(obj[1].record_date)
        this.timeTicket = timeB - timeF
        // 检测数据
        console.log(obj)
        this.totalData = {
          collections: obj[0].collections,
          dataSize: Math.round(obj[0].dataSize / 1024 / 1024 * 100) / 100,
          connections: obj[0].connections,
          resident: obj[0].resident,
          uptime: obj[0].uptime
        }
        // echat1设置
        this.NetworkFlowChartData.xData = obj.map(item => {
          const idx = item.record_date.indexOf(' ')
          return item.record_date.substr(idx)
        })
        this.NetworkFlowChartData.xData.shift()
        obj.forEach((item, index) => {
          if (index === 0) {
            return
          } else {
            this.NetworkFlowChartData.series[0].data.push(Math.round(parseInt(item.bytesIn - obj[index - 1].bytesIn) / 1024))
            this.NetworkFlowChartData.series[1].data.push(Math.round(parseInt(item.bytesOut - obj[index - 1].bytesOut) / 1024))
          }
        })
        // echat2设置
        this.LockChartData.xData = obj.map(item => {
          const idx = item.record_date.indexOf(' ')
          return item.record_date.substr(idx)
        })
        this.LockChartData.xData.shift()
        obj.forEach((item, index) => {
          if (index === 0) {
            return
          } else {
            this.LockChartData.series[0].data.push(Math.abs(item.insert - obj[index - 1].insert))
            this.LockChartData.series[1].data.push(Math.abs(item.query - obj[index - 1].query))
            this.LockChartData.series[2].data.push(Math.abs(item.update - obj[index - 1].update))
          }
        })
        // echat2设置
        this.CommandChartData.xData = obj.map(item => {
          const idx = item.record_date.indexOf(' ')
          return item.record_date.substr(idx)
        })
        this.CommandChartData.xData.shift()
        obj.forEach((item, index) => {
          if (index === 0) {
            return
          } else {
            this.CommandChartData.series[0].data.push(Math.abs(item.insert - obj[index - 1].insert))
            this.CommandChartData.series[1].data.push(Math.abs(item.query - obj[index - 1].query))
            this.CommandChartData.series[2].data.push(Math.abs(item.update - obj[index - 1].update))
            this.CommandChartData.series[3].data.push(Math.abs(item.delete - obj[index - 1].delete))
          }
        })
        // echat3设置
        this.CommandChartData.xData = obj.map(item => {
          const idx = item.record_date.indexOf(' ')
          return item.record_date.substr(idx)
        })
        this.CommandChartData.xData.shift()
        obj.forEach((item, index) => {
          if (index === 0) {
            return
          } else {
            this.CommandChartData.series[0].data.push(item.globalLock_total)
            this.CommandChartData.series[1].data.push(item.globalLock_readers)
            this.CommandChartData.series[2].data.push(item.globalLock_writers)
          }
        })
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.boxWrap {
  padding: 10px;
  border: 1px solid #e3e3e3;
  margin-bottom: 15px;
}
.wrapTwo {
  width: calc(50% - 8px);
}
.toolPanel {
  margin-bottom: 10px;
}
.txtBox {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: 70px;
}
.col-b {
  background-color: #00c0ef;
}
.col-g {
  background-color: #00a65a;
}
.col-y {
  background-color: #f39c12;
}
.col-r {
  background-color: #dd4b39;
}
.col-bl {
  background-color: #3c8dbc;
}
</style>
<style>
.el-table--medium td,
.el-table--medium th {
  padding: 3px 0 !important;
}
</style>
