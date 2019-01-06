<template>
  <div v-loading="isLoading">
    <el-row>
      <el-col :span="24">
        <el-menu
          :router="true"
          :default-active="taskIndex"
          class="el-menu-executor"
          mode="horizontal"
          @select="onMenuSelected"
        >
          <el-menu-item :index="taskIndex">任务管理</el-menu-item>
          <el-menu-item :index="userInfoIndex">个人信息管理</el-menu-item>
          <el-menu-item :index="notificationIndex">消息中心</el-menu-item>
        </el-menu>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <router-view></router-view>
      </el-col>
    </el-row>
  </div>

</template>

<script lang="ts">
import { ExecutorTS } from "./ExecutorTS";
export default class ExecutorVue extends ExecutorTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
