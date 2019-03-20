<template>
  <div class="header-box">
    <div class="header-nav">
      <div class="header-logo">
        <a href="#">
          <span class="logo-icon"/>
        </a>
      </div>
      <div
        class="header-service"
        @mouseenter="productShow = true"
        @mouseleave="productShow = false">
        <div class="cloud-product">
          <span>云产品</span>
          <i class="user-icon fa fa-caret-down"/>
        </div>
        <transition name="fade">
          <div v-show="productShow" class="product-list">
            <div class="item-column">
              <ul class="item-list">
                <li class="item-list-title">计算</li>
                <li><a href="#">云服务器</a></li>
                <li><a href="#">弹性伸缩</a></li>
                <li><a href="#">容器服务</a></li>
                <li><a href="#">容器实例服务</a></li>
                <li><a href="#">无服务器云函数</a></li>
                <li><a href="#">批量计算</a></li>
              </ul>
              <ul class="item-list">
                <li class="item-list-title">互联网中间件</li>
                <li><a href="#">消息队列 Ckafka</a></li>
                <li><a href="#">消息队列 CMQ</a></li>
                <li><a href="#">API 网关</a></li>
              </ul>
              <ul class="item-list">
                <li class="item-list-title">CDN与加速</li>
                <li><a href="#">CDN</a></li>
                <li><a href="#">海外加速</a></li>
                <li><a href="#">动态加速</a></li>
              </ul>
              <ul class="item-list">
                <li class="item-list-title">其他服务</li>
                <li><a href="#">云服务账号</a></li>
                <li><a href="#">云市场</a></li>
              </ul>
            </div>
            <div class="item-column">
              <ul class="item-list">
                <li class="item-list-title">存储</li>
                <li><a href="#">对象存储</a></li>
                <li><a href="#">文件存储</a></li>
                <li><a href="#">归档存储</a></li>
                <li><a href="#">云数据迁移</a></li>
                <li><a href="#">日志服务</a></li>
              </ul>
              <ul class="item-list">
                <li class="item-list-title">数据库</li>
                <li><a href="#">关系型数据库</a></li>
                <li><a href="#">云数据库 Redis</a></li>
                <li><a href="#">云数据库 CynosDB</a></li>
                <li><a href="#">云数据库 MongoDB</a></li>
                <li><a href="#">数据传输服务 DTS</a></li>
                <li><a href="#">分布式数据库</a></li>
                <li><a href="#">时序数据库 CTSDB</a></li>
                <li><a href="#">HTAP 数据库</a></li>
                <li><a href="#">云数据库 HBase</a></li>
                <li><a href="#">云数据库 Memcached</a></li>
              </ul>
            </div>
            <div class="item-column">
              <ul class="item-list">
                <li class="item-list-title">计算</li>
                <li><a href="#">云服务器</a></li>
                <li><a href="#">弹性伸缩</a></li>
                <li><a href="#">容器服务</a></li>
                <li><a href="#">容器实例服务</a></li>
                <li><a href="#">无服务器云函数</a></li>
                <li><a href="#">批量计算</a></li>
              </ul>
              <ul class="item-list">
                <li class="item-list-title">计算</li>
                <li><a href="#">云服务器</a></li>
                <li><a href="#">弹性伸缩</a></li>
                <li><a href="#">容器服务</a></li>
                <li><a href="#">容器实例服务</a></li>
                <li><a href="#">无服务器云函数</a></li>
                <li><a href="#">批量计算</a></li>
              </ul>
            </div>
          </div>
        </transition>
      </div>
      <div class="header-right">
        <div
          class="header-user"
          @mouseenter="isShow = true"
          @mouseleave="isShow = false">
          <div class="user-info">
            <span>admin</span>
            <i class="cloud-product-icon fa fa-caret-down"/>
          </div>
          <transition name="fade">
            <ul v-show="isShow" class="user-panel">
              <li>
                <label>账号:</label><span>admin</span>
              </li>
              <li>
                <label>姓名:</label><span>系统管理员</span>
              </li>
              <li>
                <label>工号:</label><span>1</span>
              </li>
              <li>
                <label>电话:</label><span>15877652413</span>
              </li>
              <li>
                <label>邮箱:</label><span>admin@163.com</span>
              </li>
              <li class="logout" @click="logout">安全退出</li>
            </ul>
          </transition>
        </div>
        <el-tooltip :content="$t('navbar.screenfull')" effect="light" placement="bottom">
          <screenfull class="screenfull right-menu-item"/>
        </el-tooltip>

        <el-tooltip :content="$t('navbar.size')" effect="light" placement="bottom">
          <size-select class="international right-menu-item"/>
        </el-tooltip>

        <lang-select class="international right-menu-item"/>

        <el-tooltip :content="$t('navbar.theme')" effect="light" placement="bottom">
          <theme-picker class="theme-switch right-menu-item"/>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import LangSelect from '@/components/LangSelect'
import ThemePicker from '@/components/ThemePicker'
export default {
  name: 'HeaderPanel',
  components: {
    Screenfull,
    SizeSelect,
    LangSelect,
    ThemePicker
  },
  data() {
    return {
      isShow: false,
      productShow: false
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload() // In order to re-instantiate the vue-router object to avoid bugs
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .header-box {
    .common-color {
      transition: color ease .2s;
      &:hover {
        color: #3d91ff;
      }
    }
    .header-nav {
      height: 50px;
      background-color: #262626;
      box-sizing: border-box;
      width: 100%;
      > div {
        float: left;
      }
      .header-logo {
        width: 65px;
        a {
          display: inline-block;
          height: 32px;
          padding: 0 15px;
          margin: 9px 0;
          border-right: 1px solid #000;
          .logo-icon {
            width: 32px;
            height: 32px;
            display: inline-block;
            background: url(../../assets/img/logo-icon.png) no-repeat 0 0 / cover;
          }
        }
      }
      .header-service {
        margin: 0 0 0 15px;
        cursor: pointer;
        color: #bbb;
        line-height: 50px;
        height: 50px;
        @extend .common-color;
        .cloud-product {
          font-size: 14px;
          display: inline-block;
          .cloud-product-icon {
            margin: 0 5px;
          }
        }
        .product-list {
          background-color: #191919;
          position: fixed;
          z-index: 9999;
          padding: 25px 35px;
          left: 45px;
          cursor: default;
          .item-column {
            float: left;
            padding-right: 60px;
            &:last-child {
              padding-right: 0;
            }
            .item-list {
              padding-top: 25px;
              &:first-child {
                padding-top: 0;
              }
              > li {
                font-size: 12px;
                line-height: 24px;
                color: #a6a6a6;
                a {
                  transition: color ease .2s;
                  &:hover {
                    color: #3d91ff;
                  }
                }
              }
              .item-list-title {
                font-size: 14px;
                color: #fff;
                cursor: default;
                padding-bottom: 5px
              }
            }
          }
        }
      }
      .header-right {
        float: right;
        display: flex;
        align-items: center;
        height: 100%;
        padding-right: 20px;
        .header-user {
          font-size: 14px;
          color: #bbb;
          margin-right: 30px;
          cursor: pointer;
          position: relative;
          line-height: 50px;
          @extend .common-color;
          .user-panel {
            width: 200px;
            background-color: #191919;
            position: absolute;
            z-index: 1000;
            top: 50px;
            left: -30px;
            cursor: default;
            font-size: 12px;
            padding: 15px 0 0;
            li {
              line-height: 30px;
              padding: 0 15px;
              color: #bbb;
              > label {
                letter-spacing: 1px;
                font-weight: normal;
              }
              > span {
                padding-left: 10px;
              }
            }
            .logout {
              margin: 10px 0 0;
              line-height: 50px;
              cursor: pointer;
              border-top: 1px solid #515151;
              @extend .common-color;
            }
          }
        }
        &:focus {
          outline: none;
        }
        .right-menu-item {
          display: inline-block;
          margin: 0 8px;
        }
        .screenfull {
          height: 20px;
          vertical-align: -10px;
        }
        .international {
          vertical-align: 6px;
        }
        .theme-switch {
          vertical-align: 7px;
        }
        .avatar-container {
          height: 50px;
          margin-right: 30px;
          .avatar-wrapper {
            cursor: pointer;
            margin-top: 12px;
            position: relative;
            .user-avatar {
              width: 40px;
              height: 40px;
              border-radius: 10px;
              font-size: 27px;
              color: #ddd;
            }
          }
        }
      }
    }
  }
  .fade-enter-active, .fade-leave-active {
    -webkit-transition: opacity 0.2s;
    -moz-transition: opacity 0.2s;
    -o-transition: opacity 0.2s;
    transition: opacity 0.2s;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>

<style lang="scss">
  .right-menu-item {
    .screenfull-svg, .svg-icon {
      fill: #ddd !important;
    }
  }
</style>
