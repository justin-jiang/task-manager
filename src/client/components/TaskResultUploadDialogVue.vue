<template>
  <el-dialog
    width="450px"
    title="尽调结果上传"
    custom-class="dialog-task-result-upload"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="visibleProp"
  >
    <el-row>
      <el-col :span="24">
        <SingleFileUploadVue
          :ref="resultUploaderRefName"
          :filePostParamProp="filePostParam"
          :fileTypesProp="taskResultFileTypes"
          :fileSizeMProp="taskResultFileSizeMLimit"
          :hideSubmitButtonProp="true"
          @change="onFileChange"
          @success="onSuccess"
        />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-button
          type="primary"
          plain
          size="mini"
          @click="onCancel()"
        >取消</el-button>
        <el-button
          type="primary"
          size="mini"
          :disabled="!isReadyToSubmit"
          @click="onSubmit()"
        >提交</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { TaskResultUploadDialogTS } from './TaskResultUploadDialogTS';
export default class TaskResultUploadDialogVue extends TaskResultUploadDialogTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
