<template>
  <div v-loading="isLoading">
    <el-row>
      <el-col :span="24">
        <el-menu
          :router="true"
          :default-active="userIndex"
          class="el-menu-admin"
          mode="horizontal"
          @select="onMenuSelected"
        >
          <el-menu-item :index="userIndex">用户管理</el-menu-item>
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
import { AdminTS } from "./AdminTS";
export default class AdminManagementVue extends AdminTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.el-main {
  padding: 0px;
}
</style>
