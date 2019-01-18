<template>
  <div>
    <el-row>
      <el-col :span="1">
        名称:
      </el-col>
      <el-col :span="4">
        {{dataProp.row.name}}
      </el-col>
      <el-col :span="1">
        金额:
      </el-col>
      <el-col :span="4">
        {{dataProp.row.reward}}
      </el-col>
      <el-col :span="1">
        状态:
      </el-col>
      <el-col :span="4">
        {{taskStateToText(dataProp.row.state)}}
      </el-col>
      <el-col :span="1">
        发布人:
      </el-col>
      <el-col :span="4">
        {{ dataProp.row.publisherName }}
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        任务对象所在区域:
      </el-col>
      <el-col :span="4">
        {{ locationToText(dataProp.row) }}
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="1">
        申请人:
      </el-col>
      <el-col :span="4">
        {{ applicantName(dataProp.row.applicantName) }}
      </el-col>
      <el-col :span="1">
        执行人:
      </el-col>
      <el-col :span="4">
        {{ executorName(dataProp.row.executorName) }}
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="1">
        备注:
      </el-col>
      <el-col :span="23">
        {{ dataProp.row.note }}
      </el-col>
    </el-row>

  </div>
</template>

<script lang="ts">
import { TaskDetailInTableTS } from "./TaskDetailInTableTS";
export default class TaskDetailInTableVue extends TaskDetailInTableTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.el-row {
  margin-bottom: 20px;
}
</style>
