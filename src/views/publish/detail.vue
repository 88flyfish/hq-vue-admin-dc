<template>
  <div style="height: 100%;overflow: hidden;">
    <iframe id="mobsf" :src="api"/>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
export default {
  components: {

  },
  data() {
    return {
    }
  },
  computed: {
    api() {
      return location.origin + location.pathname +'#/servicedetails/';
    }
  },
  mounted() {
    var id = this.$route.params.id
    if (id) {
      Cookies.set('servicedetailsID', id)
    }
  },
  methods: {

  }
}
</script>

<style lang='scss'>
#mobsf {
  width: 100%;
  height: 100%;
}
</style>
