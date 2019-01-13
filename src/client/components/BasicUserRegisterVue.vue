<template>
  <div>
    <el-row>
      <el-col :span="24">
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
            v-if="isNewUser"
            label="账号名称"
            prop="name"
          >
            <el-input v-model="formDatas.name"></el-input>
          </el-form-item>
          <el-form-item
          v-if="isNewUser"
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
          v-if="isNewUser"
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
          v-if="isNewUser"
            label="电子邮箱"
            prop="email"
          >
            <el-input v-model="formDatas.email"></el-input>
          </el-form-item>
          <el-form-item
          v-if="isNewUser"
            label="电话号码"
            prop="telephone"
          >
            <el-input v-model="formDatas.telephone"></el-input>
          </el-form-item>
          <el-form-item
            label="用户类型"
            v-if="!isAdmin() && isNewUser"
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

          <el-form-item label="头像">
            <SingleImageUploaderVue
              :ref="uploaderRefName"
              :filePostParamProp="fileUploadParam"
              @imageChanged="onLogoChanged"
              @success="onLogoUploadSuccess"
            ></SingleImageUploaderVue>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :disabled="!isReadyToSubmit()"
              @click="onSubmitForm()"
            >提交</el-button>
            <el-button @click="resetForm()">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>

</template>

<script lang="ts">
import { BasicUserRegisterTS } from "./BasicUserRegisterTS";
export default class BasicUserRegisterVue extends BasicUserRegisterTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
