<template>
  <div :class="classObj" class="app-wrapper">
    <header-panel v-if="hasTopPanel"/>
    <div :class="{topPanelWrap:hasTopPanel}" class="wrap">
      <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"/>
      <sidebar class="sidebar-container"/>
      <div class="main-container">
        <navbar/>
        <tags-view/>
        <app-main/>
      </div>
    </div>
  </div>

</template>

<script>
import { Navbar, Sidebar, AppMain, TagsView } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import HeaderPanel from '../../components/HeaderPanel'

export default {
  name: 'Layout',
  components: {
    HeaderPanel,
    Navbar,
    Sidebar,
    AppMain,
    TagsView
  },
  mixins: [ResizeMixin],
  data() {
    return {
      // 顶部导航栏显示控制
      hasTopPanel: true
    }
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('closeSideBar', { withoutAnimation: false })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "~@/styles/mixin.scss";
.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  & .wrap {
    position: relative;
    height: 100%;
  }
  & .topPanelWrap {
    height: calc(100% - 50px) !important;
  }
  & .topPanel {
    height: 50px;
    width: 100%;
    background-color: black;
  }
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}
</style>
