<template>
  <div>
    <el-row class="row-align-form">
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
.row-align-form {
  padding-bottom: 20px;
  font-size: 20px;
}
</style>
