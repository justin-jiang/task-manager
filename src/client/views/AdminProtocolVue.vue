<template>
  <div>
    <el-row style="margin-bottom:10px">
      <el-alert
        type="info"
        center
        show-icon
        :closable="false"
      >
        <span
          slot="title"
          style="font-size:15px;"
        ><b>新用户注册协议，用户注册前可以下载此协议文件</b></span>
      </el-alert>

    </el-row>
    <el-row>
      <el-col :span=24>
        <SingleFileUploadVue
          :filePostParamProp="filePostParam"
          :fileTypesProp="fileTypes"
          :fileSizeMProp="fileSizeMLimit"
          @success="onUploadSuccess"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { AdminProtocolTS } from "./AdminProtocolTS";
export default class AdminProtocolVue extends AdminProtocolTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
