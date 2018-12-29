<template>
  <div>
    <el-row>
      <el-col :span=24>
        <ExecutorRegisterVue :userRoleProp="userRole" />
      </el-col>
    </el-row>
  </div>

</template>

<script lang="ts">
import { UserRegisterTS } from './UserRegisterTS';
export default class UserRegisterVue extends UserRegisterTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
