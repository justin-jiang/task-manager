<template>
  <div>
    <el-row>
      <el-col
        :span="12"
        style="margin-top:18px;padding-right:8px"
      >
        <span>{{nameProp}}</span>
      </el-col>
      <el-col :span="12">
        <avatar :image="logoUrlProp"></avatar>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { AvatarWithNameTS } from "./AvatarWithNameTS";
export default class AvatarWithNameVue extends AvatarWithNameTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
