<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-alert
          :title="errorMessage()"
          type="error"
          center
          show-icon
        >
        </el-alert>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <img
          style="max-height:600px;cursor: pointer;"
          src="../assets/error_500.jpg"
          @click="onImageClick"
        ></el-col>
    </el-row>

  </div>
</template>

<script lang="ts">
import { ErrorTS } from "./ErrorTS";
export default class ErrorVue extends ErrorTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
