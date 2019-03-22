<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-form
          :model="formDatas"
          status-icon
          :rules="formRules"
          :ref="formRefName"
          label-width="100px"
          class="form-main"
          :disabled="isSubmitting"
        >
          <el-form-item
            label="账号名称"
            prop="name"
          >
            <el-input
              v-model="formDatas.name"
              placeholder='三位或以上的数字，字母，下划线和短横线组合'
            ></el-input>
          </el-form-item>
          <el-form-item
            label="密码"
            prop="password"
          >
            <el-input
              type="password"
              v-model="formDatas.password"
              autocomplete="off"
              placeholder='六位或以上且至少包含一个特殊字符'
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
            label="手机号码"
            prop="telephone"
          >
            <el-input v-model="formDatas.telephone"></el-input>
          </el-form-item>
          <el-form-item
            label="用户类型"
            prop="type"
            v-if="!isAdmin"
          >
            <el-switch
              v-model="formDatas.type"
              active-text="企业"
              inactive-text="个人"
              active-color="#13ce66"
              inactive-color="#13ce66"
              :active-value="switchActiveValue"
              :inactive-value="switchInactiveValue"
            >
            </el-switch>
          </el-form-item>
          <el-form-item>

          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-row class="row-align-form">
      <el-col :span="24">
        <el-button
          type="warning"
          plain
          @click="resetForm()"
        >重置</el-button>
        <el-button
          type="primary"
          :disabled="!isReadyToSubmit"
          :loading="isSubmitting"
          @click="onSubmitForm()"
        >提交</el-button>

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
.row-align-form {
  text-align: center;
}
</style>
