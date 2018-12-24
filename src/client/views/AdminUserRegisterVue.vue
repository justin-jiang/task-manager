<template>
  <BasicUserRegisterVue
    :roleProp="userRole"
    @success="onSuccess"
  />

</template>

<script lang="ts">
import { AdminUserRegisterTS } from './AdminUserRegisterTS';
export default class AdminUserRegisterVue extends AdminUserRegisterTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
