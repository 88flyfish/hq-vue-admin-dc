<template>
  <div>
    <textarea ref="mycode" v-model="code" class="codesql"/>
  </div>
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/neo.css'
import 'codemirror/theme/idea.css'
import 'codemirror/mode/sql/sql.js'

import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/show-hint.css'
// import './sql-hint.css'
import '@/utils/jquery-ui/jquery-ui.min.css'
import '@/utils/jquery-ui/jquery-ui.min.js'
export default {
  name: 'CodeMirror',
  props: {
    val: ''
  },
  data() {
    return {
      code: '',
      editor: null,
      dicoBase: [
        { className: 'sql', text: 'SELECT' },
        { className: 'sql', text: 'FROM' },
        { className: 'sql', text: 'ADD' },
        { className: 'sql', text: 'ALTER' },
        { className: 'sql', text: 'TABLE' },
        { className: 'sql', text: 'SET' },
        { className: 'sql', text: 'WHERE' },
        { className: 'sql', text: 'INNER' },
        { className: 'sql', text: 'JOIN' },
        { className: 'sql', text: 'UNION' },
        { className: 'sql', text: 'EXEC' },
        { className: 'sql', text: 'INSERT' },
        { className: 'sql', text: 'INTO' },
        { className: 'sql', text: 'VALUES' },
        { className: 'sql', text: 'UPDATE' },
        { className: 'sql', text: 'DELETE' },
        { className: 'sql', text: 'GROUP' },
        { className: 'sql', text: 'BY' },
        { className: 'sql', text: 'HAVING' },
        { className: 'sql', text: 'IS' },
        { className: 'sql', text: 'DISTINCT' },
        { className: 'sql', text: 'OUTER' },
        { className: 'sql', text: 'TOP' },
        { className: 'sql', text: 'EXISTS' },
        { className: 'sql', text: 'WHEN' },
        { className: 'sql', text: 'CASE' },
        { className: 'sql', text: 'CAST' },
        { className: 'sql', text: 'IN' },
        { className: 'sql', text: 'NULL' },
        { className: 'table', text: 'te_cash_exchange_new' },
        { className: 'table', text: 'ParamsAtos' },
        { className: 'table', text: 'te_client_transfers' },
        { className: 'column', text: 'status_cash' },
        { className: 'column', text: 'datet' },
        { className: 'column', text: 'ammount' },
        { className: 'column', text: 'cash_exchange_id_start' },
        { className: 'column', text: 'cash_exchange_id_end' },
        { className: 'pf', text: 'AddParamAtos' },
        { className: 'pf', text: 'verify_backoffice_user' },
        { className: 'pf', text: 'checkAllowOperation' },
        { className: 'pf', text: 'addMoneyIn_01' }
      ],
      addDico: []
    }
  },
  computed: {
    dico() {
      return this.dicoBase.concat(this.addDico)
    }
  },
  watch: {
    val(n, v) {
      this.editor.replaceSelection(n)
    }
  },
  mounted() {
    this.editor = CodeMirror.fromTextArea(this.$refs.mycode, {
      tabSize: 4,
      mode: 'text/x-mysql',
      theme: 'idea',
      lineNumbers: true,
      line: true,
      lineWrapping: true,
      hintOptions: {
        completeSingle: false,
        hint: this.hint
        // tables: this.tables
      },
      extraKeys: {
        'Ctrl-Space': editor => {
          editor.showHint()
        }
      }
    })
    this.editor.on('keypress', editor => {
      editor.showHint()
    })
    this.editor.setSize('100%', '200px')
  },
  methods: {
    getEditors() {
      return this.editor.getValue()
    },
    setEditors(code) {
      console.log(this.editor, 22)
      return this.editor.setValue(code)
    },
    suggest(searchString) {
      let token = searchString
      if (searchString.startsWith('.')) {
        token = searchString.substring(1)
      } else {
        token = searchString.toLowerCase()
      }
      const resu = []
      const N = this.dico.length

      for (let i = 0; i < N; i++) {
        const keyword = this.dico[i].text.toLowerCase()
        let suggestion = null
        if (keyword.startsWith(token)) {
          suggestion = Object.assign({ score: N + (N - i) }, this.dico[i])
        } else if (keyword.includes(token)) {
          suggestion = Object.assign({ score: N - i }, this.dico[i])
        }
        if (suggestion) resu.push(suggestion)
      }

      if (searchString.startsWith('.')) {
        resu.forEach(s => {
          if (s.className == 'column') {
            s.score += N
          } else if (s.className == 'sql') s.score -= N
          return s
        })
      }

      return resu.sort((a, b) => b.score - a.score)
    },
    hint(editor) {
      const cur = editor.getCursor()
      const token = editor.getTokenAt(cur)
      const searchString = token.string
      return {
        list: this.suggest(searchString),
        from: CodeMirror.Pos(cur.line, token.start),
        to: CodeMirror.Pos(cur.line, token.end)
      }
    }
  }
}
</script>

<style>
.codesql {
  font-size: 11pt;
  height: 100px;
  font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono,
    DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif;
}
/*默认的层级在弹窗下不够*/
.idea {
  z-index: 999999;
}
.CodeMirror {
  border: 1px solid #dcdfe6;
}
</style>
