<template>
  <el-container
    id="app"
    class="container-app"
  >
    <el-header
      id="nav"
      class="header-app"
    >
      <el-row>
        <el-col
          :span="16"
          style="text-align:left;"
        >
          <!-- <img
            class="img-logo"
            src="./assets/companyLogo_mini.jpg"
          /> -->
        </el-col>
        <el-col
          :span="8"
          style="text-align:right;padding-right:10px;"
        >
          <el-dropdown
            style="width:250px"
            @command="handleCommand"
            v-if="isLogon"
          >
            <AvatarWithNameVue
              :nameProp="logonUserName"
              :logoUrlProp="logoUrl"
              :qualificationStarProp="qualificationStar"
              :qualificationScoreProp="qualificationScore"
            ></AvatarWithNameVue>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="LogoffCommand">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>

      </el-row>

    </el-header>

    <el-main class="main-app">
      <router-view />
    </el-main>
  </el-container>
</template>
<script lang="ts">
import { AppTS } from "./AppTS";
export default class AppVue extends AppTS {}
</script>
<style lang="less">
@headerPaddingTop: 20px;
@headerHeight: @headerPaddingTop + 60px;

.container-app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.header-app {
  height: @headerHeight !important;
  position: fixed;
  background-color: white;
  width: 100%;
  left: 0;
  top: 0;
  z-index: 1000;
  padding-top: @headerPaddingTop;
}
.main-app {
  margin-top: @headerHeight;
}

.form-main {
  max-width: 800px;
  min-width: 300px;
}
.row-align-form {
  max-width: 800px;
  min-width: 300px;
}

.el-form-item {
  margin-bottom: 15px;
}
.el-form-item__content {
  text-align: left;
}
.el-tabs__content {
  overflow: visible;
}

.el-badge__content {
  z-index: 900;
}

// dialog
.el-dialog {
  border-radius: 8px;
}

.dialog-deposit .el-dialog__header {
  padding-bottom: 0px;
}
.dialog-deposit .el-dialog__body {
  padding-top: 0px;
}

.dialog-fund-audit .el-dialog__body {
  padding-top: 0px;
}

.dialog-task-form .el-dialog__body {
  padding-top: 0px;
  padding-left: 0px;
}
.dialog-progress .el-dialog__body {
  padding-top: 15px;
}

//

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.el-menu-view-page {
  margin-bottom: 10px;
}
.el-carousel .el-carousel__container .el-carousel__arrow {
  background-color: rgba(31, 45, 61, 0.2);
  height: 54px;
  width: 54px;
  font-size: 24px;
}
.confirm-danger {
  .el-message-box__status.el-icon-warning {
    color: red !important;
  }
}
</style>
<style scoped lang="less">
.img-logo {
  height: 60px;
  width: 500px;
}
</style>
