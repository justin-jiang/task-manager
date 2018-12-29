<template>
  <BasicUserRegisterVue
    :roleProp="userRole"
    @success="onSuccess"
  />

</template>

<script lang="ts">
import { AdminRegisterTS } from './AdminRegisterTS';
export default class AdminRegisterVue extends AdminRegisterTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
