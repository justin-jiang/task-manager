<template>
  <div>
    <el-row>
      <el-form
        :model="formDatas"
        status-icon
        :rules="formRules"
        :ref="formRefName"
        style="max-width:1000px; min-width:500px;"
        label-width="100px"
        class="form-corpRegister"
        :disabled="isSubmitting"
      >
        <el-form-item
          label="账号名称"
          prop="name"
        >
          <el-input v-model="formDatas.name"></el-input>
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
        >
          <el-input
            type="password"
            v-model="formDatas.password"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="确认密码"
          prop="confirmPassword"
        >
          <el-input
            type="password"
            v-model="formDatas.confirmPassword"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="电子邮箱"
          prop="email"
        >
          <el-input v-model="formDatas.email"></el-input>
        </el-form-item>
        <el-form-item
          label="用户类型"
          v-if="!isAdmin()"
        >
          <el-switch
            v-model="isCorpUser"
            active-text="企业"
            inactive-text="个人"
            active-color="#13ce66"
            inactive-color="#13ce66"
          >
          </el-switch>
        </el-form-item>

        <el-form-item
          label="头像"
          prop="logoBlob"
        >
          <el-upload
            class="avatar-uploader"
            :name="keyNameOfuploadedFile"
            :ref="uploaderRefName"
            :action="uploadURL"
            :show-file-list="false"
            :data="filePostParam"
            :auto-upload="false"
            :before-upload="beforeLogoUpload"
            :on-change="onLogoChange"
            :on-success="onLogoFileUploadDone"
            :on-error="onLogoFileUploadError"
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
            @click="onSubmitForm()"
          >提交</el-button>
          <el-button @click="resetForm()">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-dialog
            title="头像选取"
            width="30%"
            :visible.sync="cropDialogVisible"
            :close-on-click-modal="false"
            :center="true"
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
              <el-button @click="onLogoCropCancel()">取 消</el-button>
              <el-button
                type="primary"
                @click="onLogoCropDone()"
              >确 定</el-button>
            </span>
          </el-dialog>

        </el-form-item>
      </el-form>
    </el-row>
  </div>

</template>

<script lang="ts">
import { BasicUserRegisterTS } from './BasicUserRegisterTS';
export default class BasicUserRegisterVue extends BasicUserRegisterTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
