<template>
  <div
    v-show="show"
    :style="{left:(left+'px'),top:(top2+'px')}"
    class="mouseRightMenu">
    <ul class="menuList">
      <li
        v-for="(item,index) in config"
        :key="index"
        @click="item.callback()">
        <i :class="item.icon"/>
        &nbsp;
        <span>{{ item.title }}</span>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'MouseRightMenu',
  props: {
    config: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      left: 0,
      top2: 0,
      show: false,
      targetIndex: 0,
      targetLiIndex: 0
    }
  },
  computed: {
    top() {
      return 10 + 28 * this.targetLiIndex
    }
  },
  mounted() {
    const parentEle = this.$el.parentNode
    const _this = this
    _this.eventHandler(parentEle, 'contextmenu', function(e) {
      e = e || window.event
      e.preventDefault ? e.preventDefault() : (e.returnValue = false)
      if ($(e.target).closest('.menuList').length === 0) {
        _this.targetLiIndex = 0
        _this.getLiIndex(_this.getLi(e.target))
        _this.$emit('change', _this.targetLiIndex) 
        _this.left = e.clientX-10
        let windowH=window.innerHeight;
        let menuH=_this.config.length*28+10;
        if((menuH+e.clientY)<=windowH){
            _this.top2 = e.clientY-10
        }else{
            _this.top2 = e.clientY-menuH-10
        }
        _this.show = true
        //右键选中变色
        $('.tableName').removeClass('active');
        let selectedDom = $(e.srcElement);
        if(selectedDom[0].localName=='p'){
            selectedDom.addClass('active');
        }else{
            $(e.srcElement.parentElement).addClass('active');
        }
      }
    })
    _this.eventHandler(window, 'click', function(e) {
      _this.show = false
    })
    _this.eventHandler(_this.$el, 'mouseleave', function(e) {
        _this.show = false
    })
  },
  methods: {
    eventHandler(dom, type, fn) {
      if (typeof dom.addEventListener !== 'undefined') {
        dom.addEventListener(type, fn, false)
      } else if (typeof dom.attachEvent !== 'undefined') {
        dom.attachEvent('on' + type, fn)
      } else {
        dom['on' + type] = fn
      }
    },
    getLi(ele) { // 递归寻找祖先元素<li>
      if (ele.nodeName === 'LI'||ele.nodeName === 'DIV') {
        return ele
      } else {
        return this.getLi(ele.parentNode)
      }
    },
    getLiIndex(ele) {
      if (ele.previousSibling == null) {
        return
      } else {
        this.targetLiIndex++
        return this.getLiIndex(ele.previousSibling)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .mouseRightMenu {
    position: fixed;
    z-index: 1000000;
    min-width: 100px;
    background-color: #fff;

    .menuList {
      border-radius: 4px;
      padding: 5px 0;
      box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
      -webkit-box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
      -moz-box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
      -o-box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
      -ms-box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);

      li {
        height: 28px;
        line-height: 28px;
        font-size: 12px;
        padding: 0 10px;
        cursor: pointer;

        &:hover {
          background-color: #eee;
        }
      }
    }
  }
</style>
