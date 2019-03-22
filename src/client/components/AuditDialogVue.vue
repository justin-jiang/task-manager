<template>
  <el-dialog
    class="dialog-audit"
    :width="width"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :title="titleProp"
    :visible.sync="visibleProp"
  >
    <el-row class="row-item">
      <el-col :span="24">
        <slot></slot>
      </el-col>
    </el-row>
    <el-row class="row-item">
      <el-col :span="24">
        <el-switch
          v-model="auditState"
          active-text="通过"
          inactive-text="拒绝"
          active-color="#13ce66"
          inactive-color="#13ce66"
          :active-value="switchActiveValue"
          :inactive-value="switchInactiveValue"
        >
        </el-switch>
      </el-col>
    </el-row>
    <el-row
      v-if="isResultAuditDenied"
      class="row-item"
    >
      <el-col :span="24">
        <el-input
          type="textarea"
          placeholder="请输入拒绝原因"
          v-model="auditNote"
          :autosize="{ minRows: 2, maxRows: 4}"
        >
        </el-input>
      </el-col>
    </el-row>
    <el-row class="row-item">
      <el-col :span="24">
        <el-button
          size="small"
          type="primary"
          plain
          @click="onCancel()"
        >取消</el-button>
        <el-button
          size="small"
          type="danger"
          plain
          @click="onRefund()"
        >退款</el-button>
        <el-button
          size="small"
          type="primary"
          :disabled="!isReadySubmit"
          @click="onSubmit()"
        >提交</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { AuditDialogTS } from "./AuditDialogTS";
export default class AuditDialogVue extends AuditDialogTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.row-item {
  margin-bottom: 10px;
}
</style>
