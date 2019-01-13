<template>
  <div>
    <el-collapse
      v-model="activeCollapseNames"
      accordion
    >
      <el-collapse-item
        title="基本信息修改"
        :name="basicInfoCollapseName"
      >
        <el-row>
          <el-col :span="24">
            <el-form
              :model="basicInfoFormDatas"
              status-icon
              :rules="basicInfoFormRules"
              :ref="basicInfoFormRefName"
              style="max-width:1000px; min-width:500px;"
              label-width="100px"
              class="form-userInfo"
              :disabled="isSubmitting"
            >
              <el-form-item
                label="账号名称"
                prop="name"
              >
                <el-input v-model="basicInfoFormDatas.name"></el-input>
              </el-form-item>
              <el-form-item
                label="账号昵称"
                prop="nickName"
              >
                <el-input v-model="basicInfoFormDatas.nickName"></el-input>
              </el-form-item>
              <el-form-item
                label="电子邮箱"
                prop="email"
              >
                <el-input v-model="basicInfoFormDatas.email"></el-input>
              </el-form-item>
              <el-form-item
                label="电话号码"
                prop="telephone"
              >
                <el-input v-model="basicInfoFormDatas.telephone"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  :disabled="!isBasicInfoChanged()"
                  @click="onBasicInfoSubmit()"
                >更新基本信息</el-button>

              </el-form-item>
            </el-form>
          </el-col>

        </el-row>
      </el-collapse-item>

      <el-collapse-item
        title="头像修改"
        :name="logoCollapseName"
      >
        <el-row>
          <el-col :span="24">
            <SingleImageUploaderVue
              :ref="uploaderRefName"
              :filePostParamProp="fileUploadParam"
              :imageUidProp="getLogoUid()"
              @imageChanged="onLogoChanged"
              @success="onLogoUploadSuccess"
              @failure="onLogoUploadFailure"
            ></SingleImageUploaderVue>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-button
              type="primary"
              :disabled="!isReadyToSubmit()"
              @click="onLogoSubmit()"
            >提交</el-button>
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item
        title="密码修改"
        :name="passwordCollapseName"
      >
        <el-form
          :model="passwordFormDatas"
          status-icon
          :rules="passwordFormRules"
          :ref="passwordFormRefName"
          style="max-width:1000px; min-width:500px;"
          label-width="100px"
          class="form-userInfo"
          :disabled="isSubmitting"
        >
          <el-form-item
            label="旧密码"
            prop="oldPassword"
          >
            <el-input
              type="password"
              v-model="passwordFormDatas.oldPassword"
            ></el-input>
          </el-form-item>
          <el-form-item
            label="新密码"
            prop="newPassword"
          >
            <el-input
              type="password"
              v-model="passwordFormDatas.newPassword"
            ></el-input>
          </el-form-item>
          <el-form-item
            label="确认新密码"
            prop="confirmPassword"
          >
            <el-input
              type="password"
              v-model="passwordFormDatas.confirmPassword"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :disabled="!isPasswordEditReady()"
              @click="onPasswordSubmit()"
            >提交</el-button>

          </el-form-item>
        </el-form>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script lang="ts">
import { UserInfoTS } from "./UserInfoTS";
export default class UserInfoVue extends UserInfoTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
</style>
