<template>
  <el-dialog
    width="430px"
    custom-class="dialog-deposit"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="visibleProp"
  >
    <el-row
      class="row-item row-item-icon"
      slot="title"
    >
      <el-col :span="24">
        <img
          class="img-logo-cash"
          src="../assets/logo_cashRegister.png"
        />
      </el-col>
    </el-row>
    <el-row class="row-item row-item-title">
      <el-col :span="4">
        名称：
      </el-col>
      <el-col :span="20">
        {{taskName}}
      </el-col>
    </el-row>
    <el-row class="row-item">
      <el-col :span="6">
        任务金额￥：
      </el-col>
      <el-col :span="4">
        {{taskReward}}
      </el-col>
      <el-col :span="6">
        手续费￥：
      </el-col>
      <el-col :span="4">
        {{taskAgentFee}}
      </el-col>
    </el-row>
    <el-row class="row-item">
      <el-col
        :span="12"
        style="margin-right:10px"
      >
        <el-radio-group
          v-model="receiptRequired"
          size="mini"
        >
          <el-radio :label="LABEL_RECEIPT">开具发票</el-radio>
          <el-radio :label="LABEL_NO_RECEIPT">不开发票</el-radio>
        </el-radio-group>
      </el-col>

      <el-col :span="6">
        应付金额：
      </el-col>
      <el-col :span="4">
        ￥{{taskTotalFee}}
      </el-col>
    </el-row>
    <el-row class="row-item row-item-border">
      <el-tabs>
        <el-tab-pane label="在线支付">
          <el-row class="row-item">
            <el-col :span="24">
              <el-radio-group v-model="onlinePayType">
                <el-radio :label="1"><img src="../assets/alipay.png" /></el-radio>
                <el-radio :label="0"><img src="../assets/weixinpay.png" /></el-radio>
              </el-radio-group>
            </el-col>
          </el-row>
          <el-row
            class="row-item"
            style="text-align:center"
          >
            <el-col
              v-if="isAliPay"
              :span="24"
            >
              <img
                class="img-pay-code"
                src="../assets/aliPayCode.png"
              />
            </el-col>
            <el-col
              v-else
              :span="24"
            >
              <img
                class="img-pay-code"
                src="../assets/weixinPayCode.png"
              />
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="线下转账">
          <el-row class="row-item-no-margin">
            <el-col :span="24">
              <img src="../assets/logo_bank.png" />
            </el-col>
          </el-row>
          <el-row class="row-item-no-margin">
            <el-col :span="24">
              名称：北京金慧迪信用管理有限公司
            </el-col>
          </el-row>
          <el-row class="row-item-no-margin">
            <el-col :span="24">
              银行：中国民生银行股份有限公司北京分行营业部
            </el-col>
          </el-row>
          <el-row class="row-item">
            <el-col :span="24">
              账号：630720255
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
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
          :ref="depositUploaderRefName"
          :filePostParamProp="depositUploadParam"
          :noCropProp="true"
          :imageUidProp="depositUid"
          @change="onDepositImageChanged"
          @reset="onDepositImageReset"
          @success="onDepositUploadSuccess"
          @failure="onDepositUploadFailure"
        ></SingleImageUploaderVue>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <el-button
          type="primary"
          size="small"
          plain
          @click="onCancelled()"
        >取消</el-button>
        <el-button
          size="small"
          type="primary"
          :disabled="!isDepositImageReady"
          @click="onSubmit()"
        >支付完毕</el-button>

      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { DepositDialogTS } from "./DepositDialogTS";
export default class DepositDialogVue extends DepositDialogTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.row-item {
  margin-bottom: 15px;
  text-align: left;
}
.row-item-icon {
  margin-bottom: 10px;
}
.row-item-title {
  font-size: 20px;
  font-weight: 800;
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
