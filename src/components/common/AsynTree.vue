<template>
  <ul class="tree">
    <li v-for="item in treeData" :key="item.id">
      <p :class="[ {'currentActive': currentItem.id == item.id }, { 'openActive': item.open } ]" @click="$emit('item-click',item)">
        <span :class="item.orgIcon" class="iconfont"/>
        <span v-if="(item.open)&&(item.isLeafDir=='0')" class="icon-close fa fa-minus-square-o"/>
        <span v-if="(!item.open)&&(item.isLeafDir=='0')" class="icon-open fa fa-plus-square-o"/>
        <span class="foldPic"/>
        <span class="text">{{ item.name }}</span>
        <slot :name="item.id"/>
      </p>
      <tree v-show="item.open" :tree-data="item.children" :current-item="currentItem" @item-click="itemClick"/>
    </li>
  </ul>
</template>
<script>
export default {
  name: 'Tree',
  props: ['treeData', 'currentItem'],
  data() {
    return {
      sortCurrent: 0,
      item: false,
      currentItemId: ''
    }
  },
  watch: {

  },
  mounted() {

  },
  methods: {
    itemClick(item) {
      this.$emit('item-click', item)
    },
    selectitem(item) {
      if (this.config.hasCheckbox) {
        item.isChecked = !item.isChecked
        if (item.isChecked) {
          this.selectedMap[item.id] = item.id
        } else {
          this.selectedMap[item.id] = null
        }
      } else {
        for (var i in this.items) {
          var r = this.items[i]
          r.isChecked = false
        }
        item.isChecked = true
        this.$emit('selected', item)
      }
    }
  }
}

</script>
<style scoped>
.currentActive {
  /* border: 1px solid #fff; */
  /* border-width: 1px 0; */
  background: #e5f0fb;
  border-color: #bbd4ef #fff;
}

.tree {
  display: block;
  width: 100%;
  overflow-x: hidden;
  font-size: 13px;
  color: #333;
}

.tree {
  position: relative;
}

.tree li {
  display: block;
  width: calc(99%);
  padding-left: 20px;
  line-height: 28px;
}

.tree li p {
  font-family: iconfont;
  position: relative;
  display: block;
  cursor: pointer;
}

.foldPic {
  position: absolute;
  top: 5px;
  display: inline-block;
  width: 20px;
  height: 16px;
  background: url("../../assets/img/icon.png") no-repeat 0 0;
  margin-right: 5px;
  /* background-size: contain; */
}

.text {
  margin-left: 27px;
}

.icon-open,
.icon-close {
  display: inline-block;
  width: 0;
  line-height: 27px;
}

.fa-minus-square-o:before {
  position: absolute;
  width: 0;
  left: -20px;
  top: 0;
  font-size: 20px;
}

.fa-plus-square-o:before {
  position: absolute;
  width: 0;
  left: -20px;
  top: 0;
  font-size: 20px;
}
</style>
