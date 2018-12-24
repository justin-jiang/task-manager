<template>
  <ExecutorRegisterVue :userRoleProp="userRole" />
</template>

<script lang="ts">
import { UserRegisterTS } from './UserRegisterTS';
export default class UserRegisterVue extends UserRegisterTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
