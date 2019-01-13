<template>
  <el-dialog
    width="30%"
    title="身份审核"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="visibleProp"
  >
    <!-- logo check -->
    <el-row v-if="isLogoToBeChecked">
      <el-col :span="12">
        头像
      </el-col>
      <el-col :span="12">
        <el-switch
          v-model="idCheckParam.logoState"
          active-text="通过"
          inactive-text="拒绝"
          active-color="#13ce66"
          inactive-color="#13ce66"
          :active-value="logoSwitchActiveValue"
          :inactive-value="logoSwitchInactiveValue"
        >
        </el-switch>
      </el-col>
    </el-row>
    <el-row v-if="isLogoToBeChecked">
      <el-col :span="24">
        <img
          style="width:100%;height:100%"
          :src="logoUrl"
        >
      </el-col>
    </el-row>
    <el-row v-if="isLogoToBeChecked" style="margin-bottom:10px">
      <el-col :span="24">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="如果拒绝，请输入原因"
          v-model="idCheckParam.noteForLogo"
        >
        </el-input>
      </el-col>
    </el-row>
    <!-- frontId check -->
    <el-row v-if="isFrontIdToBeChecked">
      <el-col :span="12">
        {{titleOfFrontImage}}
      </el-col>
      <el-col :span="12">
        <el-switch
          v-model="idCheckParam.frontIdState"
          active-text="通过"
          inactive-text="拒绝"
          active-color="#13ce66"
          inactive-color="#13ce66"
          :active-value="idSwitchActiveValue"
          :inactive-value="idSwitchInactiveValue"
        >
        </el-switch>
      </el-col>
    </el-row>
    <el-row v-if="isFrontIdToBeChecked">
      <el-col :span="24">
        <img
          style="width:100%;height:100%"
          :src="frontImageUrl"
        >
      </el-col>
    </el-row>
    <el-row v-if="isFrontIdToBeChecked" style="margin-bottom:10px">
      <el-col :span="24">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="如果拒绝，请输入原因"
          v-model="idCheckParam.noteForFrontId"
        >
        </el-input>
      </el-col>
    </el-row>
    <!-- backId check -->
    <el-row v-if="isBackIdToBeChecked">
      <el-col :span="12">
        {{titleOfBackImage}}
      </el-col>
      <el-col :span="12">
        <el-switch
          v-model="idCheckParam.backIdState"
          active-text="通过"
          inactive-text="拒绝"
          active-color="#13ce66"
          inactive-color="#13ce66"
          :active-value="idSwitchActiveValue"
          :inactive-value="idSwitchInactiveValue"
        >
        </el-switch>
      </el-col>
    </el-row>
    <el-row v-if="isBackIdToBeChecked">
      <el-col :span="24">
        <img
          style="width:100%;height:100%"
          :src="backImageUrl"
        >
      </el-col>
    </el-row>
    <el-row v-if="isBackIdToBeChecked" style="margin-bottom:10px">
      <el-col :span="24">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="如果拒绝，请输入原因"
          v-model="idCheckParam.noteForBackId"
        >
        </el-input>
      </el-col>
    </el-row>

    <!-- footer -->
    <el-row
      slot="footer"
      class="dialog-footer"
    >
      <el-col :span="12">
        <el-button
          size="mini"
          type="primary"
          @click="onCheckSubmit()"
        >提交</el-button>
      </el-col>
      <el-col :span="12">
        <el-button
          size="mini"
          type="primary"
          @click="onCheckCanceled()"
        >取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { IdentityCheckDialogTS } from "./IdentityCheckDialogTS";
export default class IdentityCheckDialogVue extends IdentityCheckDialogTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
