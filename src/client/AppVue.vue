<template>
  <el-container id="app">
    <el-header id="nav">
      <el-row>
        <el-col :span="16">
          <span>替换为图片。。。</span>
        </el-col>
        <el-col
          :span="8"
          style="text-align:right;"
        >
          <el-dropdown @command="handleCommand">
            <AvatarWithNameVue
              :nameProp="logUserName"
              :logoUrlProp="logoUrl"
            ></AvatarWithNameVue>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="LogoffCommand">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>

      </el-row>

    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>
<script lang="ts">
import { AppTS } from "./AppTS";
export default class AppVue extends AppTS {}
</script>
<style lang="less">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 800px;
}
#nav {
  height: 50px;
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
.el-main {
  padding: 0px;
}

.el-menu-view-page {
  margin-bottom: 10px;
}
</style>
