<template>
  <el-form
    v-loading="submitting"
    :model="formDatas"
    status-icon
    :rules="formRules"
    :ref="formRefName"
    style="max-width:1000px; margin: 0 auto;"
    label-width="100px"
    class="form-publishTask"
  >
    <el-form-item
      label="任务名称"
      prop="name"
    >
      <el-input v-model.number="formDatas.name"></el-input>
    </el-form-item>
    <el-form-item
      label="模板"
      prop="logoBlob"
    >
      <el-upload
        class="avatar-uploader"
        action="https://jsonplaceholder.typicode.com/posts/"
        :show-file-list="false"
        :on-change="onLogoChange"
        :auto-upload="false"
      >
        <img
          v-if="logoUrl"
          :src="logoUrl"
          class="avatar"
        >
        <i
          v-else
          class="el-icon-plus avatar-uploader-icon"
        ></i>
      </el-upload>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="submitForm()"
      >提交</el-button>
      <el-button @click="resetForm()">重置</el-button>
    </el-form-item>
    <el-form-item>
      <el-dialog
        title="提示"
        :visible.sync="dialogVisible"
        width="30%"
      >
        <vue-cropper
          ref='cropper'
          :guides="true"
          :view-mode="2"
          drag-mode="crop"
          :auto-crop-area="0.5"
          :min-container-width="250"
          :min-container-height="180"
          :background="true"
          :rotatable="true"
          :src="logoUrl"
          alt="Source Image"
          :img-style="{ 'width': '400px', 'height': '300px' }"
        >
        </vue-cropper>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="onLogoCropDone()"
          >确 定</el-button>
        </span>
      </el-dialog>

    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { RegisterTS } from './RegisterTS';
export default class RegisterVue extends RegisterTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
// there is bug for scoped style which will not generate the data-v-XXX attr on el-uploader element
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
