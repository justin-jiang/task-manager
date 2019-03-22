<template>
  <div>
    <el-row>
      <el-col :span=24>
        当前评级：<el-rate
          v-model="qualificationStar"
          disabled
          text-color="#ff9900"
          style="display:inline-block"
        >
        </el-rate>
        综合分数：{{qualificationScore}}
      </el-col>
    </el-row>
    <el-collapse
      v-model="activeCollapseNames"
      accordion
    >
      <el-collapse-item
        title="账号信息修改"
        :name="accountInfoCollapseName"
      >
        <el-row>
          <el-col :span="24">
            <el-form
              :model="accountInfoFormDatas"
              status-icon
              :rules="accountInfoFormRules"
              :ref="accountInfoFormRefName"
              class="form-main"
              label-width="100px"
              :disabled="isSubmitting"
            >
              <el-form-item
                label="账号名称"
                prop="name"
              >
                <el-input
                  disabled
                  v-model="accountInfoFormDatas.name"
                ></el-input>
              </el-form-item>
              <el-form-item
                label="用户类型"
                prop="type"
              >
                <el-switch
                  disabled
                  v-model="accountInfoFormDatas.type"
                  active-text="企业"
                  inactive-text="个人"
                  active-color="#13ce66"
                  inactive-color="#13ce66"
                  :active-value="switchActiveValue"
                  :inactive-value="switchInactiveValue"
                ></el-switch>
              </el-form-item>
              <el-form-item
                label="电子邮箱"
                prop="email"
              >
                <el-input v-model="accountInfoFormDatas.email"></el-input>
              </el-form-item>
              <el-form-item
                label="电话号码"
                prop="telephone"
              >
                <el-input v-model="accountInfoFormDatas.telephone"></el-input>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <el-row class="row-align-form">
          <el-col :span=24>
            <el-button
              type="primary"
              :disabled="!isAccountInfoChanged()"
              @click="onAccountInfoSubmit()"
            >提交</el-button>
          </el-col>
        </el-row>
      </el-collapse-item>

      <el-collapse-item
        title="主体信息修改"
        :name="basicInfoCollapseName"
      >
        <el-row style="margin-bottom:10px;">
          <el-col :span="24">
            <el-alert
              title="主体信息修改需要管理员审核，审核期间部分业务功能无法使用"
              type="warning"
              center
              show-icon
              :closable="false"
            >
            </el-alert>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <UserIdentityInfoUploadVue @success="onIdUploadSuccess" />
          </el-col>
        </el-row>
      </el-collapse-item>
      <el-collapse-item
        title="密码修改"
        :name="passwordCollapseName"
      >
        <el-row>
          <el-col :span=24>
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
            </el-form>
          </el-col>
        </el-row>
        <el-row class="row-align-form">
          <el-col :span=24>
            <el-button
              type="primary"
              :disabled="!isPasswordEditReady()"
              @click="onPasswordSubmit()"
            >提交</el-button>
          </el-col>
        </el-row>
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
