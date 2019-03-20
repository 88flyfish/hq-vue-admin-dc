<template>
  <div class="toggleBox">
    <div class="titleBox">
      <div>
        <slot name="top"/>
      </div>
      <div>
        <span :title="iconConfig.title" :class="iconConfig.icon" class="fontClass col1" @click.stop="iconConfig.func"/>
        <span class="fontClass fa fa-times col2" @click="deleteBox"/>
      </div>
    </div>
    <transition name="fade">
      <div v-if="isShow" class="contentBox">
        <slot name="bottom"/>
      </div>
    </transition>

  </div>
</template>

<script>

export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tableId: '',
      isShow: this.show,
      options: [{
        id: 'a',
        label: 'a',
        children: [{
          id: 'aa',
          label: 'aa'
        }, {
          id: 'ab',
          label: 'ab'
        }]
      }, {
        id: 'b',
        label: 'b'
      }, {
        id: 'c',
        label: 'c'
      }]
    }
  },
  computed: {
    iconConfig() {
      return {
        title: this.isShow ? '收起' : '展开',
        icon: this.isShow ? 'fa fa-chevron-up' : 'fa fa-chevron-down',
        func: this.toggleBox
      }
    }
  },
  watch: {
    show(val) {
      this.isShow = val
    }
  },
  mounted() {

  },
  methods: {
    toggleBox() {
      this.isShow = !this.isShow
    },
    deleteBox() {
      this.$emit('deleteBox')
    }
  }
}

</script>

<style scoped lang='scss'>
.toggleBox {
  box-sizing: border-box;
  width: calc(100% - 50px);
  margin: 10px auto;
}

.titleBox {
  box-sizing: border-box;
  width: 100%;
  height: 45px;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff !important;
  background: #307ecc;
  border-color: #307ecc;
}

.fontClass {
  cursor: pointer;
  padding: 6px 3px;
  font-size: 20px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  &:hover {
    cursor: pointer;
    transform: scale(1.2);
  }
}

.contentBox {
  width: 100%;
  min-height: 50px;
  box-sizing: border-box;
  padding: 5px;
  border: 1px solid #307ecc;
}
</style>
