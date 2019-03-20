<template>
  <div style="padding:15px; overflow: auto; height: 100%;">
    <div v-if="showFlag" >
      <el-row class= "toolPanel">
        <el-button-group>
          <el-button
            icon="el-icon-tickets"
            type="primary"
            size="mini"
            @click="changeFlag">详细状态参数
          </el-button>
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
            <span>{{ totalData.Max_used_connections }}</span>
            <span>最大连接数</span>
          </div>
        </el-col>
        <el-col :span= "4">
          <div class="txtBox col-g">
            <span>{{ totalData.Uptime }}</span>
            <span>Uptime(day)</span>
          </div>
        </el-col>
        <el-col :span= "4">
          <div class="txtBox col-y">
            <span>{{ totalData.Threads_connected }}</span>
            <span>当前连接数</span>
          </div>
        </el-col>
        <el-col :span= "4">
          <div class="txtBox col-r">
            <span>{{ totalData.Threads_running }}</span>
            <span>running</span>
          </div>
        </el-col>
        <el-col :span= "4">
          <div class="txtBox col-bl">
            <span>{{ totalData.Open_tables }}</span>
            <span>Open_tables</span>
          </div>
        </el-col>
      </el-row>
      <!-- kbps monitor -->
      <el-row class="boxWrap">
        <kbps-chart :chart-data="kbpsChartData"/>
      </el-row>
      <!-- QPS monitor -->
      <el-row class="boxWrap">
        <qps-chart :chart-data="qpsChartData"/>
      </el-row>
      <!-- connect monitor -->
      <el-row class="boxWrap">
        <connect-chart :chart-data="connectChartData"/>
      </el-row>
      <el-row type="flex" justify="space-between">
        <!-- hardwareRate -->
        <el-col class="boxWrap wrapTwo">
          <div >
            <hardwareRate-chart :chart-data="hardwareRateChartData"/>
          </div>
        </el-col>
        <!-- memoryRate -->
        <el-col class="boxWrap wrapTwo">
          <div >
            <memoryRate-chart :chart-data="memoryRateChartData"/>
          </div>
        </el-col>
      </el-row>
    </div>
    <div v-if="!showFlag" >
      <el-row class= "toolPanel">
        <el-button-group>
          <el-button
            icon="el-icon-refresh"
            type="primary"
            size="mini"
            @click="getList">刷新
          </el-button>
          <el-button
            icon="el-icon-back"
            type="primary"
            size="mini"
            @click="changeFlag">返回
          </el-button>
        </el-button-group>
      </el-row>
      <el-row>
        <el-table
          ref="multipleTable"
          :data="detailList"
          border
          height="500"
          stripe
          style="width: 100%">
          <el-table-column
            type="index"
            width="46"/>
          <el-table-column
            type="selection"
            width="40"/>
          <el-table-column
            label="参数"
            prop="Variable_name">
            <template slot-scope="scope">{{ scope.row.Variable_name }}</template>
          </el-table-column>
          <el-table-column
            prop="Value"
            label="值">
            <template slot-scope="scope">{{ scope.row.Value }}</template>
          </el-table-column>
          <el-table-column
            prop="descript"
            label="参数说明"/>
        </el-table>
      </el-row>
    </div>
  </div>
</template>

<script>
import { db_monitor_status, db_monitor_itemValue } from '@/api/project/dataBase/db_monitor_sql'
import connectChart from './charts/connect_chart'
import hardwareRateChart from './charts/hardwareRate_chart'
import kbpsChart from './charts/kbps_chart'
import memoryRateChart from './charts/memoryRate_chart'
import qpsChart from './charts/qps_chart'
export default {
  name: 'MonitorMySQL',
  components: {
    connectChart,
    hardwareRateChart,
    kbpsChart,
    memoryRateChart,
    qpsChart
  },
  props: {
    dataSourceId: {
      type: [Number, String],
      default: '1'
    }
  },
  data() {
    return {
      timeTicket: 0,
      intervalTimer: null,
      showFlag: true,
      totalData: {
        Max_used_connections: 0,
        Uptime: 0,
        Threads_connected: 0,
        Threads_running: 0,
        Open_tables: 0
      },
      kbpsChartData: {
        xData: [],
        series: [
          {
            name: 'Bytes_received',
            type: 'line',
            data: []
          },
          {
            name: 'Bytes_sent',
            type: 'line',
            data: []
          }]
      },
      qpsChartData: {
        xData: [],
        series: [
          {
            name: 'begin',
            type: 'line',
            data: []
          },
          {
            name: 'commit',
            type: 'line',
            data: []
          },
          {
            name: 'delete',
            type: 'line',
            data: []
          },
          {
            name: 'insert',
            type: 'line',
            data: []
          },
          {
            name: 'rollback',
            type: 'line',
            data: []
          },
          {
            name: 'select',
            type: 'line',
            data: []
          },
          {
            name: 'update',
            type: 'line',
            data: []
          }]
      },
      connectChartData: {
        xData: [],
        series: [
          {
            name: 'Threads_connected',
            type: 'line',
            data: []
          }]
      },
      hardwareRateChartData: [
        { value: 50, name: '已使用' },
        { value: 50, name: '未使用' }
      ],
      memoryRateChartData: 0,
      // 详细列表信息
      detailList: []
    }
  },
  computed: {
    freshTime() {
      return '刷新时间' + this.timeTicket / 1000 + '秒'
    }
  },
  watch: {
    timeTicket() {
      clearInterval(this.intervalTimer)
      this.intervalTimer = setInterval(() => {
        this.getList()
      }, this.timeTicket)
    }
  },
  mounted() {
    this.getList()
  },
  beforeDestroy() {
    clearInterval(this.intervalTimer)
  },
  methods: {
    init() {
      this.kbpsChartData = {
        xData: [],
        series: [
          {
            name: 'Bytes_received',
            type: 'line',
            data: []
          },
          {
            name: 'Bytes_sent',
            type: 'line',
            data: []
          }]
      }
      this.qpsChartData = {
        xData: [],
        series: [
          {
            name: 'begin',
            type: 'line',
            data: []
          },
          {
            name: 'commit',
            type: 'line',
            data: []
          },
          {
            name: 'delete',
            type: 'line',
            data: []
          },
          {
            name: 'insert',
            type: 'line',
            data: []
          },
          {
            name: 'rollback',
            type: 'line',
            data: []
          },
          {
            name: 'select',
            type: 'line',
            data: []
          },
          {
            name: 'update',
            type: 'line',
            data: []
          }]
      }
      this.connectChartData = {
        xData: [],
        series: [
          {
            name: 'Threads_connected',
            type: 'line',
            data: []
          }]
      }
    },
    changeFlag() {
      this.showFlag = !this.showFlag
      this.getDetailList()
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
        this.totalData = {
          Max_used_connections: obj[0].Max_used_connections,
          Uptime: parseInt(obj[0].Uptime / 60 / 60 / 24),
          Threads_connected: obj[0].Threads_connected,
          Threads_running: obj[0].Threads_running,
          Open_tables: obj[0].Open_tables
        }
        // echat1设置
        this.kbpsChartData.xData = obj.map(item => {
          const idx = item.record_date.indexOf(' ')
          return item.record_date.substr(idx)
        })
        this.kbpsChartData.xData.shift()
        obj.forEach((item, index) => {
          if (index === 0) {
            return
          } else {
            this.kbpsChartData.series[0].data.push(Math.abs(parseInt(item.Bytes_received - obj[index - 1].Bytes_received)) * 8 / this.timeTicket)
            this.kbpsChartData.series[1].data.push(Math.abs(parseInt(item.Bytes_sent - obj[index - 1].Bytes_sent)) * 8 / this.timeTicket)
          }
        })
        // echat2设置
        this.qpsChartData.xData = obj.map(item => {
          const idx = item.record_date.indexOf(' ')
          return item.record_date.substr(idx)
        })
        this.qpsChartData.xData.shift()
        obj.forEach((item, index) => {
          if (index === 0) {
            return
          } else {
            this.qpsChartData.series[0].data.push(Math.abs(parseInt(item.Com_begin) - parseInt(obj[index - 1].Com_begin)) / this.timeTicket * 1000)
            this.qpsChartData.series[1].data.push(Math.abs(parseInt(item.Com_commit) - parseInt(obj[index - 1].Com_commit)) / this.timeTicket * 1000)
            this.qpsChartData.series[2].data.push(Math.abs(parseInt(item.Com_delete) - parseInt(obj[index - 1].Com_delete)) / this.timeTicket * 1000)
            this.qpsChartData.series[3].data.push(Math.abs(parseInt(item.Com_insert) - parseInt(obj[index - 1].Com_insert)) / this.timeTicket * 1000)
            this.qpsChartData.series[4].data.push(Math.abs(parseInt(item.Com_rollback) - parseInt(obj[index - 1].Com_rollback)) / this.timeTicket * 1000)
            this.qpsChartData.series[5].data.push(Math.abs(parseInt(item.Com_select) - parseInt(obj[index - 1].Com_select)) / this.timeTicket * 1000)
            this.qpsChartData.series[6].data.push(Math.abs(parseInt(item.Com_update) - parseInt(obj[index - 1].Com_update)) / this.timeTicket * 1000)
          }
        })
        // echat3设置
        this.connectChartData.xData = obj.map(item => {
          const idx = item.record_date.indexOf(' ')
          return item.record_date.substr(idx)
        })
        this.connectChartData.xData.shift()
        obj.forEach((item, index) => {
          if (index === 0) {
            return
          } else {
            this.connectChartData.series[0].data.push(parseInt(item.Threads_connected))
          }
        })
        // echat4设置
        this.hardwareRateChartData = [
          { value: obj[0].diskUsage, name: '已使用' },
          { value: (100 - obj[0].diskUsage), name: '未使用' }
        ]
        // echat5设置
        this.memoryRateChartData = parseInt((obj[0].memUsage).toFixed(2))
      })
    },
    getDetailList() {
      db_monitor_itemValue(this.dataSourceId).then((res) => {
        this.detailList = res.data.data.rows
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
