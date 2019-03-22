<template>
  <el-dialog
    width="30%"
    title="用户回访"
    class="dialog-publisher-visit"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="visibleProp"
  >
    <el-row class="row-dialog-item">
      <el-col :span="8">
        企业联系人：
      </el-col>
      <el-col
        :span="16"
        class="col-align-left"
      >
        {{publisherName}}
      </el-col>
    </el-row>
    <el-row class="row-dialog-item">
      <el-col :span="8">
        联系电话：
      </el-col>
      <el-col
        :span="16"
        class="col-align-left"
      >
        {{targetTaskPublisherView.telephone}}
      </el-col>
    </el-row>
    <el-row class="row-dialog-item">
      <el-col :span="8">
        满意度：
      </el-col>
      <el-col
        :span="16"
        class="col-align-left"
      >
        <el-rate v-model="reqParam.publisherRateStar">
        </el-rate>
      </el-col>
    </el-row>
    <el-row class="row-dialog-item">
      <el-col :span="8">
        备注：
      </el-col>
      <el-col
        :span="16"
        class="col-align-left"
      >
        <el-input
          type="textarea"
          :rows="4"
          placeholder="请输入内容"
          v-model="reqParam.publisherVisitNote"
        >
        </el-input>
      </el-col>
    </el-row>
    <el-row class="row-dialog-item">
      <el-col :span="24">
        <el-button
          type="primary"
          plain
          size="small"
          @click="onCancel()"
        >取消</el-button>
        <el-button
          type="primary"
          size="small"
          @click="onSubmit()"
        >提交</el-button>
      </el-col>
    </el-row>

  </el-dialog>
</template>

<script lang="ts">
import { PublisherVisitDialogTS } from "./PublisherVisitDialogTS";
export default class PublisherVisitDialogVue extends PublisherVisitDialogTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.row-dialog-item {
  margin-bottom: 10px;

  .col-align-left {
    text-align: left;
  }
}
</style>
