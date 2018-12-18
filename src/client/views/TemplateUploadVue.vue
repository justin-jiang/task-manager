<template>
  <el-form
    :model="formDatas"
    :ref="formRefName"
    label-width="100px"
    class="form-templateUpload"
  >
    <el-form-item
      label="模板名称"
      prop="name"
    >
      <el-input v-model.number="formDatas.name"></el-input>
    </el-form-item>
    <el-form-item
      label="备注"
      prop="note"
    >
      <el-input v-model.number="formDatas.note"></el-input>
    </el-form-item>
    <el-form-item label="模板文档">
      <el-upload
        class="upload-templateFile"
        drag
        :ref="uploaderRefName"
        :action="uploadURL"
        :data="filePostParam"
        :auto-upload="false"
        :limit="templateCountLimit"
        :on-change="onTemplateFileChange"
        :on-exceed="onTemplateFileCountExceed"
        :on-progress="onTemplateFileProgress"
        :on-success="onTemplateFileSuccess"
        :on-error="onTemplateFileError"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div
          class="el-upload__tip"
          slot="tip"
        >只能上传zip文件包，且不超过100MB</div>
      </el-upload>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="submitForm()"
      >提交</el-button>
      <el-button @click="resetForm()">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { TemplateUploadTS } from './TemplateUploadTS';
export default class TemplateUploadVue extends TemplateUploadTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
</style>
