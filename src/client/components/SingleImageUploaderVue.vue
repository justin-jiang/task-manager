<template>
  <div>
    <el-upload
      class="avatar-uploader"
      accept="image/jpg,image/png"
      :http-request="uploadCroppedFile"
      :name="keyNameOfuploadedFile"
      :ref="uploaderRefName"
      :action="uploadAPIURL"
      :limit="1"
      :show-file-list="true"
      :data="uploadData"
      :auto-upload="false"
      :before-upload="beforeUpload"
      :on-change="onFileChange"
      :on-remove="onFileRemove"
      :on-exceed="onFileCountExceed"
    >
      <img
        v-if="isImageUrlReady"
        :src="imageUrlForUploader"
        class="avatar"
      >
      <i
        v-else
        class="el-icon-plus avatar-uploader-icon"
      ></i>
      <div
        slot="tip"
        class="el-upload__tip"
      >{{limitTip}}</div>
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
        :aspectRatio="1/1"
        :initialAspectRatio="1/1"
        :auto-crop-area="0.8"
        :min-container-width="300"
        :min-container-height="180"
        :background="true"
        :rotatable="true"
        :src="imageUrlForCropper"
        alt="Source Image"
        :img-style="{ 'width': '400px', 'height': '300px' }"
      >
      </vue-cropper>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          plain
          @click="onImageCropCancel()"
        >取 消</el-button>
        <el-button
          type="primary"
          :loading="isCropping"
          @click="onImageCropDone()"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { SingleImageUploaderTS } from "./SingleImageUploaderTS";
export default class SingleImageUploaderVue extends SingleImageUploaderTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
