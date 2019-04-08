<template>
  <div v-loading="isLoading">
    <el-row>
      <el-col :span=24>
        <el-alert
          v-if="!isQualitationTemplateReady"
          type="error"
          center
          show-icon
          :closable="false"
        >
          <span
            slot="title"
            style="font-size:15px;"
          ><b>请上传资质模板</b></span>
        </el-alert>
        <el-alert
        v-if="!isRegisterProtocolReady"
          type="error"
          center
          show-icon
          :closable="false"
        >
          <span
            slot="title"
            style="font-size:15px;"
          ><b>请上传注册协议</b></span>
        </el-alert>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-menu
          class="el-menu-view-page"
          :router="true"
          :default-active="userIndex"
          mode="horizontal"
          @select="onMenuSelected"
        >
          <el-menu-item :index="userIndex">用户管理</el-menu-item>
          <el-menu-item :index="taskIndex">任务管理</el-menu-item>
          <el-menu-item :index="templateIndex">资质模板管理</el-menu-item>
          <el-menu-item :index="registerProtocolIndex">用户注册协议管理</el-menu-item>
          <!-- <el-menu-item :index="notificationIndex">
            消息中心
            <el-badge
              v-if="hasNotification"
              :value="newNotificationCount"
              class="badge_item"
              type="primary"
            ></el-badge>
          </el-menu-item> -->
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
import { AdminTS } from './AdminTS';
export default class AdminManagementVue extends AdminTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.el-main {
  padding: 0px;
}
</style>
