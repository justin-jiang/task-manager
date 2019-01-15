<template>
  <div>
    <el-row style="margin-bottom:20px">
      <el-col :span="12">
        <el-upload
          class="upload-qualificationFile"
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
          :on-exceed="onFileCountExceed"
          :on-success="onFileUploadDone"
          :on-error="onFileUploadError"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div
            class="el-upload__tip"
            slot="tip"
          >{{uploadTip()}}</div>

        </el-upload>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-button
          size="small"
          type="primary"
          :disabled="!isReadyToSubmit()"
          @click="onSubmit"
        >{{buttonText}}</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { SingleFileUploadTS } from './SingleFileUploadTS';
export default class SingleFileUploadVue extends SingleFileUploadTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
</style>
