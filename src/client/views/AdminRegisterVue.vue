<template>
  <div>
    <el-row style="padding-bottom:50px;font-size:20px;text-align:left;">
      <el-col :span=24>
        <span>系统管理员注册</span>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span=24>
        <BasicUserRegisterVue
          :roleProp="userRole"
          @success="onSuccess"
          @failure="onFailure"
        />
      </el-col>
    </el-row>
  </div>

</template>

<script lang="ts">
import { AdminRegisterTS } from "./AdminRegisterTS";
export default class AdminRegisterVue extends AdminRegisterTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
