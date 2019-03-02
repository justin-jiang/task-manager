<template>
  <div>
    <!-- basic info -->
    <el-row>
      <el-col :span="1">
        <b>名称:</b>
      </el-col>
      <el-col :span="4">
        {{dataProp.name}}
      </el-col>
      <el-col :span="1">
        <b> 金额:</b>
      </el-col>
      <el-col :span="4">
        {{dataProp.reward}}
      </el-col>
      <el-col :span="2">
        <b>建议保证金:</b>
      </el-col>
      <el-col :span="3">
        {{dataProp.proposedMargin}}
      </el-col>
      <el-col :span="2">
        <b>截止日期:</b>
      </el-col>
      <el-col :span="3">
        {{ timestampToText(dataProp.deadline) }}
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <b>任务对象所在区域:</b>
      </el-col>
      <el-col :span="4">
        {{ locationToText }}
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="2">
        <b>雇员类别:</b>
      </el-col>
      <el-col :span="4">
        {{ executorTypes }}
      </el-col>
      <el-col :span="2">
        <b>雇员资质:</b>
      </el-col>
      <el-col :span="4">
        {{ executorStar }}
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="1">
        <b>备注:</b>
      </el-col>
      <el-col :span="23">
        {{ dataProp.note }}
      </el-col>
    </el-row>
    <!-- detailed info -->
    <el-row>
      <el-col :span="3">
        <b>受访企业名称:</b>
      </el-col>
      <el-col :span="9">
        {{ dataProp.companyName }}
      </el-col>
      <el-col :span="3">
        <b>受访企业地址:</b>
      </el-col>
      <el-col :span="9">
        {{ dataProp.address }}
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="3">
        <b>企业联系人:</b>
      </el-col>
      <el-col :span="3">
        {{ dataProp.companyContact }}
      </el-col>
      <el-col :span="3">
        <b>联系电话:</b>
      </el-col>
      <el-col :span="3">
        {{ dataProp.contactPhone }}
      </el-col>
      <el-col :span="3">
        <b>联系邮箱:</b>
      </el-col>
      <el-col :span="4">
        {{ dataProp.contactEmail }}
      </el-col>
    </el-row>
    <el-row v-if="isTaskExecutor">
      <el-col :span="24">
        <el-button
          type="primary"
          size="small"
          icon="el-icon-download"
          @click="onDownloadTaskTemplate(dataProp)"
        >任务模板下载</el-button>
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
  padding: 10px;
  border-bottom: 1px solid cadetblue;
  &:nth-child(odd) {
    background: #f0f9eb;
  }
  &:first-child {
    border-top: 1px solid cadetblue;
  }
}
</style>
