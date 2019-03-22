<template>
  <el-dialog
    width="30%"
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
          src="../assets/logo_cashRegister.png"
        />
      </el-col>
      <el-col :span="14">
        支付酬劳
      </el-col>
    </el-row>
    <el-row class="row-item">
      <el-col :span="6">
        名称：
      </el-col>
      <el-col :span="18">
        {{taskName}}
      </el-col>
    </el-row>
    <el-row class="row-item">
      <el-col :span="5">
        任务金额￥：
      </el-col>
      <el-col :span="3">
        {{taskReward}}
      </el-col>
      <el-col :span="5">
        手续费￥：
      </el-col>
      <el-col :span="3">
        {{taskAgentFee}}
      </el-col>
      <el-col :span="5">
        保证金￥：
      </el-col>
      <el-col :span="3">
        {{taskMargin}}
      </el-col>
    </el-row>
    <el-row class="row-item">
      <el-col
        :span="12"
        style="margin-right:10px"
      >
        <el-radio-group
          disabled
          v-model="receiptRequired"
          size="mini"
        >
          <el-radio :label="1">开具发票</el-radio>
          <el-radio :label="0">不开发票</el-radio>
        </el-radio-group>
      </el-col>

      <el-col :span="6">
        应付金额：
      </el-col>
      <el-col :span="4">
        ￥{{payableFee}}
      </el-col>
    </el-row>
    <el-row class="row-item row-item-border">
      <el-row class="row-item-no-margin">
        <el-col :span="24">
          雇员名称：{{executorName}}
        </el-col>
      </el-row>
      <el-row class="row-item-no-margin">
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
          :disabled="!isImageReady"
          @click="onSubmit()"
        >支付完毕</el-button>

        <el-button
          size="small"
          @click="onCancel()"
        >取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { PayToExecutorDialogTS } from "./PayToExecutorDialogTS";
export default class PayToExecutorDialogVue extends PayToExecutorDialogTS {}
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
