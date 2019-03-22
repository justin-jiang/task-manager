<template>
  <el-tabs
    type="card"
    class="tabs-main"
    v-model="activeTabName"
    v-loading="!isInitialized"
  >
    <!-- Task Hall -->
    <el-tab-pane
      label="任务大厅"
      :name="readyToApplyTaskTabName"
    >
      <el-row class="row-condition">
        <el-col
          :span="2"
          style="margin-top:10px;"
        >
          <span>查询条件：</span>
        </el-col>
        <el-col :span="4">
          <el-select
            clearable
            multiple
            filterable
            v-model="provinceFilter"
            placeholder="省份（默认为全部）"
          >
            <el-option
              v-for="item in provinces"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            clearable
            v-model="publishTimeFilter"
            placeholder="发布时间（默认为全部）"
          >
            <el-option
              v-for="item in publishTimes"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            clearable
            v-model="rewardFilter"
            placeholder="金额（默认为全部）"
            @change="onRewardChanged"
            @clear="onRewardCleared"
          >
            <el-option
              v-for="item in rewards"
              :key="item.label"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row class="row-condition">
        <el-col
          :span="2"
          style="margin-top:15px;"
        >
          <span>排序条件：</span>
        </el-col>
        <el-col
          :span="12"
          style="margin-top:10px"
        >
          <el-radio-group
            v-model="sortFieldRadio"
            size="small"
          >
            <div class="div-radio-button">
              <el-radio-button :label="publishTimeSortField">发布时间</el-radio-button>
            </div>
            <div class="div-radio-button">
              <el-radio-button :label="deadlineSortField">截止时间</el-radio-button>
            </div>
            <div class="div-radio-button">
              <el-radio-button :label="rewardSortField">金额</el-radio-button>
            </div>
            <div class="div-radio-button">
              <el-radio-button :label="depositSortField">保证金</el-radio-button>
            </div>
          </el-radio-group>
        </el-col>

      </el-row>
      <div v-if="readyToApplyTaskObjs.length>0">
        <el-row
          class="row-task"
          v-for="item in readyToApplyTaskObjs"
          :key="item.uid"
        >
          <el-row class="row-task-item">
            <el-col
              :span="10"
              style="font-size:30px"
            >
              {{item.name}}
            </el-col>
            <el-col
              :span="10"
              class="col-task-vertical-align"
            >
              <el-button
                type="primary"
                plain
                size="small"
                @click="onTaskApply(item)"
              >申请</el-button>
            </el-col>
          </el-row>
          <el-row class="row-task-item">
            <el-col
              :span="2"
              style="font-size:30px;color:red"
            >￥{{item.reward}}</el-col>
            <el-col
              :span="2"
              class="col-task-vertical-align"
            >保证金：</el-col>
            <el-col
              :span="2"
              class="col-task-vertical-align"
            >￥{{item.reward}}</el-col>
            <el-col
              :span="2"
              class="col-task-vertical-align"
            >截止时间：</el-col>
            <el-col
              :span="2"
              class="col-task-vertical-align col-task-vertical-align-datetime"
            >{{deadlineToText(item.deadline)}}</el-col>
            <el-col
              :span="2"
              class="col-task-vertical-align"
            >所在区域：</el-col>
            <el-col
              :span="4"
              class="col-task-vertical-align"
            >{{item.province}}-{{item.city}}</el-col>
          </el-row>
          <el-row class="row-task-item">
            <el-col :span="24">{{item.note}}</el-col>
          </el-row>
        </el-row>
      </div>
      <div v-else>
        <el-row class="row-task">
          <el-col :span="24">没有可申请任务</el-col>
        </el-row>
      </div>

    </el-tab-pane>

    <el-tab-pane
      label="任务列表"
      :name="appliedTaskTabName"
    >
      <!-- Radio Button Group for applied Task table -->
      <el-row>
        <el-col
          :span="20"
          style="margin-top:10px"
        >
          <el-radio-group
            v-model="taskStateRadio"
            size="small"
          >
            <div class="div-radio-button">
              <el-radio-button :label="allTasksLab">全部</el-radio-button>
            </div>

            <el-badge
              v-if="toBeInsuredTasksCount>0"
              :value="toBeInsuredTasksCount"
              class="div-radio-button"
            >
              <el-radio-button :label="toBeInsuredTasksLab">待投保</el-radio-button>
            </el-badge>
            <div
              v-else
              class="div-radio-button"
            >
              <el-radio-button :label="toBeInsuredTasksLab">待投保</el-radio-button>
            </div>

            <el-badge
              v-if="toBeSubmitResultTasksCount>0"
              :value="toBeSubmitResultTasksCount"
              class="div-radio-button"
            >
              <el-radio-button :label="toBeSubmitResultTasksLab">待交付</el-radio-button>
            </el-badge>
            <div
              v-else
              class="div-radio-button"
            >
              <el-radio-button :label="toBeSubmitResultTasksLab">待交付</el-radio-button>
            </div>

            <div class="div-radio-button">
              <el-radio-button :label="completedTasksLab">完结</el-radio-button>
            </div>
          </el-radio-group>
        </el-col>
      </el-row>
      <!-- Task Table -->
      <el-row>
        <el-col :span="24">
          <el-table
            :ref="appliedTaskTableName"
            :data="filteredappliedTaskObjs"
            style="width: 100%"
            @row-click="onRowClick"
          >
            <el-table-column type="expand">
              <template slot-scope="props">
                <TaskDetailInTableVue :dataProp="props.row"></TaskDetailInTableVue>
              </template>
            </el-table-column>
            <el-table-column
              label="名称"
              prop="name"
              width="400px"
            >
            </el-table-column>
            <el-table-column
              label="金额"
              prop="reward"
              width="100px"
            >
            </el-table-column>
            <el-table-column
              label="状态"
              width="100px"
            >
              <template slot-scope="scope">
                <span>{{taskStateToText(scope.row.state)}}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="创建时间"
              width="200px"
            >
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
                  v-model="appliedTaskSearch"
                  size="mini"
                  placeholder="名称搜索"
                />
              </template>
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  plain
                  size="mini"
                  v-if="isTaskApplying(scope.$index, scope.row)"
                  @click.stop="onApplyingReleased(scope.$index, scope.row)"
                >释放任务</el-button>
                <el-button
                  type="primary"
                  plain
                  size="mini"
                  v-if="isTaskApplying(scope.$index, scope.row)"
                  @click.stop="onMarginUpload(scope.$index, scope.row)"
                >保证金托管</el-button>
                <el-button
                  type="primary"
                  plain
                  size="mini"
                  v-if="isTaskAssigned(scope.$index, scope.row)"
                  @click.stop="onSelectTaskResultUpload(scope.$index, scope.row)"
                >提交任务结果</el-button>
                <el-button
                  type="primary"
                  size="mini"
                  plain
                  @click.stop="onTaskProgressCheck(scope.$index, scope.row)"
                >进度查询</el-button>
                <el-button
                  type="primary"
                  size="mini"
                  plain
                  @click.stop="onTaskDetailCheck(scope.$index, scope.row)"
                >任务详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <!-- dialog to upload result -->
      <TaskResultUploadDialogVue
        :visibleProp="taskResultDialogVisible"
        :taskProp="selectedTask"
        @success="onTaskResultUploadSuccess"
        @cancel="onTaskResultCancel"
      >
      </TaskResultUploadDialogVue>

      <!-- dialog to upload the margin image -->
      <MarginDialogVue
        :visibleProp="marginDialogVisible"
        :taskProp="selectedTask"
        @cancelled="onMarginUploadCancelled"
        @success="onMarginUploadSuccess"
      >
      </MarginDialogVue>

      <!-- task progress check dialog -->
      <TaskProgressDialogVue
        :visibleProp="taskProgressDialogVisible"
        :taskProp="selectedTask"
        @closed="onTaskProgressDialogClosed"
      >
      </TaskProgressDialogVue>
    </el-tab-pane>
  </el-tabs>

</template>

<script lang="ts">
import { ExecutorTaskTS } from "./ExecutorTaskTS";
export default class ExecutorTaskVue extends ExecutorTaskTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.row-condition {
  text-align: left;
}
.div-radio-button {
  display: inline-block;
  margin-right: 5px;
}
.row-task {
  margin-top: 20px;
  border-top: 1px solid cadetblue;
  border-bottom: 1px solid cadetblue;
  .row-task-item {
    text-align: left;
    margin-top: 5px;
  }
}
.col-task-vertical-align {
  margin-top: 10px;
}
.col-task-vertical-align-datetime {
  margin-top: 12px;
}
</style>
