<template>
  <el-dialog
    width="420px"
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
        {{title}}
      </el-col>
    </el-row>
    <el-row class="row-item row-item-task-name">
      <el-col :span="4">
        名称：
      </el-col>
      <el-col :span="20">
        {{taskName}}
      </el-col>
    </el-row>
    <el-row class="row-item">
      <el-col
        :span="6"
        class="col-money-label"
      >
        退款金额：
      </el-col>
      <el-col
        :span="18"
        class="col-money"
      >
        ￥{{refundSum}}
      </el-col>
    </el-row>

    <el-row class="row-item row-item-border">
      <el-row class="row-item">
        <el-col :span="24">
          {{userName}}
        </el-col>
      </el-row>
      <el-row class="row-item">
        <el-col :span="24">
          开户银行：{{bankName}}
        </el-col>
      </el-row>
      <el-row class="row-item">
        <el-col :span="24">
          账户名称：{{bankAccountName}}
        </el-col>
      </el-row>
      <el-row class="row-item">
        <el-col :span="24">
          账号：{{bankAccountNumber}}
        </el-col>
      </el-row>
      <el-row class="row-item">
        <el-col :span="24">
          开户行联行号：{{linkBankAccountNumber}}
        </el-col>
      </el-row>
      <el-row class="row-item">
        <el-col :span="24">
          姓名：{{contactName}}
        </el-col>
      </el-row>
      <el-row class="row-item">
        <el-col :span="24">
          电话：{{contactTelephone}}
        </el-col>
      </el-row>
      <el-row class="row-item">
        <el-col :span="24">
          邮箱：{{contactEmail}}
        </el-col>
      </el-row>
    </el-row>

    <el-row class="row-item">
      <el-col :span="24">
        支付成功截图：备注请注明任务名称，及联系人姓名、电话
      </el-col>
    </el-row>
    <el-row
      class="row-item"
      style="text-align:center"
    >
      <el-col :span="24">
        <SingleImageUploaderVue
          :ref="imageUploaderRefName"
          :filePostParamProp="uploadParam"
          :noCropProp="true"
          :imageUidProp="imageUid"
          @change="onImageChanged"
          @reset="onImageReset"
          @success="onUploadSuccess"
          @failure="onUploadFailure"
        ></SingleImageUploaderVue>
      </el-col>
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
          :disabled="!isImageReady"
          @click="onSubmit()"
        >退款完毕</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { RefundDialogTS } from './RefundDialogTS';
export default class RefundDialogTSVue extends RefundDialogTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.row-item {
  margin-bottom: 15px;
  text-align: left;
  .col-money-label {
    margin-top: 2px;
  }
  .col-money {
    font-size: 16px;
    font-weight: 800;
    color: red;
  }
}
.row-item-task-name {
  font-size: 20px;
}

.img-pay-code {
  width: 30%;
}
.row-item-border {
  border-top: 1px solid cadetblue;
  border-bottom: 1px solid cadetblue;
}
</style>
