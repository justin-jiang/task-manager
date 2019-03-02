<template>
  <el-form
    :model="formDatas"
    status-icon
    :rules="formRules"
    :ref="formRefName"
    label-width="100px"
    class="form-main"
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
      <el-button
        type="primary"
        plain
        @click="goToExecutorRegister()"
      >执行人注册</el-button>
      <el-button
        type="primary"
        plain
        @click="goToPublisherRegister()"
      >发布人注册</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { LoginTS } from "./LoginTS";
export default class RegisterVue extends LoginTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.el-form {
  margin: 0 auto;
}
</style>
