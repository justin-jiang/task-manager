<template>
  <div>
    <!-- task radio button group -->
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
            v-if="toBeSubmittedTasksCount>0"
            :value="toBeSubmittedTasksCount"
            class="div-radio-button"
          >
            <el-radio-button :label="toBeSubmittedTasksLab">待提交</el-radio-button>
          </el-badge>
          <div
            v-else
            class="div-radio-button"
          >
            <el-radio-button :label="toBeSubmittedTasksLab">待提交</el-radio-button>
          </div>

          <el-badge
            v-if="toBeDepositedTasksCount>0"
            :value="toBeDepositedTasksCount"
            class="div-radio-button"
          >
            <el-radio-button :label="toBeDepositedTasksLab">待托管</el-radio-button>
          </el-badge>
          <div
            v-else
            class="div-radio-button"
          >
            <el-radio-button :label="toBeDepositedTasksLab">待托管</el-radio-button>
          </div>

          <el-badge
            v-if="toBePublisherAcceptTasksCount>0"
            :value="toBePublisherAcceptTasksCount"
            class="div-radio-button"
          >
            <el-radio-button :label="toBePublisherAcceptTasksLab">待验收</el-radio-button>
          </el-badge>
          <div
            v-else
            class="div-radio-button"
          >
            <el-radio-button :label="toBePublisherAcceptTasksLab">待验收</el-radio-button>
          </div>

          <div class="div-radio-button">
            <el-radio-button :label="completedTasksLab">完结</el-radio-button>
          </div>
        </el-radio-group>
      </el-col>
      <el-col :span="4">
        <el-button
          type="success"
          icon="el-icon-plus"
          @click="onTaskCreate()"
        >创建新任务</el-button>
      </el-col>
    </el-row>

    <!-- task table -->
    <el-row>
      <el-col :span="24">
        <el-table
          style="width: 100%"
          stripe
          :ref="taskTableName"
          :data="filtredTaskObjs"
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
                v-model="search"
                size="mini"
                placeholder="任务名称搜索"
              />
            </template>
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                plain
                v-if="isToBeDeposited(scope.$index, scope.row)"
                @click="onDeposit(scope.$index, scope.row)"
              >资金托管</el-button>
              <el-button
                type="primary"
                size="mini"
                plain
                v-if="isTaskResultPassed(scope.$index, scope.row)"
                @click="onTaskResultCheck(scope.$index, scope.row)"
              >验收确认</el-button>
              <el-button
                type="primary"
                size="mini"
                plain
                @click="onTaskProgressCheck(scope.$index, scope.row)"
              >进度查询</el-button>

              <el-button
                type="primary"
                size="mini"
                plain
                v-if="!isNotSubmitted(scope.$index, scope.row)"
                @click="onTaskDetailCheck(scope.$index, scope.row)"
              >任务详情</el-button>
              <el-button
                size="mini"
                type="primary"
                plain
                v-if="isNotSubmitted(scope.$index, scope.row)"
                @click="onTaskEdit(scope.$index, scope.row)"
              >编辑</el-button>

              <el-button
                size="mini"
                type="primary"
                v-if="isNotSubmitted(scope.$index, scope.row)"
                @click="onSubmit(scope.$index, scope.row)"
              >提交</el-button>

              <el-button
                size="mini"
                type="danger"
                v-if="isNotDeposited(scope.$index, scope.row)"
                @click="onTaskDelete(scope.$index, scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- dialog to set task result rate -->
    <FileCheckDialogVue
      titleProp="尽调结果验收"
      :scenarioProp="3"
      :targetFileUidProp="selectedTask.resultFileUid"
      :visibleProp="taskResultCheckDialogVisible"
      @submitted="onTaskResultCheckSubmit"
      @cancelled="onTaskResultCheckCancelled"
      @download="onTaskResultDownload"
    >
    </FileCheckDialogVue>

    <!-- dialog to create or edit task -->
    <el-dialog
      width="50%"
      :title="taskCreateOrEditDialogTitle"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="taskCreateOrEditDialogVisible"
    >
      <el-row>
        <el-col :span="24">
          <TaskFormVue
            :taskViewProp="selectedTask"
            :usageSenario="usageSenario"
            @success="onTaskCreateOrEditSuccess"
            @cancelled="onTaskCreateOrEditCancelled"
          ></TaskFormVue>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- dialog to deposit and upload the deposit image -->
    <DepositDialogVue
      :visibleProp="depositDialogVisible"
      :targetTaskProp="selectedTask"
      @cancelled="onDepositCancelled"
      @success="onDepositSuccess"
    >
    </DepositDialogVue>

    <!-- task progress check dialog -->
    <TaskProgressDialogVue
      :visibleProp="taskProgressDialogVisible"
      :targetTaskProp="selectedTask"
      @closed="onTaskProgressDialogClosed"
    >
    </TaskProgressDialogVue>
  </div>
</template>

<script lang="ts">
import { PublisherTaskTS } from "./PublisherTaskTS";
export default class PublisherVue extends PublisherTaskTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.div-radio-button {
  display: inline-block;
  margin-right: 5px;
}
</style>
