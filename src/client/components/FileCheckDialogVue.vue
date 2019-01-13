<template>
  <el-dialog
    width="30%"
    :title="titleProp"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="visibleProp"
  >
    <el-row style="margin-bottom:10px">
      <el-col :span="24">
        <span style="display:block;">点击下载</span>
        <el-button
          icon="el-icon-download"
          circle
          @click="onDownload"
        ></el-button>
      </el-col>
    </el-row>
    <el-row style="margin-bottom:10px">
      <el-col :span="24">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="如果拒绝，请输入原因"
          v-model="reasonOfDeny"
        >
        </el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="8">
        <el-button
          size="mini"
          type="primary"
          @click="onCheckAccepted()"
        >通过</el-button>
      </el-col>
      <el-col :span="8">
        <el-button
          size="mini"
          type="primary"
          @click="onCheckDenied()"
        >拒绝</el-button>
      </el-col>
      <el-col :span="8">
        <el-button
          size="mini"
          type="primary"
          @click="onCheckCanceled()"
        >取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { FileCheckDialogTS } from "./FileCheckDialogTS";
export default class FileCheckDialogVue extends FileCheckDialogTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
