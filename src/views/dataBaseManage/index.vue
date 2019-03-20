<template>
  <div class="database theme1">
    <div id="mainContent">
      <DataBaseTree
        :tree-loading="treeLoading"
        :source-options="sourceOptions"
        :tree-config="treeConfig"
        @chooseDatabase="chooseDatabase"
        @changeSourceId="changeSourceId"
        @changeTable="changeTable"
        @setTableByRightMouse="setTableByRightMouse"
        @tableRename="tableRename"
        @copyTable="copyTable"
        @deleteTable="deleteTable"
        @emptyTable="emptyTable"
        @tableInfo="tableInfo"
        @getMouseRightTableInfo="getMouseRightTableInfo"
        @addTable="addTable"
        @setView="setView"
        @monitor="monitor"/>
      <div id="centerContent">
        <div class="pageTabs">
          <ul class="pageSign">
            <p class="iconBox">
              <i class="el-icon-d-arrow-left"/>
            </p>
            <div class="tab-box">
              <div
                style="display:inline-block;"
                class="left-tab">
                <li
                  :class="{'active':activeTabIndex==-1}"
                  @click="activeTabIndex=-1"><img src="../../assets/imgs/home.png">
                  <span>运行及展示</span>
                </li>
                <MouseRightMenu :config="firstTabRightMenuConfig"/>
              </div>
              <div
                style="display:inline-block;"
                class="center-tab">
                <li
                  v-for="(tab,index) in allGridConfigs"
                  :key="index"
                  :class="{'active':activeTabIndex==index}"
                  @click.stop="toggleTab(index)">
                  <img
                    v-if="tab.type=='table'||tab.type=='tableInfo'||tab.type=='viewTable'"
                    src="../../assets/imgs/calendar.png">
                  <img
                    v-else
                    src="../../assets/imgs/config.png">
                  <span v-if="tab.type=='table'">{{ tab.tableName }}</span>
                  <span v-else><span
                    v-if="tab.type=='setTable'&&tab.tableName!='新增表'">设计</span> {{ tab.tableName }} <span
                      v-if="tab.type=='tableInfo'">信息</span></span>
                  <i
                    class="el-icon-close"
                    @click.stop="deleteTab(index)"/>
                </li>
                <MouseRightMenu
                  :config="rightMenuConfig"
                  @change="getMouseRightIndex"/>
              </div>
            </div>
            <p class="iconBox2">
              <i class="el-icon-d-arrow-right"/>
            </p>
          </ul>
          <div class="toolbox">
            <el-tooltip content="状态监控" class="item" effect="dark" placement="top">
              <el-button
                icon="el-icon-view"
                circle
                plain
                type="warning"
                size="mini"
                @click="monitor"/>
            </el-tooltip>
            <el-tooltip content="备份/还原" class="item" effect="dark" placement="top">
              <el-button
                icon="el-icon-star-on"
                circle
                plain
                type="warning"
                size="mini"
                @click="backup"/>
            </el-tooltip>
            <!-- <el-tooltip content="数据库配置" class="item" effect="dark" placement="top">
              <el-button
                icon="el-icon-setting"
                circle
                plain
                type="warning"
                size="mini"
                @click="datebasebSet"/></el-button>
            </el-tooltip> -->
          </div>
        </div>
        <div id="tBox">
          <template>
            <monitorMySQL v-if="activeTabIndex>-1&&currentConfig.type=='monitor'&&activeTabIndex>-1&&sourceType!='MongoDB'" :data-source-id="this.sourceId"/>
            <monitorMongoDB v-if="activeTabIndex>-1&&currentConfig.type=='monitor'&&activeTabIndex>-1&&sourceType=='MongoDB'" :data-source-id="this.sourceId"/>
          </template>
          <template>
            <Backup
              v-show="activeTabIndex>-1&&currentConfig.type=='backup'"
              ref = "backup"
              :data-source-id="this.sourceId"
              :database-name="this.editorCurDatabase"/>
          </template>
          <!-- <template>
            <databaseSet
              v-show="activeTabIndex>-1&&currentConfig.type=='databaseSet'"
              ref = "databaseSet"
              :data-source-id="this.sourceId"
              :database-name="this.editorCurDatabase"/>
          </template> -->
          <template>
            <div v-show="currentConfig.type!='monitor'&&currentConfig.type!='backup'&&activeTabIndex==-1" class="home">
              <div id="editor">
                <div class="controls" style="height:40px;padding-top:5px;padding-left:10px;">
                  <el-button-group>
                    <el-button
                      icon="el-icon-caret-right"
                      type="primary"
                      size="mini"
                      @click="implement">执行(F8)
                    </el-button>
                    <el-button
                      icon="el-icon-remove"
                      type="primary"
                      size="mini"
                      @click="clearSql">清空(F7)
                    </el-button>
                    <el-button
                      icon="el-icon-upload"
                      type="primary"
                      size="mini"
                      @click="saveSql">SQL保存
                    </el-button>
                  </el-button-group>
                  <div style="display:inline-block;margin-left:50px;font-size:14px;">
                    当前数据库：
                    <span style="color:#409EFF;">{{ editorCurDatabase }}</span>
                  </div>

                </div>
                <textarea ref="txt" class="txt"/>
              </div>
              <div id="result">
                <div class="title">运行结果</div>
                <div class="resultTabs">
                  <div class="tabSign">
                    <div :class="['resTabItem',{'active':resActiveTabIndex==0}]" @click="resActiveTabIndex=0;">
                      <img src="../../assets/imgs/issue.png">
                      <span>消息</span>
                      <!--<i class="el-icon-refresh"></i>-->
                    </div>
                    <div
                      v-show="showResult"
                      :class="['resTabItem',{'active':resActiveTabIndex==1}]"
                      @click="resActiveTabIndex=1;">
                      <img src="../../assets/imgs/issue.png">
                      <span>结果</span>
                      <i class="el-icon-close" @click.stop="closeResultTab"/>
                    </div>
                  </div>
                </div>
                <div class="resultBox">
                  <div v-show="resActiveTabIndex==0" class="resultText">
                    <textarea ref="resTxt" class="resTxt"/>
                  </div>
                  <div v-show="resActiveTabIndex==1" class="resultTable handle-no-data">
                    <el-table
                      v-loading="tableLoading"
                      ref="table"
                      :header-cell-style="{background:'#f5f7fa'}"
                      :data="resultConfig.data"
                      height="calc(100% - 80px)"
                      border
                      style="margin-top:15px;height:auto !important;"
                    >
                      <el-table-column
                        v-for="(item,index) in resultConfig.columnHeads"
                        v-if="play"
                        :label="item.field"
                        :width="item.width"
                        :key="index"
                        align="left">
                        <template slot-scope="scope">
                          <span style="display:block;white-space:nowrap;width:100%;">{{ scope.row[item.field] }}</span>
                        </template>
                      </el-table-column>
                    </el-table>
                    <div class="pagination">
                      <pagination
                        :total="resultConfig.total"
                        :page.sync="resultConfig.pageNumber"
                        :limit.sync="resultConfig.pageSize"
                        layout="total, prev, pager, next, jumper"
                        @pagination="pagination"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-show="currentConfig.type!='monitor'&&currentConfig.type!='backup'&&activeTabIndex>-1"
              class="tableDetail handle-no-data">
              <div
                v-show="viewType=='table'||viewType=='viewTable'"
                class="controls"
                style="height:40px;padding-top:5px;padding-left:10px;">
                <el-button-group v-show="viewType=='table'">
                  <el-button
                    icon="el-icon-plus"
                    type="primary"
                    size="mini"
                    @click="addTableRow">添加
                  </el-button>
                  <el-button
                    icon="el-icon-printer"
                    type="primary"
                    size="mini"
                    @click="copyTableRow">复制
                  </el-button>
                  <el-button
                    icon="el-icon-delete"
                    type="primary"
                    size="mini"
                    @click="deleteTableRow">删除
                  </el-button>
                  <el-button
                    icon="el-icon-setting"
                    type="primary"
                    size="mini"
                    @click="setTable">设计表
                  </el-button>
                  <!--<el-button icon="el-icon-download" type="primary" size="mini" @click="exportTable">导出</el-button>-->
                  <el-button
                    class="refresh-table"
                    v-if="activeTabIndex>=0&&allGridConfigs[activeTabIndex].tableName!='新增表'"
                    icon="el-icon-refresh"
                    type="primary"
                    size="mini"
                    @click="refreshTable">刷新
                  </el-button>
                </el-button-group><!--
                --><el-dropdown
                    placement="bottom"
                    class="dropdown-class"
                    @command="exportData">
                  <el-button type="primary" size="mini">
                    导出<i class="el-icon-arrow-down el-icon--right"/>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="exportToSQL">导出为SQL</el-dropdown-item>
                    <el-dropdown-item command="exportToExcel">导出为Excel</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-button-group v-show="viewType=='viewTable'">
                  <el-button icon="el-icon-download" type="primary" size="mini" @click="exportTable">导出</el-button>
                  <el-button
                    v-if="activeTabIndex>=0&&allGridConfigs[activeTabIndex].tableName!='新增表'"
                    icon="el-icon-refresh"
                    type="primary"
                    size="mini"
                    @click="refreshTable">刷新
                  </el-button>
                </el-button-group>
                <div style="width:60px;display:inline-block"/>
                <el-button-group v-show="viewType=='table'&&ishow">
                  <el-button
                    type="success"
                    size="mini"
                    icon="el-icon-success"
                    @click="saveTable">保存
                  </el-button>
                  <el-button
                    type="info"
                    size="mini"
                    icon="el-icon-error"
                    @click="refreshTable">取消
                  </el-button>
                </el-button-group>
              </div>

              <el-table
                v-loading="tableLoading"
                v-if="viewType=='table'||viewType=='viewTable'"
                ref="table"
                :header-cell-style="{background:'#f5f7fa'}"
                :data="currentConfig.data"
                height="calc(100% - 110px)"
                border
                style="margin-top:15px;height:auto !important;"
                @sort-change="sortTable"
                @selection-change="handleSelectionChange"
              >
                <el-table-column
                  type="selection"
                  width="36"/>
                <el-table-column
                  v-for="(item,index) in currentConfig.columnHeads"
                  v-if="play"
                  :sort-orders="['ascending', 'descending']"
                  :label="item.field"
                  :width="item.width"
                  :key="index"
                  sortable="custom"
                  align="left">
                  <template slot-scope="scope">
                    <div
                      v-show="!scope.row.isInsert"
                      class="tdMask"
                      style="position:absolute;top:0;left:0;right:0;bottom:0;z-index:1"/>

                    <input
                      v-if="item.editor=='numberbox'"
                      :class="{'new':scope.row.isInsert}"
                      v-model="scope.row[item.field]"
                      class="tdText"
                      type="number"
                      @input="tableRowIsEdit(scope.row)">
                    <el-date-picker
                      v-else-if="item.editor=='datetimebox'"
                      v-model="scope.row[item.field]"
                      class="tdText"
                      type="datetime"
                      value-format="yyyy-MM-dd hh:mm:ss"
                      @change="tableRowIsEdit(scope.row)"/>
                    <input
                      v-else
                      :disabled="item.field=='_id'&&sourceType=='MongoDB'"
                      :class="{'new':scope.row.isInsert}"
                      v-model="scope.row[item.field]"
                      class="tdText"
                      @input="tableRowIsEdit(scope.row)">

                  </template>
                </el-table-column>
              </el-table>

              <div
                v-show="viewType=='setTable'"
                class="controls"
                style="height:40px;padding-top:5px;padding-left:10px;">
                <el-button-group>
                  <el-button
                    icon="el-icon-plus"
                    type="primary"
                    size="mini"
                    @click="addSetTableRow">添加
                  </el-button>
                  <el-button
                    icon="el-icon-delete"
                    type="primary"
                    size="mini"
                    @click="deleteSetTableRow">删除
                  </el-button>
                  <el-button icon="el-icon-caret-top" type="primary" size="mini" @click="moveRowUp">上移</el-button>
                  <el-button icon="el-icon-caret-bottom" type="primary" size="mini" @click="moveRowDown">下移</el-button>
                  <el-button
                    icon="el-icon-refresh"
                    type="primary"
                    size="mini"
                    @click="refreshSetTable">刷新
                  </el-button>
                </el-button-group>
                <div style="width:60px;display:inline-block"/>
                <el-button-group v-show="ishow">
                  <el-button
                    type="success"
                    size="mini"
                    icon="el-icon-success"
                    @click="saveSetTable">保存
                  </el-button>
                  <el-button
                    type="info"
                    size="mini"
                    icon="el-icon-error"
                    @click="cancelSetTable">取消
                  </el-button>
                </el-button-group>
              </div>
              <el-table
                v-loading="tableLoading"
                v-if="viewType=='setTable'"
                id="setTableTpl"
                ref="setTable"
                :header-cell-style="{background:'#f5f7fa'}"
                :data="currentConfig.data"
                height="calc(100% - 110px)"
                border
                style="width: 100%;margin-top:15px;"
                @selection-change="handleSelectionChange"
              >
                <el-table-column
                  type="selection"
                  width="36"/>
                <el-table-column
                  v-for="(item,index) in currentConfig.columnHeads"
                  v-if="play"
                  :label="item.label"
                  :width="item.width"
                  :key="index"
                  align="center">
                  <template slot-scope="scope">
                    <div
                      v-show="!scope.row.isInsert"
                      class="tdMask"
                      style="position:absolute;top:0;left:0;right:0;bottom:0;z-index:1"/>
                    <input
                      v-if="item.field=='CHARACTER_MAXIMUM_LENGTH'"
                      :class="{'new':scope.row.isInsert}"
                      v-model="scope.row[item.field]"
                      type="number"
                      class="tdText"
                      @input="setTableRowIsEdit(scope.row)">
                    <el-select
                      v-else-if="item.field=='DATA_TYPE'"
                      v-model="scope.row[item.field]"
                      placeholder="请选择"
                      filterable
                      class="tdText">
                      <el-option
                        v-for="item in dataTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        @input="setTableRowIsEdit(scope.row)"
                      />
                    </el-select>
                    <el-checkbox
                      v-else-if="item.field=='IS_NULLABLE'"
                      v-model="scope.row[item.field]"
                      true-label="YES"
                      false-label="NO"
                      @change="setTableRowIsEdit(scope.row,item.field,true)"/>
                    <el-checkbox
                      v-else-if="item.field=='COLUMN_KEY'"
                      v-model="scope.row[item.field]"
                      true-label="PRI"
                      false-label=""
                      @change="setTableRowIsEdit(scope.row,item.field)"/>
                    <input
                      v-else
                      :class="{'new':scope.row.isInsert}"
                      v-model="scope.row[item.field]"
                      type="text"
                      class="tdText"
                      @input="setTableRowIsEdit(scope.row)">
                  </template>
                </el-table-column>
              </el-table>

              <div v-show="viewType=='tableInfo'" class="controls" style="padding-top:5px;padding-left:10px;">
                <el-button
                  type="primary"
                  size="mini"
                  @click="refreshTableInfo">刷新
                </el-button>
              </div>
              <el-table
                v-loading="tableLoading"
                v-if="viewType=='tableInfo'"
                ref="tableInfo"
                :header-cell-style="{background:'#f5f7fa'}"
                :data="currentConfig.data"
                height="calc(100% - 110px)"
                border
                style="width: 100%;margin-top:15px;height:auto !important;"
                @selection-change="handleSelectionChange"
              >
                <el-table-column
                  type="selection"
                  width="36"/>
                <el-table-column
                  v-for="(item,index) in currentConfig.columnHeads"
                  v-if="play"
                  :label="item.label"
                  :width="item.width"
                  :key="index"
                  align="left"
                  style="flex:1">
                  <template slot-scope="scope">

                    <span>{{ scope.row[item.field] }}</span>

                  </template>
                </el-table-column>
              </el-table>
              <el-pagination
                v-if="activeTabIndex>-1 && currentConfig.total>0 && (viewType=='table'||viewType=='viewTable')"
                :current-page="allGridConfigs.length?allGridConfigs[activeTabIndex].pageNo:1"
                :page-sizes="[10, 15, 20, 25,30]"
                :page-size="allGridConfigs.length?allGridConfigs[activeTabIndex].pageSize:15"
                :total="allGridConfigs.length?allGridConfigs[activeTabIndex].total:0"
                style="margin-top:15px;"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"/>
            </div>

          </template>

        </div>
      </div>
      <RightSql
        :common-sql-config="commonSqlConfig"
        :my-sql-config="mySqlConfig"
        :common-sql-loading="commonSqlLoading"
        :my-sql-loading="mySqlLoading"
        @appendSql="appendSql"
        @removeSqlRow="removeSqlRow"
        @refreshMysql="getMySql"/>
    </div>
    <el-dialog :visible.sync="showMongoJsonEditor" title="新增MongoDB数据">
      <JsonEditor v-model="mongoJson"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showMongoJsonEditor = false">取 消</el-button>
        <el-button type="primary" @click="mongoJsonSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import fetch from '@/utils/fetch.js'
import DataBaseTree from '@/components/dataBaseTree'
import JsonEditor from '@/components/JsonEditor'
import RightSql from '@/components/rightSql'
import MouseRightMenu from '@/components/MouseRightMenu'
import Pagination from '@/components/Pagination'
import { Message } from 'element-ui'

import TreeUtil from '@/utils/TreeUtil.js'

import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/neo.css'
import 'codemirror/theme/idea.css'
import 'codemirror/mode/sql/sql.js'

import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/show-hint.css'
import './sql-hint.css'
import '@/utils/jquery-ui/jquery-ui.min.css'
import '@/utils/jquery-ui/jquery-ui.min.js'

import monitorMySQL from './monitorMySQL/index'
import monitorMongoDB from './monitorMongoDB/index'
import Backup from './backup/index'
// import databaseSet from './databaseSet/index'

export default {
  name: 'Database',
  components: {
    DataBaseTree,
    MouseRightMenu,
    RightSql,
    JsonEditor,
    monitorMySQL,
    monitorMongoDB,
    Backup,
    Pagination
  },
  data() {
    const _this = this
    return {
      mongoJson: {},
      showMongoJsonEditor: false,
      resultConfig: {
        columnHeads: [],
        data: [],
        pageNumber: 1,
        pageSize: 20,
        total: 0
      },
      resActiveTabIndex: 0,
      showResult: false,
      addDico: [],
      editorCurDatabase: '',
      commonSqlLoading: false,
      commonSqlConfig: [],
      mySqlConfig: [],
      mySqlLoading: false,
      ishow: false,
      ishowArr: [],
      editor: null,
      resEditor: null,
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
      fullScreenLoading: false,
      sourceType: 'MySql',
      tableLoading: false,
      play: true,
      sourceOptions: [],
      sourceId: '1',
      // showNewTableTabActive: false,
      showNewTableTab: false,
      showNewTable: false,
      newTableConfigs: {},
      treeConfig: [],
      treeLoading: false,
      activeTabIndex: -1,
      mouseRightIndex: '',
      mouseRightTableInfo: {},
      firstTabRightMenuConfig: [
        {
          icon: '',
          title: '关闭其他选项卡',
          callback: function () {
            _this.activeTabIndex = -1
            _this.allGridConfigs = []
          }
        }
      ],
      rightMenuConfig: [
        {
          icon: '',
          title: '关闭选项卡',
          callback: function () {
            if (_this.mouseRightIndex == _this.activeTabIndex) {
              if (_this.mouseRightIndex + 1 in _this.allGridConfigs) {
                _this.activeTabIndex = _this.mouseRightIndex
              } else {
                _this.activeTabIndex = _this.mouseRightIndex - 1
              }
            } else if (_this.mouseRightIndex > _this.activeTabIndex) {
            } else if (_this.mouseRightIndex < _this.activeTabIndex) {
              _this.activeTabIndex--
            }
            _this.allGridConfigs.splice(_this.mouseRightIndex, 1)
            if (_this.allGridConfigs.length == 0) {
              _this.activeTabIndex = -1
            }
          }
        },
        {
          icon: '',
          title: '关闭其他选项卡',
          callback: function () {
            _this.activeTabIndex = 0
            const currentArr = _this.allGridConfigs.slice(
              _this.mouseRightIndex,
              _this.mouseRightIndex + 1
            )
            _this.allGridConfigs = [].concat(currentArr)
          }
        },
        {
          icon: '',
          title: '关闭左侧选项卡',
          callback: function () {
            if (_this.mouseRightIndex == 0) {
              return
            } else {
              const distance = _this.mouseRightIndex
              _this.activeTabIndex -= distance
              _this.allGridConfigs = _this.allGridConfigs.slice(
                _this.mouseRightIndex
              )
            }
          }
        },
        {
          icon: '',
          title: '关闭右侧选项卡',
          callback: function () {
            if (_this.allGridConfigs.length == _this.mouseRightIndex + 1) {
              return
            } else {
              if (_this.activeTabIndex > _this.mouseRightIndex) {
                _this.activeTabIndex = _this.mouseRightIndex
              }
              _this.allGridConfigs = _this.allGridConfigs.slice(
                0,
                _this.mouseRightIndex + 1
              )
            }
          }
        },
        {
          icon: '',
          title: '关闭所有选项卡',
          callback: function () {
            _this.activeTabIndex = -1
            _this.allGridConfigs = []
          }
        }
      ],
      allGridConfigs: []
    }
  },
  computed: {
    dico() {
      return this.dicoBase.concat(this.addDico)
    },
    dataTypeOptions() {
      switch (this.sourceType) {
        case 'MySql':
          return [{ label: 'char', value: 'char' }, {
            label: 'character',
            value: 'character'
          }, { label: 'character varying', value: 'character varying' }, {
            label: 'binary',
            value: 'binary'
          }, { label: 'bigint', value: 'bigint' }, { label: 'bit', value: 'bit' }, {
            label: 'blob',
            value: 'blob'
          }, { label: 'date', value: 'date' }, { label: 'datetime', value: 'datetime' }, {
            label: 'double',
            value: 'double'
          }, { label: 'decimal', value: 'decimal' }, { label: 'enum', value: 'enum' }, {
            label: 'float',
            value: 'float'
          }, { label: 'int', value: 'int' }, { label: 'integer', value: 'integer' }, {
            label: 'longtext',
            value: 'longtext'
          }, { label: 'longblob', value: 'longblob' }, {
            label: 'mediumint',
            value: 'mediumint'
          }, { label: 'mediumblob', value: 'mediumblob' }, {
            label: 'mediumtext',
            value: 'mediumtext'
          }, { label: 'number', value: 'number' }, { label: 'numeric', value: 'numeric' }, {
            label: 'nvarchar',
            value: 'nvarchar'
          }, { label: 'real', value: 'real' }, { label: 'set', value: 'set' }, {
            label: 'smallint',
            value: 'smallint'
          }, { label: 'string', value: 'string' }, { label: 'tinyint', value: 'tinyint' }, {
            label: 'tinytext',
            value: 'tinytext'
          }, { label: 'text', value: 'text' }, { label: 'tinyblob', value: 'tinyblob' }, {
            label: 'timestamp',
            value: 'timestamp'
          }, { label: 'time', value: 'time' }, { label: 'varchar', value: 'varchar' }, {
            label: 'varchar2',
            value: 'varchar2'
          }, { label: 'varbinary', value: 'varbinary' }, { label: 'year', value: 'year' }]
      }
    },
    currentConfig() {
      return this.allGridConfigs[this.activeTabIndex] || []
    },
    viewType() {
      return this.activeTabIndex == -1
        ? 'home'
        : this.allGridConfigs[this.activeTabIndex].type
    },
    currentTableName() {
      return this.allGridConfigs[this.activeTabIndex].tableName
    },
    currentDatabaseName() {
      return this.allGridConfigs[this.activeTabIndex].databaseName
    }
  },
  watch: {
    activeTabIndex(val) {
      if (val >= 0) {
        this.play = false
        setTimeout(() => {
          this.play = true
          const rows = this.allGridConfigs[this.activeTabIndex].selectedArr
          if (this.allGridConfigs[this.activeTabIndex].type == 'table') {
            this.initTableSelect(rows)
          } else if (this.allGridConfigs[this.activeTabIndex].type == 'setTable') {
            this.initSetTableSelect(rows)
          }
        }, 10)
      }
    }
  },
  updated() {
    this.$nextTick(() => {
      var tabBoxWidth = $('.tab-box').outerWidth()
      var rightTabWidth = $('.right-tab').outerWidth()
        ? $('.right-tab').outerWidth() + 4
        : 0
      var w =
        $('.left-tab').outerWidth() +
        $('.center-tab').outerWidth() +
        4 +
        rightTabWidth
      if (w > tabBoxWidth) {
        $('.iconBox,.iconBox2').show()
      } else {
        $('.iconBox,.iconBox2').hide()
      }
    })
  },
  mounted() {
    $('#leftTree').resizable({
      handles: 'e', // 'e'是east，允许拖动右侧边框的意思
      maxWidth: 500,
      minWidth: 210
    })

    this.resEditor = CodeMirror.fromTextArea(this.$refs.resTxt, {
      tabSize: 4,
      mode: 'text/x-mysql',
      theme: 'idea',
      lineNumbers: true,
      line: true,
      lineWrapping: true,
      hintOptions: {
        completeSingle: false,
        hint: this.hint
      },
      extraKeys: {
        'Ctrl-Space': editor => {
          editor.showHint()
        }
      }
    })
    this.editor = CodeMirror.fromTextArea(this.$refs.txt, {
      tabSize: 4,
      mode: 'text/x-mysql',
      theme: 'idea',
      lineNumbers: true,
      line: true,
      lineWrapping: true,
      hintOptions: {
        completeSingle: false,
        hint: this.hint
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
    $(document).on('mousedown', '.tdMask', function () {
      $(this).hide()
    })
    $(document).on('blur', '.tdText', function () {
      if (!$(this).hasClass('new')) {
        $(this).siblings('.tdMask').show()
      }
    })

    $(window).on('resize', function () {
      var tabBoxWidth = $('.tab-box').outerWidth()
      var rightTabWidth = $('.right-tab').outerWidth()
        ? $('.right-tab').outerWidth() + 4
        : 0
      var w =
        $('.left-tab').outerWidth() +
        $('.center-tab').outerWidth() +
        4 +
        rightTabWidth
      if (w > tabBoxWidth) {
        $('.iconBox,.iconBox2').show()
      } else {
        $('.iconBox,.iconBox2').hide()
      }
    })

    var tabBoxWidth = $('.tab-box').outerWidth()
    $('.iconBox').on('click', function () {
      var scrollLeft = $('.tab-box').scrollLeft()
      var left = scrollLeft > tabBoxWidth ? scrollLeft - tabBoxWidth : 0
      $('.tab-box').animate({ scrollLeft: left }, 300)
    })
    $('.iconBox2').on('click', function () {
      var scrollLeft = $('.tab-box').scrollLeft()
      var left = scrollLeft + tabBoxWidth
      $('.tab-box').animate({ scrollLeft: left }, 300)
    })
  },
  created() {
    this.keyupSubmit()
    this.getSourceList()
    this.getTreeConfig()
    this.getCommonSql()
    this.getMySql()
  },
  methods: {
    keyupSubmit() {
      let _this = this;
      document.onkeydown = e => {
        let _key = window.event.keyCode;
        if (_key === 119) {
          _this.implement();
        }
        if (_key === 118) {
          _this.clearSql();
        }
      }
    },
    pagination(pageItem) {
      this.resultConfig.pageNumber = pageItem.page
      this.implement()
    },
    sortBase(obj) {
      this.allGridConfigs[this.activeTabIndex].orderBy = obj.column.label
      if (obj.order == 'descending') {
        this.allGridConfigs[this.activeTabIndex].order = 'desc'
      } else {
        this.allGridConfigs[this.activeTabIndex].order = 'asc'
      }
    },
    sortTable(obj) {
      this.sortBase(obj)
      this.refreshTable()
    },
    downLoad(data, name) {
      const blob = new Blob([data])
      const fileName = name + '.sql'
      if ('download' in document.createElement('a')) { // 非IE下载
        const elink = document.createElement('a')
        elink.download = fileName
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href) // 释放URL 对象
        document.body.removeChild(elink)
      } else {
        navigator.msSaveBlob(blob, fileName)
      }
    },
    exportData(command) {
      let rows = JSON.parse(JSON.stringify(this.allGridConfigs[this.activeTabIndex].selectedArr))
      const primaryKey = this.allGridConfigs[this.activeTabIndex].primaryKey
      rows = rows.map(item => {
        delete item.oldData
        delete item.isInsert
        delete item.isEdit
        return item
      })
      if (!rows.length) {
        Message({
          message: '请至少选中一行数据',
          type: 'warning',
          duration: 3000
        })
        return
      }
      if (command === 'exportToSQL') {
        fetch({
          url: `table/exportDataToSQL/${this.sourceId}`,
          method: 'post',
          data: {
            databaseName: this.currentDatabaseName,
            tableName: this.currentTableName,
            primary_key: primaryKey,
            checkedItems: JSON.stringify(rows)
          }
        }).then(res => {
          this.downLoad(res.data, this.currentTableName)
        })
      } else {
        const list = this.allGridConfigs[this.activeTabIndex]
        const tHeader = list.columnHeads.map(element => element.title)
        const handleData = list.selectedArr.map(element => {
          delete element.oldData
          return element
        })
        const data = this.formatJson(tHeader, handleData)
        import('@/components/vendor/Export2Excel').then(excel => {
          excel.export_json_to_excel({
            header: tHeader,
            data,
            bookType: 'xls',
            filename: this.currentTableName
          })
        })
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    exportTable() {
      let rows = JSON.parse(JSON.stringify(this.allGridConfigs[this.activeTabIndex].selectedArr))
      const primaryKey = this.allGridConfigs[this.activeTabIndex].primaryKey
      rows = rows.map(item => {
        delete item.oldData
        delete item.isInsert
        delete item.isEdit
        return item
      })
      if (!rows.length) {
        Message({
          message: '请至少选中一行数据',
          type: 'warning',
          duration: 3000
        })
      } else {
        fetch({
          url: `table/exportDataToSQL/${this.sourceId}`,
          method: 'post',
          data: {
            databaseName: this.currentDatabaseName,
            tableName: this.currentTableName,
            primary_key: primaryKey,
            checkedItems: JSON.stringify(rows)
          }
        }).then(res => {
          this.downLoad(res.data, this.currentTableName)
        })
      }
    },
    chooseDatabase(name) {
      this.editorCurDatabase = name
      let arr
      this.treeConfig.forEach(item => {
        if (item.name == name) {
          arr = item.children[0].children.map(v => {
            return { className: 'table', text: v.name }
          })
        }
      })
      this.addDico = arr
    },
    appendSql(sql) {
      // let oldSql = this.editor.getValue()
      // let enter = oldSql ? '\n' : ''
      // let newSql = oldSql + enter + sql
      this.editor.setValue(sql)
    },
    removeSqlRow(id) {
      this.$confirm('你确定要删除？', '操作提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.mySqlLoading = true
        fetch({
          url: `searchHistory/${id}`,
          method: 'delete'
        }).then(res => {
          this.mySqlLoading = false
          res = res.data
          if (res.code == '200') {
            Message({
              message: '删除成功',
              type: 'success',
              duration: 3000
            })
            this.getMySql()
          } else {
            Message({
              message: res.message,
              type: 'error',
              duration: 5000
            })
          }
        })
      })
    },
    implement() {
      const sql = this.editor.getValue()
      this.fullScreenLoading = this.$loading({
        lock: true,
        text: '执行中，请稍等...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })
      fetch({
        url: `sqloperating/executeSqlTest/${this.sourceId}?page=${this.resultConfig.pageNumber}`,
        method: 'post',
        data: {
          sql: sql,
          databaseName: this.editorCurDatabase
        }
      }).then(res => {
        this.fullScreenLoading.close()
        res = res.data
        if (res.code == '200') {
          res = res.data
          const news = `运行时间：${res.time}毫秒`
          this.resEditor.setValue(news)
          this.showResult = true
          this.resActiveTabIndex = 1
          this.resultConfig.columnHeads = JSON.parse(res.columns)[0]
          this.resultConfig.data = res.rows
          this.resultConfig.total = res.total
          this.resultConfig.columnHeads.forEach((item, index) => {
            let width
            if (item.editor == 'datetimebox') {
              width = 220
            } else {
              const headWidth = item.field.toString().length * 14 + 40
              let tdStr = ''
              this.resultConfig.data.forEach(v => {
                if (v[item.field] !== null) {
                  if (v[item.field].toString().length > tdStr.length) {
                    tdStr = v[item.field].toString()
                  }
                } else {
                  v[item.field] = ''
                  if (v[item.field].toString().length > tdStr.length) {
                    tdStr = v[item.field].toString()
                  }
                }
              })
              const tdWidth = 11 * tdStr.length + 20
              width = headWidth >= tdWidth ? headWidth : tdWidth
            }
            this.resultConfig.columnHeads[index].width = width
          })
          this.play = false
          setTimeout(() => {
            this.play = true
          }, 10)
        } else {
          this.showResult = false
          this.resActiveTabIndex = 0
          this.resEditor.setValue(res.message)
        }
      })
    },
    clearSql() {
      this.editor.setValue('')
    },
    closeResultTab() {
      this.showResult = false
      this.resActiveTabIndex = 0
    },
    getMySql() {
      this.mySqlLoading = true
      fetch({
        url: 'searchHistory/getByWhere',
        method: 'get'
      }).then(res => {
        this.mySqlLoading = false
        res = res.data
        this.mySqlConfig = res.data
      })
    },
    saveSql() {
      this.$prompt('保存查询', '名称', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        const sql = this.editor.getValue()
        fetch({
          url: 'searchHistory',
          method: 'post',
          data: {
            name: value,
            sqls: sql
          }
        }).then(res => {
          res = res.data
          if (res.code == '200') {
            Message({
              message: '保存成功',
              type: 'success',
              duration: 3000
            })
            this.getMySql()
          }
        })
      })
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
    },
    getCommonSql() {
      this.commonSqlLoading = true
      fetch({
        url: 'sqlStudy/getByWhere',
        method: 'get'
      }).then(res => {
        this.commonSqlLoading = false
        res = res.data
        if (res.code == '200') {
          res = res.data.map(item => {
            item.parentId = item.pid
            item.name = item.title
            return item
          })
          res = TreeUtil(res, ['content'])
          this.commonSqlConfig = res.children
        } else {
          Message({
            message: res.message,
            type: 'error',
            duration: 5000
          })
        }
      })
    },
    changeSourceId(newSourceId) {
      this.chooseDatabase()
      this.sourceId = newSourceId
      this.sourceOptions.forEach(item => {
        if (item.value == newSourceId) {
          this.sourceType = item.type
          this.editorCurDatabase = item.databaseName
        }
      })
      this.getTreeConfig()
      this.$nextTick(function () {
        this.$refs.backup.getList()
      })
    },
    handleSizeChange(pageSize) {
      this.allGridConfigs[this.activeTabIndex].pageSize = pageSize
      this.allGridConfigs[this.activeTabIndex].pageNo = 1
      this.refreshTable()
    },
    handleCurrentChange(pageNo) {
      this.allGridConfigs[this.activeTabIndex].pageNo = pageNo
      this.refreshTable()
    },
    getSourceList() {
      fetch({
        url: 'dms/allDatabaseList',
        method: 'get'
      }).then(res => {
        res = res.data.data
        this.sourceOptions = res.map(item => {
          return {
            value: item.id,
            label: `【 ${item.databaseType} 】 ${item.name}`,
            type: item.databaseType,
            databaseName: item.databaseName
          }
        })
      })
    },
    getTreeConfig() {
      this.treeLoading = true
      fetch({
        url: `dms/databaseList/${this.sourceId}`,
        method: 'get'
      }).then(res => {
        this.treeLoading = false
        res = res.data.data
        res = res.map(item => {
          item.parentId = item.pid
          return item
        })
        res = TreeUtil(res)
        this.treeConfig = res.children
      })
    },
    handleSelectionChange(rows) {
      this.allGridConfigs[this.activeTabIndex].selectedArr = rows
    },
    initTableSelect(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.table.toggleRowSelection(row)
        })
      } else {
        this.$refs.table.clearSelection()
      }
    },
    initSetTableSelect(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.setTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.setTable.clearSelection()
      }
    },
    tableRowIsEdit(row) {
      row.isEdit = true
      this.changebtshow(true);
    },
    setTableRowIsEdit(row, columnName, isnull) {
      this.changebtshow(true);
      if (this.currentTableName == '新增表') return
      if (row['COLUMN_KEY'] == 'PRI' && row['IS_NULLABLE'] == 'YES') {
        row['IS_NULLABLE'] = 'NO'
        if (isnull) {
          Message({
            message: '主键不能为空',
            type: 'error',
            duration: 5000
          })
          return
        }
      }
      row.isEdit = true

      if (columnName == 'IS_NULLABLE') {
        this.tableLoading = true
        fetch({
          url: `table/designTableSetNull/${this.sourceId}`,
          method: 'post',
          data: {
            column_name: row['COLUMN_NAME'],
            databaseName: this.currentDatabaseName,
            is_nullable: row['IS_NULLABLE'] == 'YES',
            tableName: this.currentTableName
          }
        }).then(res => {
          this.tableLoading = false
          res = res.data
          if (res.code == '200') {
            Message({
              message: '设置成功',
              type: 'success',
              duration: 3000
            })
          } else {
            Message({
              message: res.message,
              type: 'error',
              duration: 5000
            })
          }
        })
      } else if (columnName == 'COLUMN_KEY') {
        this.tableLoading = true
        fetch({
          url: `table/designTableSetPimary/${this.sourceId}`,
          method: 'post',
          data: {
            column_name: row['COLUMN_NAME'],
            databaseName: this.currentDatabaseName,
            column_key: row['COLUMN_KEY'] == 'PRI',
            tableName: this.currentTableName
          }
        }).then(res => {
          this.tableLoading = false
          res = res.data
          if (res.code == '200') {
            Message({
              message: '设置成功',
              type: 'success',
              duration: 3000
            })
          } else {
            Message({
              message: res.message,
              type: 'error',
              duration: 5000
            })
          }
        })
      }
    },
    injectOldData(targetIndex) {
      this.allGridConfigs[targetIndex].data.forEach(item => {
        const row = Object.assign({}, item)
        item.oldData = row
      })
    },
    changebtshow(status) {
      this.ishow = status;
      this.ishowArr[this.activeTabIndex].show = status;
    },
    addTableRow() {
      if (this.sourceType != 'MongoDB') {
        const { ...obj } = this.allGridConfigs[this.activeTabIndex].data[0]
        for (const key in obj) {
          obj[key] = ''
        }
        obj.isInsert = true
        this.allGridConfigs[this.activeTabIndex].data.unshift(obj)
      } else {
        this.showMongoJsonEditor = true
      }
      this.changebtshow(true);
    },
    copyTableRow() {
      const rows = JSON.parse(JSON.stringify(this.allGridConfigs[this.activeTabIndex].selectedArr))
      if (!rows.length) {
        Message({
          message: '请至少选中一行数据',
          type: 'warning',
          duration: 3000
        })
      } else {
        rows.forEach(item => {
          delete item.oldData
          item.isInsert = true
          for (const key in item) {
            if (item[key] == null) {
              item[key] = ''
            }
          }
        })
        this.allGridConfigs[this.activeTabIndex].data.unshift(...rows)
        this.changebtshow(true);
      }
    },
    deleteTableRow() {
      const rows = JSON.parse(JSON.stringify(this.allGridConfigs[this.activeTabIndex].selectedArr))
      if (!rows.length) {
        Message({
          message: '请至少选中一行数据',
          type: 'warning',
          duration: 3000
        })
      } else {
        const hasInsert = rows.some(item => {
          return item.isInsert
        })
        if (hasInsert) {
          Message({
            message: '请先保存变更内容！',
            type: 'warning',
            duration: 3000
          })
        } else {
          const checkedItems = rows
          //   rows.forEach(item => {
          //     for (const key in item) {
          //       if (!item.isInsert) {
          //         checkedItems.push(item.oldData)
          //       }
          //     }
          //   })
          this.$confirm('删除选中的数据, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.tableLoading = true
            fetch({
              url: `/table/deleteRows/${this.sourceId}`,
              method: 'post',
              data: {
                checkedItems: JSON.stringify(checkedItems),
                databaseName: this.currentConfig.databaseName,
                tableName: this.currentConfig.tableName,
                primary_key: this.currentConfig.primaryKey
              }
            }).then(res => {
              this.tableLoading = false
              res = res.data
              if (res.code == '200') {
                Message({
                  message: '删除成功',
                  type: 'success',
                  duration: 3000
                })
                this.refreshTable()
              } else {
                Message({
                  message: res.message,
                  type: 'error',
                  duration: 5000
                })
              }
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
        }
      }
    },
    refreshTable() {
      this.tableLoading = true
      const targetIndex = this.activeTabIndex
      this.changebtshow(false);
      fetch({
        url: `table/${this.currentTableName}/${this.currentDatabaseName}/${this.sourceId}`,
        method: 'post',
        data: {
          pageNo: this.allGridConfigs[targetIndex].pageNo,
          pageSize: this.allGridConfigs[targetIndex].pageSize,
          order: this.allGridConfigs[targetIndex].order,
          orderBy: this.allGridConfigs[targetIndex].orderBy
        }
      }).then(res => {
        this.tableLoading = false
        res = res.data.data
        this.allGridConfigs[targetIndex].columnHeads = JSON.parse(res.columns)[0].slice(1)
        this.allGridConfigs[targetIndex].data = res.rows
        this.allGridConfigs[targetIndex].total = res.total
        this.allGridConfigs[targetIndex].primaryKey = res.primaryKey
        this.allGridConfigs[targetIndex].columnHeads.forEach((item, index) => {
          let width
          if (item.editor == 'datetimebox') {
            width = 220
          } else {
            const headWidth = item.field.toString().length * 14 + 40
            let tdStr = ''
            this.allGridConfigs[targetIndex].data.forEach(v => {
              if (v[item.field] !== null) {
                if (v[item.field].toString().length > tdStr.length) {
                  tdStr = v[item.field].toString()
                }
              } else {
                v[item.field] = ''
                if (v[item.field].toString().length > tdStr.length) {
                  tdStr = v[item.field].toString()
                }
              }
            })
            const tdWidth = 11 * tdStr.length + 40
            width = headWidth >= tdWidth ? headWidth : tdWidth
          }
          this.allGridConfigs[targetIndex].columnHeads[index].width = width
        })

        this.injectOldData(targetIndex)
      })
    },
    mongoJsonSubmit() {
      this.fullScreenLoading = this.$loading({
        lock: true,
        text: '保存中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })
      const updated = []
      const currentRows = JSON.parse(JSON.stringify(this.currentConfig.data))
      currentRows.forEach(item => {
        if (item.isEdit) {
          delete item.isEdit
          const oldData = Object.assign({}, item.oldData)
          delete item.oldData
          const changesData = {}
          for (const key in item) {
            if (item[key] != oldData[key]) {
              changesData[key] = item[key]
            }
          }
          updated.push({ oldData: oldData, changesData: changesData })
        }
      })
      const params = {
        databaseName: this.currentConfig.databaseName,
        tableName: this.currentConfig.tableName,
        primary_key: this.currentConfig.primaryKey
      }
      if (JSON.stringify(this.mongoJson) === '{}') {
        this.fullScreenLoading.close()
        Message({
          message: '不能新增空对象',
          type: 'warning',
          duration: 3000
        })
        return
      }
      params.inserted = JSON.stringify([JSON.parse(this.mongoJson)])
      if (updated.length) {
        params.updated = JSON.stringify(updated)
      }
      fetch({
        url: `table/saveData/${this.sourceId}`,
        method: 'post',
        data: params
      }).then(res => {
        this.fullScreenLoading.close()
        res = res.data
        if (res.code == '200') {
          this.showMongoJsonEditor = false
          Message({
            message: '保存成功！',
            type: 'success',
            duration: 3000
          })
          this.refreshTable()
        } else {
          Message({
            message: res.message,
            type: 'error',
            duration: 5000
          })
        }
      })
    },
    saveTable() {
      this.tableLoading = true
      let inserted = [], updated = []
      const currentRows = JSON.parse(JSON.stringify(this.currentConfig.data))
      currentRows.forEach(item => {
        if (item.isInsert) {
          delete item.isInsert
          delete item.isEdit
          delete item.oldData
          inserted.push(item)
        } else if (item.isEdit) {
          delete item.isEdit
          const oldData = Object.assign({}, item.oldData)
          delete item.oldData
          const changesData = {}
          for (const key in item) {
            if (item[key] != oldData[key]) {
              changesData[key] = item[key]
            }
          }
          updated.push({ oldData: oldData, changesData: changesData })
        }
      })
      const params = {
        databaseName: this.currentConfig.databaseName,
        tableName: this.currentConfig.tableName,
        primary_key: this.currentConfig.primaryKey
      }
      if (inserted.length) {
        params.inserted = JSON.stringify(inserted)
      }
      if (updated.length) {
        params.updated = JSON.stringify(updated)
      }
      fetch({
        url: `table/saveData/${this.sourceId}`,
        method: 'post',
        data: params
      }).then(res => {
        this.tableLoading = false
        res = res.data
        if (res.code == '200') {
          Message({
            message: '保存成功！',
            type: 'success',
            duration: 3000
          })
          this.refreshTable()
        } else {
          Message({
            message: res.message,
            type: 'error',
            duration: 5000
          })
        }
      })
    },
    setTableByRightMouse(fromRightMouseObj) {
      this.setTable('', fromRightMouseObj)
    },
    setTable($event, fromRightMouseObj) {
      let bName, tName
      if (!fromRightMouseObj) {
        bName = this.currentDatabaseName
        tName = this.currentTableName
      } else {
        bName = fromRightMouseObj.database.name
        tName = fromRightMouseObj.table.name
      }

      var num = 0
      var length = this.allGridConfigs.length
      for (var i = 0; i < length; i++) {
        if (this.allGridConfigs[i].databaseName == bName &&
          this.allGridConfigs[i].tableName == tName &&
          this.allGridConfigs[i].type == 'setTable') {
          num++
          this.activeTabIndex = i
        }
      }

      if (num > 0) {
        return
      } else if (num == 0) {
        if (this.sourceType == 'MongoDB') {
          this.$alert('暂时不支持MongoDB', '提示', {
            confirmButtonText: '确定'
          })
        } else {
          this.allGridConfigs.push({
            type: 'setTable',
            databaseName: bName,
            tableName: tName,
            selectedArr: [],
            pageNo: 1,
            total: 1,
            pageSize: 15,
            columnHeads: [],
            data: []
          })
          this.activeTabIndex = this.allGridConfigs.length - 1

          this.$nextTick(() => {
            var tabBoxWidth = $('.tab-box').outerWidth()
            var scrollLeft = $('.tab-box').scrollLeft()
            var left = scrollLeft + tabBoxWidth
            $('.tab-box').animate({ scrollLeft: left }, 300)
          })
          this.ishowArr.push({
            show: false
          });
          this.ishow = false;
          this.refreshSetTable()
        }
      }
    },
    addSetTableRow() {
      const obj = {
        CHARACTER_MAXIMUM_LENGTH: null,
        COLUMN_COMMENT: '',
        COLUMN_DEFAULT: null,
        COLUMN_KEY: '',
        COLUMN_NAME: '',
        COLUMN_TYPE: '',
        DATA_TYPE: '',
        IS_NULLABLE: 'YES',
        NUMERIC_PRECISION: '',
        NUMERIC_SCALE: '',
        TREESOFTPRIMARYKEY: '',
        extra: '',
        CHANGDU: '',
        JINGDU: ''
      }
      obj.isInsert = true
      this.allGridConfigs[this.activeTabIndex].data.push(obj)
      $('#setTableTpl .el-table__body-wrapper').animate({ scrollTop: '10000px' }, 200)
      this.changebtshow(true);
    },
    deleteSetTableRow() {
      let rows = JSON.parse(JSON.stringify(this.allGridConfigs[this.activeTabIndex].selectedArr))
      if (!rows.length) {
        Message({
          message: '请至少选中一行数据',
          type: 'warning',
          duration: 3000
        })
      } else {
        rows = rows.map(item => {
          return item.COLUMN_NAME
        })
        this.tableLoading = true
        fetch({
          url: `table/deleteTableColumn/${this.sourceId}`,
          method: 'post',
          data: {
            databaseName: this.currentDatabaseName,
            tableName: this.currentTableName,
            ids: rows
          }
        }).then(res => {
          this.tableLoading = false
          res = res.data
          if (res.code == '200') {
            Message({
              message: '删除成功',
              type: 'success',
              duration: 3000
            })
            this.refreshSetTable()
          } else {
            Message({
              message: res.message,
              type: 'error',
              duration: 5000
            })
          }
        })
      }
    },
    moveRowUp() {
      const rows = this.allGridConfigs[this.activeTabIndex].selectedArr
      if (!rows.length) {
        Message({
          message: '请至少选中一行数据',
          type: 'warning',
          duration: 3000
        })
      } else {
        const row = rows[0]
        const column_name2 = row.COLUMN_NAME
        let idx = -1
        this.currentConfig.data.forEach((item, index) => {
          if (item['COLUMN_NAME'] == column_name2) {
            idx = index - 1
          }
        })
        if (idx >= 0) {
          const row = this.allGridConfigs[this.activeTabIndex].data[idx]
          const row2 = this.allGridConfigs[this.activeTabIndex].data[idx + 1]

          this.allGridConfigs[this.activeTabIndex].data[idx] = row2
          this.allGridConfigs[this.activeTabIndex].data[idx + 1] = row

          this.initSetTableSelect([this.allGridConfigs[this.activeTabIndex].data[9998]]) // 该代码是为了解决移动后复选框选中状态没有跟随移动的坑

          const column_name = this.currentConfig.data[idx + 1]['COLUMN_NAME']
          const params = {
            databaseName: this.currentDatabaseName,
            tableName: this.currentTableName,
            column_name,
            column_name2
          }
          this.tableLoading = true
          fetch({
            url: `table/upDownColumn/${this.sourceId}`,
            method: 'post',
            data: params
          }).then(res => {
            this.tableLoading = false
            res = res.data
            if (res.code == '200') {
              Message({
                message: '保存成功',
                type: 'success',
                duration: 3000
              })
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          })
        }
      }
    },
    moveRowDown() {
      const rows = this.allGridConfigs[this.activeTabIndex].selectedArr
      if (!rows.length) {
        Message({
          message: '请至少选中一行数据',
          type: 'warning',
          duration: 3000
        })
      } else {
        const row = rows[0]
        const column_name = row.COLUMN_NAME
        let idx = -1
        this.currentConfig.data.forEach((item, index) => {
          if (item['COLUMN_NAME'] == column_name) {
            idx = index
          }
        })
        if (idx < this.currentConfig.data.length - 1) {
          const column_name2 = this.currentConfig.data[idx + 1]['COLUMN_NAME']

          const row = this.allGridConfigs[this.activeTabIndex].data[idx]
          const row2 = this.allGridConfigs[this.activeTabIndex].data[idx + 1]

          this.allGridConfigs[this.activeTabIndex].data[idx] = row2
          this.allGridConfigs[this.activeTabIndex].data[idx + 1] = row

          this.initSetTableSelect([this.allGridConfigs[this.activeTabIndex].data[9998]]) // 该代码是为了解决移动后复选框选中状态没有跟随移动的坑

          const params = {
            databaseName: this.currentDatabaseName,
            tableName: this.currentTableName,
            column_name,
            column_name2
          }
          this.tableLoading = true
          fetch({
            url: `table/upDownColumn/${this.sourceId}`,
            method: 'post',
            data: params
          }).then(res => {
            this.tableLoading = false
            res = res.data
            if (res.code == '200') {
              Message({
                message: '保存成功',
                type: 'success',
                duration: 3000
              })
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          })
        }
      }
    },
    refreshSetTable() {
      this.changebtshow(false);
      this.tableLoading = true
      const targetIndex = this.activeTabIndex
      fetch({
        url: `/table/designTableData/${this.currentTableName}/${this.currentDatabaseName}/${this.sourceId}`,
        method: 'get'
      }).then(res => {
        this.tableLoading = false
        res = res.data.data
        this.allGridConfigs[targetIndex].total = res.total
        this.allGridConfigs[targetIndex].data = res.rows
        this.allGridConfigs[targetIndex].columnHeads = [{
          label: '字段名',
          field: 'COLUMN_NAME',
          width: '220'
        }, { label: '类型', field: 'DATA_TYPE', width: '200' }, {
          label: '长度',
          field: 'CHANGDU',
          width: '100'
        }, {
          label: '精度',
          field: 'JINGDU',
          width: '100'
        }, { label: '注释', field: 'COLUMN_COMMENT' }, {
          label: '允许空值',
          field: 'IS_NULLABLE',
          width: '100'
        }, { label: '主键设置', field: 'COLUMN_KEY', width: '100' }]
      })
    },
    cancelSetTable() {
      if (this.currentTableName == '新增表') {
        const index = this.activeTabIndex
        if (index + 1 in this.allGridConfigs) {
          this.activeTabIndex = index
        } else {
          this.activeTabIndex = index - 1
        }

        this.allGridConfigs.splice(index, 1)
        if (this.allGridConfigs.length == 0) {
          this.activeTabIndex = -1
        }
      } else {
        this.refreshSetTable()
      }
    },
    saveSetTable() {
      if (this.currentTableName != '新增表') {
        let inserted = [], updated = []
        const currentRows = JSON.parse(JSON.stringify(this.currentConfig.data))
        currentRows.forEach(item => {
          if (item.isInsert) {
            delete item.isInsert
            delete item.isEdit
            inserted.push(item)
          } else if (item.isEdit) {
            delete item.isEdit
            updated.push(item)
          }
        })
        const params = {
          databaseName: this.currentConfig.databaseName,
          tableName: this.currentConfig.tableName
        }
        if (inserted.length) {
          params.inserted = JSON.stringify(inserted)
        }
        if (updated.length) {
          params.updated = JSON.stringify(updated)
        }
        this.tableLoading = true
        fetch({
          url: `/table/designTableUpdate/${this.sourceId}`,
          method: 'post',
          data: params
        }).then(res => {
          this.tableLoading = false
          res = res.data
          if (res.code == '200') {
            Message({
              message: '保存成功！',
              type: 'success',
              duration: 3000
            })
            this.refreshSetTable()
          } else {
            Message({
              message: res.message,
              type: 'error',
              duration: 5000
            })
          }
        })
      } else {
        this.$prompt('请输入表名', '新增表名', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
          this.fullScreenLoading = this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.3)'
          })
          const inserted = { total: '', rows: [] }
          const data = this.allGridConfigs[this.activeTabIndex].data
          inserted.total = data.length
          inserted.rows = JSON.parse(JSON.stringify(data)).map(item => {
            delete item.isInsert
            delete item.isEdit
            return Object.assign({}, item)
          })
          const params = {
            databaseName: this.mouseRightTableInfo.database.name,
            tableName: value,
            inserted: JSON.stringify(inserted)
          }
          fetch({
            url: `table/saveNewTable/${this.sourceId}`,
            method: 'post',
            data: params
          }).then(res => {
            this.fullScreenLoading.close()
            res = res.data
            if (res.code == '200') {
              this.allGridConfigs[this.activeTabIndex].tableName = value
              this.refreshSetTable()
              this.getTreeConfig()
              Message({
                message: `新增表${value}成功`,
                type: 'success',
                duration: 3000
              })
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          })
        }).catch(() => {

        })
      }
    },
    backup() {
      let num = 0
      this.allGridConfigs.forEach((item, index) => {
        if (item.type == 'backup') {
          num++
          this.activeTabIndex = index
        }
      })
      if (num == 0) {
        this.allGridConfigs.push({
          type: 'backup',
          tableName: '备份/还原'
        })
        this.activeTabIndex = this.allGridConfigs.length - 1
        this.$nextTick(() => {
          var tabBoxWidth = $('.tab-box').outerWidth()
          var scrollLeft = $('.tab-box').scrollLeft()
          var left = scrollLeft + tabBoxWidth
          $('.tab-box').animate({ scrollLeft: left }, 300)
        })
      }
    },
    monitor() {
      let num = 0
      this.allGridConfigs.forEach((item, index) => {
        if (item.type == 'monitor') {
          num++
          this.activeTabIndex = index
        }
      })
      if (num == 0) {
        this.allGridConfigs.push({
          type: 'monitor',
          tableName: '状态监控'
        })
        this.activeTabIndex = this.allGridConfigs.length - 1
        this.$nextTick(() => {
          var tabBoxWidth = $('.tab-box').outerWidth()
          var scrollLeft = $('.tab-box').scrollLeft()
          var left = scrollLeft + tabBoxWidth
          $('.tab-box').animate({ scrollLeft: left }, 300)
        })
      }
    },
    // datebasebSet() {
    //   let num = 0
    //   this.allGridConfigs.forEach((item, index) => {
    //     if (item.type == 'databaseSet') {
    //       num++
    //       this.activeTabIndex = index
    //     }
    //   })
    //   if (num == 0) {
    //     this.allGridConfigs.push({
    //       type: 'databaseSet',
    //       tableName: '数据库配置'
    //     })
    //     this.activeTabIndex = this.allGridConfigs.length - 1
    //     this.$nextTick(() => {
    //       var tabBoxWidth = $('.tab-box').outerWidth()
    //       var scrollLeft = $('.tab-box').scrollLeft()
    //       var left = scrollLeft + tabBoxWidth
    //       $('.tab-box').animate({ scrollLeft: left }, 300)
    //     })
    //   }
    // },
    changeTable(obj, bool) {
      const viewType = bool ? 'viewTable' : 'table'
      let t = obj.table, b = obj.database
      let num = 0
      this.allGridConfigs.forEach((gridItem, index) => {
        if (
          gridItem.databaseName == b.name &&
          gridItem.tableName == t.name &&
          (gridItem.type == 'table' || gridItem.type == 'viewTable')
        ) {
          num++
          this.activeTabIndex = index
        }
      })
      if (num > 0) {

      } else if (num == 0) {
        this.allGridConfigs.push({
          type: viewType,
          databaseName: b.name,
          tableName: t.name,
          primaryKey: '',
          selectedArr: [],
          pageNo: 1,
          total: 1,
          pageSize: 15,
          order: '',
          orderBy: '',
          columnHeads: [],
          data: []
        })
        this.activeTabIndex = this.allGridConfigs.length - 1
        this.$nextTick(() => {
          var tabBoxWidth = $('.tab-box').outerWidth()
          var scrollLeft = $('.tab-box').scrollLeft()
          var left = scrollLeft + tabBoxWidth
          $('.tab-box').animate({ scrollLeft: left }, 300)
        })
        this.ishowArr.push({
          show: false
        });
        this.ishow = false;
        this.refreshTable()
      }
    },
    tableRename(obj) {
      const bName = obj.database.name, tName = obj.table.name
      this.$prompt('新表名', '提示', {
        inputValue: tName,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        if (value.toString().trim() == '') {
          Message({
            message: '表名不能为空',
            type: 'warning',
            duration: 3000
          })
        } else {
          this.fullScreenLoading = this.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.3)'
          })
          fetch({
            url: `table/renameTable/${this.sourceId}`,
            method: 'post',
            data: {
              databaseName: bName,
              tableName: tName,
              newTableName: value
            }
          }).then(res => {
            this.fullScreenLoading.close()
            res = res.data
            if (res.code == '200') {
              Message({
                message: '操作成功',
                type: 'success',
                duration: 3000
              })
              this.getTreeConfig()
            } else {
              Message({
                message: res.message,
                type: 'error',
                duration: 5000
              })
            }
          })
        }
      }).catch(() => {

      })
    },
    copyTable(obj) {
      const bName = obj.database.name, tName = obj.table.name
      this.fullScreenLoading = this.$loading({
        lock: true,
        text: '复制中，请稍等...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.3)'
      })
      fetch({
        url: `table/copyTable/${this.sourceId}`,
        method: 'post',
        data: {
          databaseName: bName,
          tableName: tName
        }
      }).then(res => {
        this.fullScreenLoading.close()
        res = res.data
        if (res.code == '200') {
          Message({
            message: '复制成功',
            type: 'success',
            duration: 3000
          })
          this.getTreeConfig()
        } else {
          Message({
            message: res.message,
            type: 'error',
            duration: 5000
          })
        }
      })
    },
    deleteTable(obj) {
      let bName = obj.database.name, tName = obj.table.name
      this.$confirm(`你确定要删除表${tName}吗?`, '操作提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fullScreenLoading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        })
        fetch({
          url: `/table/dropTable/${this.sourceId}`,
          method: 'post',
          data: {
            databaseName: bName,
            tableName: tName
          }
        }).then(res => {
          res = res.data
          this.fullScreenLoading.close()
          if (res.code == '200') {
            Message({
              message: '删除表成功',
              type: 'success',
              duration: 3000
            })
            // 关闭选项卡
            let len = 0
            for (let i = 0; i < (this.allGridConfigs.length + len); i++) {
              if (tName == this.allGridConfigs[i - len].tableName) {
                this.deleteTab(i - len)
                len++
              }
            }
            this.getTreeConfig()
          } else {
            Message({
              message: res.message,
              type: 'error',
              duration: 5000
            })
          }
        })
      })
    },
    emptyTable(obj) {
      let bName = obj.database.name, tName = obj.table.name
      this.$confirm(`你确定要清空表${tName}吗?`, '操作提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.fullScreenLoading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.3)'
        })
        fetch({
          url: `table/clearTable/${this.sourceId}`,
          method: 'post',
          data: {
            databaseName: bName,
            tableName: tName
          }
        }).then(res => {
          this.fullScreenLoading.close()
          res = res.data
          if (res.code == '200') {
            Message({
              message: '清空表成功',
              type: 'success',
              duration: 3000
            })
            this.refreshTable()
          } else {
            Message({
              message: res.message,
              type: 'error',
              duration: 5000
            })
          }
        })
      })
    },
    tableInfo(obj) {
      let bName = obj.database.name, tName = obj.table.name
      let num = 0
      const length = this.allGridConfigs.length
      for (let i = 0; i < length; i++) {
        if (this.allGridConfigs[i].databaseName == bName &&
          this.allGridConfigs[i].tableName == tName &&
          this.allGridConfigs[i].type == 'tableInfo') {
          num++
          this.activeTabIndex = i
        }
      }

      if (num > 0) {
        return
      } else if (num == 0) {
        this.allGridConfigs.push({
          type: 'tableInfo',
          databaseName: bName,
          tableName: tName,
          selectedArr: [],
          pageNo: 1,
          total: 1,
          pageSize: 15,
          columnHeads: [{ label: '名称', field: 'propName', width: 200 }, { label: '信息', field: 'propValue' }],
          data: []
        })
        this.activeTabIndex = this.allGridConfigs.length - 1

        this.$nextTick(() => {
          var tabBoxWidth = $('.tab-box').outerWidth()
          var scrollLeft = $('.tab-box').scrollLeft()
          var left = scrollLeft + tabBoxWidth
          $('.tab-box').animate({ scrollLeft: left }, 300)
        })
        this.refreshTableInfo()
      }
    },
    refreshTableInfo() {
      this.tableLoading = true
      fetch({
        url: `table/viewTableMess/${this.currentTableName}/${this.currentDatabaseName}/${this.sourceId}`,
        method: 'get'
      }).then(res => {
        this.tableLoading = false
        res = res.data
        this.allGridConfigs[this.activeTabIndex].data = res.data.rows
      })
    },
    getMouseRightTableInfo(mouseRightTableInfo) {
      this.mouseRightTableInfo = mouseRightTableInfo
    },
    setView(obj) {
      fetch({
        url: `table/getViewSql/${this.sourceId}`,
        method: 'post',
        data: {
          databaseName: obj.database.name,
          tableName: obj.table.name
        }
      }).then(res => {
        res = res.data
        if (res.code == '200') {
          this.activeTabIndex = -1
          this.$nextTick(() => {
            this.editor.setValue(res.data.viewSql)
          })
        } else {
          this.$alert(res.message, '提示', {
            confirmButtonText: '确定'
          })
        }
      })
    },
    addTable(obj) {
      let bName = obj.database.name, tName = '新增表'
      let num = 0
      const length = this.allGridConfigs.length
      for (var i = 0; i < length; i++) {
        if (this.allGridConfigs[i].databaseName == bName &&
          this.allGridConfigs[i].tableName == tName &&
          this.allGridConfigs[i].type == 'setTable') {
          num++
          this.activeTabIndex = i
        }
      }
      if (num == 0) {
        this.allGridConfigs.push({
          type: 'setTable',
          databaseName: bName,
          tableName: tName,
          selectedArr: [],
          pageNo: 1,
          total: 1,
          pageSize: 15,
          columnHeads: [{
            label: '字段名',
            field: 'COLUMN_NAME',
            width: '220'
          }, { label: '类型', field: 'DATA_TYPE', width: '200' }, {
            label: '长度',
            field: 'CHANGDU',
            width: '100'
          }, {
            label: '精度',
            field: 'JINGDU',
            width: '100'
          }, { label: '注释', field: 'COLUMN_COMMENT' }, {
            label: '允许空值',
            field: 'IS_NULLABLE',
            width: '100'
          }, { label: '主键设置', field: 'COLUMN_KEY', width: '100' }],
          data: []
        })
        this.activeTabIndex = this.allGridConfigs.length - 1

        const row = {
          CHARACTER_MAXIMUM_LENGTH: null,
          COLUMN_COMMENT: '',
          COLUMN_DEFAULT: null,
          COLUMN_KEY: '',
          COLUMN_NAME: '',
          COLUMN_TYPE: '',
          DATA_TYPE: '',
          IS_NULLABLE: 'NO',
          NUMERIC_PRECISION: '',
          NUMERIC_SCALE: '',
          TREESOFTPRIMARYKEY: '',
          extra: '',
          CHANGDU: '',
          JINGDU: ''
        }
        row.isInsert = true
        this.allGridConfigs[this.activeTabIndex].data.push(row)

        this.$nextTick(() => {
          var tabBoxWidth = $('.tab-box').outerWidth()
          var scrollLeft = $('.tab-box').scrollLeft()
          var left = scrollLeft + tabBoxWidth
          $('.tab-box').animate({ scrollLeft: left }, 300)
        })
        this.ishowArr.push({
          show: false
        });
        this.ishow = false;
      }
    },
    toggleTab(index) {
      if (this.activeTabIndex == index) {
        return
      }
      this.activeTabIndex = index
      this.ishow = this.ishowArr[index].show;
    },
    // 关闭选项卡
    deleteTab(index) {
      if (index == this.activeTabIndex) {
        if (index + 1 in this.allGridConfigs) {
          this.activeTabIndex = index
        } else {
          this.activeTabIndex = index - 1
        }
      } else if (index > this.activeTabIndex) {

      } else if (index < this.activeTabIndex) {
        this.activeTabIndex--
      }
      this.allGridConfigs.splice(index, 1)
      if (this.allGridConfigs.length == 0) {
        this.activeTabIndex = -1
      }
      this.ishowArr.splice(index, 1);
      let show;
      if (this.allGridConfigs.length > 0 && this.allGridConfigs[this.activeTabIndex].type == 'table') {
        show = this.ishowArr[this.activeTabIndex].show;
        this.refreshTable();
        this.ishow = show;
      } else if (this.allGridConfigs.length > 0 && this.allGridConfigs[this.activeTabIndex].type == 'setTable') {
        show = this.ishowArr[this.activeTabIndex].show;
        this.refreshSetTable();
        this.ishow = show;
      }
    },
    getMouseRightIndex(index) {
      this.mouseRightIndex = index
    }
  }
}
</script>
<style lang="scss">
.database img {
  vertical-align: middle;
}

::-webkit-scrollbar {
  width: 8px;
  background-color: transparent;
  border-radius: 4px;
  height: 8px;
}

/*定义滚动条轨道 内阴影+圆角*/

::-webkit-scrollbar-track {
  background-color: transparent;
  border: none;
  border-radius: 4px;
}

/*定义滑块 内阴影+圆角*/

::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: #ddd;
  background-color: rgba(222, 222, 222, 0.7);
}

::-webkit-scrollbar-thumb:hover {
  border-radius: 4px;
  /*background-color:#35baf6;*/
  background-color: #aaa;
}

.handle-no-data {
  .el-table__empty-block {
    border: 1px solid #ebeef5;
    height: 60px;
    border-top: none;
  }
}

.el-checkbox {
  color: #ffffff;
}
</style>
<style lang="scss" scoped>
/deep/ #editor .CodeMirror {
  height: calc(100% - 40px);
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

/deep/ .resultBox .CodeMirror {
  height: 100%;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}
/deep/.tableDetail .el-input--medium .el-input__inner {
  height: 26px;
  line-height: 26px;
}
/deep/.tableDetail .el-icon-arrow-up:before {
  position: absolute;
  top: -5px;
}

.tableDetail .dropdown-class .el-button {
  border-radius: 0 3px 3px 0;
  border-left-color: rgba(255, 255, 255, 0.5);
}
.tableDetail .refresh-table {
  border-radius: 0;
}

//数据库页面主题色class定义
$themeBg1: #f0f2f5;
$themeColor1: #000;
$themeBorder1: #d8dce5;

$darkC: #000;
$lightC: #fff;

.theme1 {
  .border {
    border: 1px solid $themeBorder1;
  }

  .themeBg {
    background-color: $themeBg1;
  }

  .themeC {
    color: $themeColor1;
  }

  .text {
    color: $darkC;
  }
}

.database {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .tdText {
    /*background-color: transparent;*/
    /*position: absolute;
    top: 1px;
    left: 1px;
    right: 1px;
    bottom: 1px;*/
    height: 28px;
    width: 100%;
    border: 1px solid transparent;
    outline: none;
    padding: 0 8px;
    border-radius: 3px;

    &:focus {
      border-color: #409eff;
    }

    &.new {
      border-color: #409eff;
    }
  }

  #mainContent {
    flex: 1;
    display: flex;
    height: 100%;

    #centerContent {
      flex: 1;
      width: 1px; //该样式是为了限制flex为1的div被撑大
      #editor {
        width: 100%;
        height: 40%;

        .txt {
          width: 100%;
          height: calc(100% - 50px);
        }
      }

      #result {
        width: 100%;
        height: 60%;
        padding-top: 6px;

        .resultBox {
          height: calc(100% - 65px);

          & > div {
            height: 100%;
          }
          .resultTable {
            .pagination {
              text-align: right;
              padding-right: 20px;
              .pagination-container {
                padding: 0;
                margin-top: 20px;
              }
            }
          }
        }

        .title {
          font-size: 14px;
          height: 30px;
          padding-left: 10px;
          line-height: 30px;
          border-top: 1px solid #ddd;
          border-bottom: 1px solid #ddd;
        }

        .resultTabs {
          height: 35px;
          padding-top: 4px;
          background-color: #f0f2f5;
          border-bottom: 1px solid #ddd;

          .tabSign {
            height: 30px;
            line-height: 30px;
            padding-left: 28px;
            padding-right: 28px;
            position: relative;
            overflow: hidden;

            .resTabItem {
              display: inline-block;
              padding-left: 10px;
              padding-right: 10px;
              border: 1px solid #ddd;
              border-top-left-radius: 6px;
              border-top-right-radius: 6px;
              border-bottom: none;
              background-color: #eff1f5;
              cursor: pointer;

              span {
                font-size: 14px;
                vertical-align: middle;
              }

              i {
                margin-left: 3px;
                display: inline-block;
                width: 16px;
                height: 16px;
                font-size: 10px;
                line-height: 16px;
                border-radius: 50%;
                text-align: center;
                transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
                transform-origin: 100% 50%;

                &:before {
                  transform: scale(0.8);
                  display: inline-block;
                }

                &:hover {
                  background-color: #b4bccc;
                  color: #fff;
                }
              }

              &.active {
                background-color: #fff;
                /* border-bottom: 1px solid #fff; */
              }
            }
          }
        }
      }

      .home {
        height: 100%;
      }

      #tBox {
        height: calc(100% - 35px);
        padding: 6px 0;
        overflow: hidden;

        .tableDetail {
          width: 100%;
          height: 100%;
        }
      }

      .pageTabs {
        height: 35px;
        background-color: #f0f2f5;
        padding-top: 4px;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        ul.pageSign {
          height: 30px;
          line-height: 30px;
          padding-left: 28px;
          padding-right: 28px;
          position: relative;
          overflow: hidden;
          width: calc(100% - 200px);
          p.iconBox2 {
            display: none;
            position: absolute;
            right: 0;
            top: 0;
            width: 28px;
            height: 35px;
            text-align: center;
            line-height: 38px;
            cursor: pointer;

            &:hover {
              i {
                color: #000;
              }
            }

            i {
              color: #888;
              font-size: 18px;
            }
          }

          p.iconBox {
            display: none;
            position: absolute;
            left: 0;
            top: 0;
            width: 28px;
            height: 35px;
            text-align: center;
            line-height: 38px;
            cursor: pointer;

            &:hover {
              i {
                color: #000;
              }
            }

            i {
              color: #888;
              font-size: 18px;
            }
          }

          .tab-box {
            /*height: 44px;*/
            white-space: nowrap;
            overflow-x: auto;

            .center-tab {
              li:not(:first-child) {
                margin-left: 4px;
              }
            }
          }

          li {
            /*float: left;*/
            display: inline-block;
            padding-left: 10px;
            padding-right: 10px;
            border: 1px solid #ddd;
            /*margin-left: 5px;*/
            border-top-left-radius: 6px;
            border-top-right-radius: 6px;
            border-bottom: none;
            background-color: #eff1f5;
            cursor: pointer;

            img {
              margin-right: 5px;
            }

            span {
              font-size: 12px;
              vertical-align: middle;
            }

            &.active {
              background-color: #fff;
              /*border-bottom: 1px solid #fff;*/
            }

            .el-icon-close {
              margin-left: 3px;
              display: inline-block;
              width: 16px;
              height: 16px;
              font-size: 10px;
              line-height: 16px;
              border-radius: 50%;
              text-align: center;
              transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
              transform-origin: 100% 50%;

              &:before {
                transform: scale(0.8);
                display: inline-block;
              }

              &:hover {
                background-color: #b4bccc;
                color: #fff;
              }
            }
          }
        }
        .toolbox {
          display: flex;
          align-items: top;
          margin-right: 20px;
        }
      }
    }
  }

  .toolBar {
    height: 30px;
    padding: 0 5px;
    background-color: #f0f2f5;
    border-bottom: 1px solid $themeBorder1;
    background: -webkit-linear-gradient(top, #fff 0, $themeBg1 100%);
    background: -moz-linear-gradient(top, #fff 0, $themeBg1 100%);
    background: -o-linear-gradient(top, #fff 0, $themeBg1 100%);
    background: linear-gradient(to bottom, #fff 0, $themeBg1 100%);

    .viewControl {
      float: right;
      height: 100%;
      font-size: 14px;

      .fullToggle {
        padding: 0 6px;
        display: inline-block;
        background: transparent;
        border: 0;
        border-radius: 5px 5px 5px 5px;
        height: 26px;
        line-height: 26px;
        margin-top: 2px;
        cursor: pointer;

        &:hover {
          background: #fff;
        }
      }
    }
  }
}
.el-dropdown-menu--medium .el-dropdown-menu__item {
  font-size: 12px;
}
</style>
