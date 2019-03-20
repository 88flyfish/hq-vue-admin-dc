<template>
    <div class="jsonEditor">
      <textarea ref="mongo"></textarea>
    </div>
</template>

<script>
  import CodeMirror from 'codemirror'
  import 'codemirror/addon/lint/lint.css'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/theme/abcdef.css'

  require('script-loader!jsonlint')
  import 'codemirror/mode/javascript/javascript'
  import 'codemirror/addon/lint/lint'
  import 'codemirror/addon/lint/json-lint'
  export default {
    name: 'JsonEditor',
    data(){
      return {
        mongoEditor:null
      }
    },
    props:['value'],
    mounted(){
      this.mongoEditor = CodeMirror.fromTextArea(this.$refs.mongo, {
        tabSize: 2,
        lineNumbers: true,
        mode: 'application/json',
        gutters: ['CodeMirror-lint-markers'],
        theme: 'abcdef',
        lint: true
      })
      this.mongoEditor.setValue(JSON.stringify(this.value, null, 2));
      this.mongoEditor.on('change', cm => {
        this.$emit('changed', cm.getValue())
        this.$emit('input', cm.getValue())
      })
    },
    methods:{
      getValue() {
        return this.mongoEditor.getValue()
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
