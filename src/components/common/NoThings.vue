<template>
  <div class="picWrap">
    <p :class="[ type ? 'pic-' + type : '' ]" class="nothing-text">
      <slot></slot>
    </p>
    <template v-if="!$slots.default">暂无数据</template>
  </div>
</template>
<script>
export default {
  props: {
    type: {
      type: String,
      default: 'nofloder'
    }
  },
  data() {
    return {
    }
  },
  computed: {

  },
  mounted() {

  },
  methods: {

  }
}

</script>
<style scoped>
  .picWrap{
      width: 100%;
  }
  /* 没数据 */
  .pic-nodata {
      margin:100px auto 0;
      width: 150px;
      height: 150px;
      background: url("../../assets/img/nodata.png") no-repeat;
      background-size: contain;
  }
  /* 没文件 */
  .pic-nofloder{
    margin:100px auto 0;
    width: 250px;
    height: 200px;
    background: url("../../assets/img/no-file.png") no-repeat center;
  }
  .nothing-text {
    text-align: center;
    padding-top: 180px;
    color: #424e67;
    font-size: 13px;
  }
</style>
