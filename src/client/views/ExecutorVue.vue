<template>
  <div v-loading="!isInitialized">
    <el-row>
      <el-col :span="24">
        <el-menu
          class="el-menu-view-page"
          mode="horizontal"
          :router="true"
          :default-active="activeIndex"
          @select="onMenuSelected"
        >
          <el-menu-item :index="taskIndex">任务管理</el-menu-item>
          <el-menu-item :index="userInfoIndex">个人信息管理</el-menu-item>
          <el-menu-item :index="notificationIndex">
            消息中心
            <el-badge
              v-if="hasNotification"
              :value="newNotificationCount"
              class="badge_item"
              type="primary"
            ></el-badge>
          </el-menu-item>
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
.badge_item {
  margin-top: -10px;
}
</style>
