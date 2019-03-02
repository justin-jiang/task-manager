<template>
  <el-dialog
    width="40%"
    :title="progressDialogTitle"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="visibleProp"
  >
    <el-row>
      <el-col :span="24">
        <el-steps
          direction="vertical"
          finish-status="success"
          :active="activeStepIndex"
        >
          <el-step
            v-for="step in taskStepStatus"
            :key="step.uid"
            :title="getProgressTitle(step)"
            :status="getProgressStatus(step)"
            :description="getProgressDescription(step)"
          ></el-step>
        </el-steps>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-button
          type="primary"
          size="small"
          @click="onClosed()"
        >关闭</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { TaskProgressDialogTS } from "./TaskProgressDialogTS";
export default class TaskProgressDialogVue extends TaskProgressDialogTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.row-item {
  margin-bottom: 10px;
}
</style>
