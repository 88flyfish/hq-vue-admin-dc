<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null,
      sidebarElm: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        // this.setOptions(val)
        setTimeout(this.setOptions(val), 100)
      }
    }
  },
  mounted() {
    this.initChart()
    if (this.autoResize) {
      this.__resizeHandler = debounce(() => {
        if (this.chart) {
          this.chart.resize()
        }
      }, 100)
      window.addEventListener('resize', this.__resizeHandler)
    }

    // 监听侧边栏的变化
    this.sidebarElm = document.getElementsByClassName('sidebar-container')[0]
    this.sidebarElm && this.sidebarElm.addEventListener('transitionend', this.sidebarResizeHandler)
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    if (this.autoResize) {
      window.removeEventListener('resize', this.__resizeHandler)
    }

    this.sidebarElm && this.sidebarElm.removeEventListener('transitionend', this.sidebarResizeHandler)

    this.chart.dispose()
    this.chart = null
  },
  methods: {
    sidebarResizeHandler(e) {
      if (e.propertyName === 'width') {
        this.__resizeHandler()
      }
    },
    setOptions(data) {
      this.chart.setOption({
        title: { text: 'sent or received kbps', subtext: '' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['Bytes_received', 'Bytes_sent'] },
        toolbox: {
          show: !0,
          feature: {
            mark: { show: !1 },
            dataView: { show: !0, readOnly: !0 },
            magicType: { show: !0, type: ['line', 'bar'] },
            restore: { show: !0 },
            saveAsImage: { show: !0 }
          }
        },
        calculable: !0,
        xAxis: [
          {
            type: 'category',
            data: data.xData
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: data.series
      })
    },
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData.xData, this.chartData.series)
    }
  }
}
</script>
