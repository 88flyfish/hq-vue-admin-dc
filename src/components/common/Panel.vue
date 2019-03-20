<template>
  <div class="panel">
    <div class="panel-bar">
      <div class="search-bar">
        <slot name="searchBar"></slot>
      </div>
      <div class="action-bar">
        <slot name="actionBar"></slot>
      </div>
    </div>
    <div class="panel-main" style="padding:20px;">
      <div class="panel-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>


<script>
  export default {
    data() {
      return {}
    },
    methods: {},
    components: {}
  }
</script>

<style scoped>

  .panel {
    width: 100%;
    height: 100%;
  }

  .panel-bar {
    width: 100%;
    padding: 10px 20px;
    /*overflow: hidden;*/
    background: #eff1f5;
    border-bottom: 1px solid #ddd;
    height: 50px;
    line-height: 29px;
  }

  .panel-bar input {
    height: 27px;
    border-radius: 4px;
  }

  .search-bar {
    float: left;
  }

  .action-bar {
    float: right;
  }

  .panel-main {
    width: 100%;
    height: calc(100% - 50px);
  }

  .panel-content {
    overflow:auto;
    vertical-align: top;
    background-color: #ffffff;
    box-shadow: 0px 1px 2px 1px #ccc;
    border-radius: 6px;
    padding: 10px;
    height: 100%;
    min-height: calc(100% - 150px);
  }

  .panel-bar button {
    height: 27px;
    padding: 0 10px;
    margin: 0 6px;
    background: #20a0ff;
    color: #fff;
    border-radius: 4px;
    letter-spacing: 1px;
  }

  .panel-bar button:hover {
    opacity: .75;
    filter: Alpha(opacity=75);
    -webkit-transition: opacity .5s;
    -moz-transition: opacity .5s;
    -ms-transition: opacity .5s;
    -o-transition: opacity .5s;
    transition: opacity .5s;
  }
</style>

