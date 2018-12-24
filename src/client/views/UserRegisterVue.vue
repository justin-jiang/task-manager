<template>
  <el-tabs
    type="border-card"
    style="min-height:600px;"
    v-model="activeTabName"
  >
    <el-tab-pane :name="executorRegisterTabName">
      <span slot="label"><i class="el-icon-date"></i> 执行人注册</span>
      <ExecutorRegisterVue />
    </el-tab-pane>
    <el-tab-pane
      label="发布人注册"
      :name="publisherRegisterTabName"
    >
      <ExecutorRegisterVue :userRoleProp="personalPublisher" />
    </el-tab-pane>

  </el-tabs>

</template>

<script lang="ts">
import { UserRegisterTS } from './UserRegisterTS';
export default class UserRegisterVue extends UserRegisterTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
