<template>
  <div>
    <el-row style="margin-bottom:20px">
      <el-col :span="24">
        <el-upload
          class="uploader-qualificationFile"
          drag
          :accept="acceptFileTypes"
          :name="keyNameOfuploadedFile"
          :ref="uploaderRefName"
          :action="uploadAPIURL"
          :data="fileUploadParam"
          :auto-upload="false"
          :limit="countLimit"
          :before-upload="beforeUpload"
          :on-change="onFileChange"
          :on-remove="onFileRemove"
          :on-exceed="onFileCountExceed"
          :on-success="onFileUploadDone"
          :on-error="onFileUploadError"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div
            class="el-upload__tip"
            slot="tip"
          >{{uploadTip}}</div>

        </el-upload>
      </el-col>
    </el-row>
    <el-row v-if="!hideSubmitButton">
      <el-col :span="24">
        <el-button
          v-if="!hideSubmitButton"
          size="small"
          type="primary"
          :disabled="!isReadyToSubmit"
          @click="onSubmit"
        >{{buttonText}}</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { SingleFileUploadTS } from "./SingleFileUploadTS";
export default class SingleFileUploadVue extends SingleFileUploadTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
