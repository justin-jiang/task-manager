<template>
  <div>
    <el-row :class="rowItemClass">
      <el-col :span="2">
        <b>名称:</b>
      </el-col>
      <el-col :span="4">
        {{dataProp.realName}}
      </el-col>
      <el-col :span="2">
        <b>用户类型:</b>
      </el-col>
      <el-col :span="4">
        {{userType}}
      </el-col>
    </el-row>
    <el-row :class="rowItemClass">
      <el-col :span="2">
        <b>{{idTitle}}</b>
      </el-col>
      <el-col :span="4">
        {{ dataProp.identityNumber }}
      </el-col>
    </el-row>
    <el-row
      v-if="isCorp"
      :class="rowItemClass"
    >
      <el-col :span="2">
        <b>负责人姓名:</b>
      </el-col>
      <el-col :span="4">
        {{ dataProp.principalName }}
      </el-col>
      <el-col :span="2">
        <b>身份证:</b>
      </el-col>
      <el-col :span="4">
        {{ dataProp.principalIDNumber }}
      </el-col>
    </el-row>
    <el-row :class="rowItemClass">
      <el-col :span="2">
        <b>联系电话:</b>
      </el-col>
      <el-col :span="4">
        {{ dataProp.telephone }}
      </el-col>
      <el-col :span="2">
        <b>电子邮箱:</b>
      </el-col>
      <el-col :span="4">
        {{ dataProp.email }}
      </el-col>
    </el-row>
    <el-row :class="rowItemClass">
      <el-col :span="2">
        <b>区域:</b>
      </el-col>
      <el-col :span="10">
        {{ area }}
      </el-col>
    </el-row>
    <el-row :class="rowItemClass">
      <el-col :span="2">
        <b>详细地址:</b>
      </el-col>
      <el-col :span="10">
        {{ dataProp.address }}
      </el-col>
    </el-row>
    <el-row :class="rowItemClass">
      <el-col :span="2">
        <b>注册时间:</b>
      </el-col>
      <el-col :span="4">
        {{ timestampToText }}
      </el-col>
      <el-col :span="2">
        <b>综合评价:</b>
      </el-col>
      <el-col :span="4">
        <span style="margin-right:5px">{{ dataProp.qualificationScore }}</span>
        <el-rate
          v-model="dataProp.qualificationStar"
          disabled
          text-color="#ff9900"
          style="display:inline-block"
          disabled-void-color="rgb(188, 192, 198)"
        >
        </el-rate>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { UserDetailInTableTS } from "./UserDetailInTableTS";
export default class UserDetailInTableVue extends UserDetailInTableTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.row-item-border {
  padding: 10px;
  border-bottom: 1px solid cadetblue;
  &:nth-child(odd) {
    background: #f0f9eb;
  }
  &:first-child {
    border-top: 1px solid cadetblue;
  }
}
.row-item-dot-border {
  padding: 10px;
  &:not(:last-child) {
    border-bottom: 1px dotted rgb(202, 235, 15);
  }
}
</style>
