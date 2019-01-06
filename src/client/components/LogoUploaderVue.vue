<template>
  <div>
    <el-upload
      class="avatar-uploader"
      :name="keyNameOfuploadedFile"
      :ref="uploaderRefName"
      :action="uploadAPIURL"
      :show-file-list="false"
      :data="uploadData"
      :auto-upload="false"
      :before-upload="beforeUpload"
      :on-change="onFileChange"
      :on-success="onFileUploadDone"
      :on-error="onFileUploadError"
    >
      <img
        v-if="isLogoURLReady()"
        :src="logoUrlForUploader"
        class="avatar"
      >
      <i
        v-else
        class="el-icon-plus avatar-uploader-icon"
      ></i>
    </el-upload>
    <el-dialog
      title="头像选取"
      width="30%"
      :visible.sync="cropDialogVisible"
      :close-on-click-modal="false"
      :center="true"
    >
      <vue-cropper
        :ref="cropperRefName"
        :guides="true"
        :view-mode="2"
        drag-mode="crop"
        :auto-crop-area="0.5"
        :min-container-width="250"
        :min-container-height="180"
        :background="true"
        :rotatable="true"
        :src="logoUrlForCropper"
        alt="Source Image"
        :img-style="{ 'width': '400px', 'height': '300px' }"
      >
      </vue-cropper>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="onLogoCropCancel()">取 消</el-button>
        <el-button
          type="primary"
          @click="onLogoCropDone()"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { LogoUploaderTS } from "./LogoUploaderTS";
export default class LogoUploaderVue extends LogoUploaderTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
</style>
