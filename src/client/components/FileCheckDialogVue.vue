<template>
  <el-dialog
    width="30%"
    :title="titleProp"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="visibleProp"
  >
    <el-row class="row-item">
      <el-col :span="24">
        <span style="display:block;">点击下载</span>
        <el-button
          icon="el-icon-download"
          circle
          @click="onDownload"
        ></el-button>
      </el-col>
    </el-row>
    <el-row class="row-item">
      <el-col :span="24">
        <el-switch
          v-model="checkState"
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
      class="row-item"
      v-if="isDenied"
    >
      <el-col :span="24">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="请输入拒绝原因"
          v-model="checkNote"
        >
        </el-input>
      </el-col>
    </el-row>
    <el-row
      class="row-item"
      v-else
    >
      <el-col
        :span="12"
        v-if="isQualificationCheck"
      >
        <span>资质评级</span>
        <el-rate
          v-model="rateStar"
          @change="onRateChange"
        >
        </el-rate>
      </el-col>
      <el-col
        :span="12"
        v-if="isQualificationCheck"
      >
        <span>综合得分（0-100）</span>
        <el-input-number
          style="display:block;width:100%"
          size="mini"
          v-model="rateScore"
          :min="0"
          :max="100"
          :controls="false"
        ></el-input-number>
      </el-col>
      <el-col
        :span="24"
        v-if="isTaskResultCheck"
      >
        <span>满意度</span>
        <el-rate
          v-model="rateStar"
          @change="onRateChange"
        >
        </el-rate>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-button
          size="small"
          type="primary"
          :disabled="!isReadySubmit"
          @click="onSubmit()"
        >提交</el-button>
      </el-col>

      <el-col :span="12">
        <el-button
          size="small"
          type="primary"
          plain
          @click="onCancelled()"
        >取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { FileCheckDialogTS } from "./FileCheckDialogTS";
export default class FileCheckDialogVue extends FileCheckDialogTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.row-item {
  margin-bottom: 10px;
}
</style>
