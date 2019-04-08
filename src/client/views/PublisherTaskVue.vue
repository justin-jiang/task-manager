<template>
  <div>
    <!-- task radio button group and create_task button -->
    <el-row>
      <el-col :span="4">
        <el-button
          type="success"
          icon="el-icon-plus"
          @click="onTaskCreate()"
        >创建新任务</el-button>
      </el-col>
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
    </el-row>

    <!-- task table -->
    <el-row>
      <el-col :span="24">
        <TaskTableVue :dataProp="filteredTaskObjs">
          <template
            slot="buttons"
            slot-scope="scope"
          >
            <el-button
              type="primary"
              size="mini"
              plain
              v-if="isToBeDeposited(scope.$index, scope.row)"
              @click.stop="onDeposit(scope.$index, scope.row)"
            >资金托管</el-button>
            <el-button
              type="primary"
              size="mini"
              plain
              v-if="isTaskResultPassed(scope.$index, scope.row)"
              @click.stop="onTaskResultCheck(scope.$index, scope.row)"
            >验收确认</el-button>
            <el-button
              type="primary"
              size="mini"
              plain
              v-if="!isNotSubmitted(scope.$index, scope.row)"
              @click.stop="onTaskProgressCheck(scope.$index, scope.row)"
            >进度查询</el-button>
            <el-button
              size="mini"
              type="primary"
              plain
              v-if="isNotSubmitted(scope.$index, scope.row)"
              @click.stop="onTaskEdit(scope.$index, scope.row)"
            >编辑</el-button>

            <el-button
              size="mini"
              type="primary"
              plain
              v-if="isNotSubmitted(scope.$index, scope.row)"
              @click.stop="onSubmit(scope.$index, scope.row)"
            >提交</el-button>

            <el-button
              size="mini"
              type="danger"
              v-if="isNotDeposited(scope.$index, scope.row)"
              @click.stop="onTaskDelete(scope.$index, scope.row)"
            >删除</el-button>
          </template>
        </TaskTableVue>
      </el-col>
    </el-row>

    <!-- dialog to create or edit task -->
    <el-dialog
      width="800px"
      :title="taskCreateOrEditDialogTitle"
      custom-class="dialog-task-form"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="taskCreateOrEditDialogVisible"
    >
      <el-row>
        <el-col :span="24">
          <TaskFormVue
            :ref="taskFormRefName"
            :taskProp="selectedTask"
            :usageSenario="usageSenario"
            @success="onTaskCreateOrEditSuccess"
            @cancel="onTaskCreateOrEditCancel"
          ></TaskFormVue>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- dialog to deposit and upload the deposit image -->
    <DepositDialogVue
      :visibleProp="depositDialogVisible"
      :taskProp="selectedTask"
      @cancel="onDepositCancel"
      @success="onDepositSuccess"
    >
    </DepositDialogVue>

    <!-- task progress check dialog -->
    <TaskProgressDialogVue
      :visibleProp="taskProgressDialogVisible"
      :taskProp="selectedTask"
      @closed="onTaskProgressDialogClosed"
    >
    </TaskProgressDialogVue>

    <!-- dialog to set task result rate -->
    <FileCheckDialogVue
      titleProp="尽调结果验收"
      :scenarioProp="3"
      :targetFileUidProp="selectedTask.resultFileUid"
      :visibleProp="taskResultCheckDialogVisible"
      @submit="onTaskResultCheckSubmit"
      @cancel="onTaskResultCheckCancel"
      @download="onTaskResultDownload"
    >
    </FileCheckDialogVue>

  </div>
</template>

<script lang="ts">
import { PublisherTaskTS } from './PublisherTaskTS';
export default class PublisherVue extends PublisherTaskTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.div-radio-button {
  display: inline-block;
  margin-right: 5px;
}
</style>
