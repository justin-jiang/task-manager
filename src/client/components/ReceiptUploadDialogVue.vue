<template>
  <el-dialog
    width="450px"
    custom-class="dialog-deposit"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="visibleProp"
  >
    <el-row
      class="row-item"
      slot="title"
    >
      <el-col :span="10">
        <img
          class="img-logo-cash"
          src="../assets/logo_cashRegister.jpg"
        />
      </el-col>
      <el-col
        :span="14"
        class="col-dialog-title"
      >
        发票入账
      </el-col>
    </el-row>

    <el-row class="row-item">
      <el-col
        :span="24"
        style="margin-right:10px"
      >
        <el-radio-group
          :disabled="!isReceiptStateNone"
          v-model="executorReceiptRequired"
          size="mini"
        >
          <el-radio :label="labelOfReceipt">开具发票</el-radio>
          <el-radio :label="labelOfNoReceipt">不开发票</el-radio>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-row class="row-item">
      <div v-if="isReceiptRequired">
        <el-row class="row-item">
          <el-col :span="5">
            发票号码
          </el-col>
          <el-col :span="19">
            <el-input
              placeholder="不能为空"
              v-model="uploadOptionParam.executorReceiptNumber"
            ></el-input>
          </el-col>
        </el-row>
        <el-row class="row-item">
          <el-col :span="5">
            开票日期
          </el-col>
          <el-col :span="19">
            <el-date-picker
              v-model="uploadOptionParam.executorReceiptDatetime"
              type="date"
              placeholder="选择日期"
              value-format="timestamp"
            >
            </el-date-picker>
          </el-col>
        </el-row>
        <el-row class="row-item">
          <el-col :span="5">
            发票上传
          </el-col>
          <el-col :span="19">
            <SingleImageUploaderVue
              :ref="imageUploaderRefName"
              :filePostParamProp="uploadParam"
              :noCropProp="true"
              @change="onImageChanged"
              @reset="onImageReset"
              @success="onUploadSuccess"
              @failure="onUploadFailure"
            ></SingleImageUploaderVue>
          </el-col>
        </el-row>
      </div>
      <div v-else>
        <el-row class="row-item">
          <el-col :span="5">
            不开票理由
          </el-col>
          <el-col :span="19">
            <el-input
              type="textarea"
              placeholder="不能为空"
              v-model="notRequiredOptionParam.executorReceiptNote"
              :autosize="{ minRows: 2, maxRows: 4}"
            >
            </el-input>
          </el-col>
        </el-row>
      </div>
    </el-row>

    <el-row>
      <el-col :span="24">
        <el-button
          size="small"
          type="primary"
          plain
          @click="onCancel()"
        >取消</el-button>
        <el-button
          size="small"
          type="primary"
          :disabled="!isReadyToSubmit"
          @click="onSubmit()"
        >提交</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { ReceiptUploadDialogTS } from './ReceiptUploadDialogTS';
export default class ReceiptUploadDialogVue extends ReceiptUploadDialogTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.row-item {
  margin-bottom: 15px;
  text-align: left;
}

.row-item-no-margin {
  text-align: left;
}

.img-pay-code {
  width: 30%;
}
.row-item-border {
  border-top: 1px solid cadetblue;
  border-bottom: 1px solid cadetblue;
}
</style>
