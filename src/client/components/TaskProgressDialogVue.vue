<template>
  <el-dialog
    width="550px"
    custom-class="dialog-progress"
    :title="dialogTitle"
    :visible.sync="show"
    @closed="onClosed"
  >
    <el-row>
      <el-col :span="24">
        <el-steps
          direction="vertical"
          finish-status="finish"
          :active="activeStepIndex"
        >
          <el-step
            v-for="step in taskStepStatus"
            :key="step.uid"
          >
            <el-row slot="title">
              <el-col
                :span="6"
                class="col-step-datetime"
              >
                <el-row class="row-step-date">
                  <el-col :span=24>
                    {{getStepDate(step)}}
                  </el-col>
                </el-row>
                <el-row class="row-step-time">
                  <el-col :span=24>
                    {{getStepTime(step)}}
                  </el-col>
                </el-row>
              </el-col>
              <el-col
                :span="18"
                class="col-step-title"
              >{{getStepTitle(step)}}</el-col>
            </el-row>
            <el-row
              slot="description"
              class="row-step-desc"
            >
              <el-col :span=24>{{getStepDescription(step)}}</el-col>
            </el-row>
          </el-step>
        </el-steps>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-button
          type="primary"
          size="small"
          plain
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
.col-step-datetime {
  min-height: 50px;
}
.col-step-title {
  margin-top: 10px;
}
.row-step-desc {
  color: red;
  text-align: center;
}
</style>
