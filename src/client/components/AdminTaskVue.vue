<template>
  <el-tabs
    type="border-card"
    style="min-height:600px; padding:0px;"
    v-model="activeTabName"
  >
    <el-tab-pane
      label="待审批任务发布"
      :name="newTaskToBeCheckTabName"
    >
      <el-table
        :data="newTaskObjs.filter(data => !newTaskSearch || data.name.toLowerCase().includes(newTaskSearch.toLowerCase()))"
        style="width: 100%"
      >
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-row>
              <el-col :span="1">
                名称:
              </el-col>
              <el-col :span="4">
                {{props.row.name}}
              </el-col>
              <el-col :span="1">
                金额:
              </el-col>
              <el-col :span="4">
                {{props.row.reward}}
              </el-col>
              <el-col :span="1">
                状态:
              </el-col>
              <el-col :span="4">
                {{taskStateToText(props.row.state)}}
              </el-col>
              <el-col :span="1">
                发布人:
              </el-col>
              <el-col :span="4">
                {{ props.row.publisherName }}
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="6">
                任务对象所在区域:
              </el-col>
              <el-col :span="4">
                {{ locationToText(props.row) }}
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="1">
                申请人:
              </el-col>
              <el-col :span="4">
                {{ applicantName(props.row.applicantName) }}
              </el-col>
              <el-col :span="1">
                执行人:
              </el-col>
              <el-col :span="4">
                {{ executorName(props.row.executorName) }}
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="1">
                备注:
              </el-col>
              <el-col :span="23">
                {{ props.row.note }}
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column
          label="名称"
          prop="name"
        >
        </el-table-column>
        <el-table-column
          label="酬劳"
          prop="reward"
        >
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <span>{{taskStateToText(scope.row.state)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间">
          <template slot-scope="scope">
            <span>{{timestampToText(scope.row.createTime)}}</span>
          </template>
        </el-table-column>
        <el-table-column align="right">
          <template
            slot="header"
            slot-scope="scope"
          >
            <el-input
              v-if="isSearchReady(scope.row)"
              v-model="newTaskSearch"
              size="mini"
              placeholder="输入关键字搜索"
            />
          </template>
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="onTaskAuditApproved(scope.row)"
            >批准发布</el-button>
            <el-button
              type="danger"
              size="mini"
              @click="onTaskAuditDenied(scope.row)"
            >拒绝发布</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>

    <el-tab-pane
      label="待审批任务申请"
      :name="newApplyToBeCheckTabName"
    >
      <el-row>
        <el-col :span="24">
          <el-table
            :data="newTaskApplyObjs.filter(data => !newTaskApplySearch || data.name.toLowerCase().includes(newTaskApplySearch.toLowerCase()))"
            style="width: 100%"
          >
            <el-table-column type="expand">
              <template slot-scope="props">
                <el-row>
                  <el-col :span="1">
                    名称:
                  </el-col>
                  <el-col :span="4">
                    {{props.row.name}}
                  </el-col>
                  <el-col :span="1">
                    金额:
                  </el-col>
                  <el-col :span="4">
                    {{props.row.reward}}
                  </el-col>
                  <el-col :span="1">
                    状态:
                  </el-col>
                  <el-col :span="4">
                    {{taskStateToText(props.row.state)}}
                  </el-col>
                  <el-col :span="1">
                    发布人:
                  </el-col>
                  <el-col :span="4">
                    {{ props.row.publisherName }}
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="6">
                    任务对象所在区域:
                  </el-col>
                  <el-col :span="4">
                    {{ locationToText(props.row) }}
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="1">
                    申请人:
                  </el-col>
                  <el-col :span="4">
                    {{ applicantName(props.row.applicantName) }}
                  </el-col>
                  <el-col :span="1">
                    执行人:
                  </el-col>
                  <el-col :span="4">
                    {{ executorName(props.row.executorName) }}
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="1">
                    备注:
                  </el-col>
                  <el-col :span="23">
                    {{ props.row.note }}
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column
              label="名称"
              prop="name"
            >
            </el-table-column>
            <el-table-column
              label="酬劳"
              prop="reward"
            >
            </el-table-column>
            <el-table-column label="状态">
              <template slot-scope="scope">
                <span>{{taskStateToText(scope.row.state)}}</span>
              </template>
            </el-table-column>
            <el-table-column align="right">
              <template
                slot="header"
                slot-scope="scope"
              >
                <el-input
                  v-if="isSearchReady(scope.row)"
                  v-model="newTaskApplySearch"
                  size="mini"
                  placeholder="输入关键字搜索"
                />
              </template>
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  :disabled="!isTaskApplied(scope.$index, scope.row)"
                  @click="onSelectTaskResultUpload(scope.$index, scope.row)"
                >提交任务结果</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-tab-pane>
  </el-tabs>

</template>

<script lang="ts">
import { AdminTaskTS } from "./AdminTaskTS";
export default class AdminTaskVue extends AdminTaskTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
