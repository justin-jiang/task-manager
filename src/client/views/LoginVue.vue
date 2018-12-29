<template>
  <el-form
    v-loading="isSubmitting"
    :model="formDatas"
    status-icon
    :rules="formRules"
    :ref="formRefName"
    style="max-width:1000px; margin: 0 auto;"
    label-width="100px"
    class="form-register"
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
        @keyup.enter.native="submitForm()"
      ></el-input>
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="submitForm()"
      >登录</el-button>
      <el-button @click="goToExecutorRegister()">执行人注册</el-button>
      <el-button @click="goToPublisherRegister()">发布人注册</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { LoginTS } from './LoginTS';
export default class RegisterVue extends LoginTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
