<template>
  <div v-loading="!isInitialized">
    <el-row>
      <el-col :span="24">
        <el-menu
          :router="true"
          :default-active="activeIndex"
          class="el-menu-view-page"
          mode="horizontal"
          @select="onMenuSelected"
        >
          <el-menu-item :index="taskIndex">任务管理</el-menu-item>
          <el-menu-item :index="templateIndex">模板管理</el-menu-item>
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
import { PublisherTS } from "./PublisherTS";
export default class PublisherVue extends PublisherTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.badge_item {
  margin-top: -10px;
}
</style>
