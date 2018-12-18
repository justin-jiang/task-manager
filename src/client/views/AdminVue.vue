<template>
  <el-container>
    <AdminUserRegister :v-if="!isAdminReady" />
  </el-container>
</template>

<script lang="ts">
import { AdminTS } from './AdminTS';
export default class AdminVue extends AdminTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
