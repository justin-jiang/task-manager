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
          class="col-header-logo"
        >
          <img
            class="img-logo"
            src="./assets/companyLogo_mini.jpg"
          />
        </el-col>
        <el-col
          :span="8"
          class="col-header-avatar"
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
import { AppTS } from './AppTS';
export default class AppVue extends AppTS {}
</script>

<style lang="less">
// global style
@maxMainFormWidth: 800px;
@minMainFormWidth: 300px;
@dialogBodyPaddingTop: 10px;
@dialogBodyPaddingBottom: 20px;

body {
  margin: 2px;
}
.form-main {
  max-width: @maxMainFormWidth;
  min-width: @minMainFormWidth;
}
.row-align-form {
  max-width: @maxMainFormWidth;
  min-width: @minMainFormWidth;
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
  .col-dialog-title {
    margin-top: 7px;
    font-size: 20px;
    font-weight: 800;
  }
}

.dialog-deposit .el-dialog__header {
  padding-bottom: 0px;
}
.dialog-deposit .el-dialog__body {
  padding-top: 0px;
}

.dialog-publisher-visit .el-dialog__body {
  padding-top: @dialogBodyPaddingTop;
  padding-bottom: @dialogBodyPaddingBottom;
}

.dialog-task-result-upload .el-dialog__body {
  padding-top: @dialogBodyPaddingTop;
  padding-bottom: @dialogBodyPaddingBottom;
}
.dialog-file-audit .el-dialog__body {
  padding-top: @dialogBodyPaddingTop;
  padding-bottom: @dialogBodyPaddingBottom;
}

.dialog-margin .el-dialog__header {
  padding-bottom: 0px;
}
.dialog-margin .el-dialog__body {
  padding-top: 0px;
}

.dialog-audit .el-dialog__body {
  padding-top: 0px;
  padding-bottom: 10px;
}

.dialog-task-form .el-dialog__body {
  padding-top: 0px;
  padding-left: 0px;
}
.dialog-progress .el-dialog__body {
  padding-top: 15px;
}

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
// scoped style
@headerPaddingTop: 20px;
@headerHeight: @headerPaddingTop + 60px;

.container-app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  .header-app {
    height: @headerHeight !important;
    position: fixed;
    background-color: white;
    width: 100%;
    left: 0;
    top: 0;
    z-index: 1000;
    padding-top: @headerPaddingTop;
    .col-header-avatar {
      text-align: right;
      padding-right: 10px;
    }
  }
  .main-app {
    margin-top: @headerHeight;
    padding: 0px;
  }

  .col-header-logo {
    text-align: left;
  }
}

.img-logo {
  height: 60px;
  width: 500px;
}
</style>
