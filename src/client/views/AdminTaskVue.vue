<template>
  <div>
    <!-- task radio button group -->
    <el-row>
      <el-col :span="24">
        <el-radio-group
          v-model="taskStateRadio"
          size="small"
        >
          <el-radio-button :label="allTasksLab">全部</el-radio-button>

          <el-badge
            v-if="toBeAuditDepositsCount>0"
            :value="toBeAuditDepositsCount"
            class="item"
          >
            <el-radio-button :label="toBeAuditDepositLab">待发布</el-radio-button>
          </el-badge>
          <el-radio-button
            v-else
            :label="toBeAuditDepositLab"
          >待发布</el-radio-button>

          <el-badge
            v-if="toBeAuditApplyCount>0"
            :value="toBeAuditApplyCount"
            class="item"
          >
            <el-radio-button :label="toBeAuditApplyLab">待受理</el-radio-button>
          </el-badge>
          <el-radio-button
            v-else
            :label="toBeAuditApplyLab"
          >待受理</el-radio-button>

          <el-badge
            v-if="toBeAuditResultCount>0"
            :value="toBeAuditResultCount"
            class="item"
          >
            <el-radio-button :label="toBeAuditResultLab">待审核</el-radio-button>
          </el-badge>
          <el-radio-button
            v-else
            :label="toBeAuditResultLab"
          >待审核</el-radio-button>

          <el-badge
            v-if="toBePublisherVistCount>0"
            :value="toBePublisherVistCount"
            class="item"
          >
            <el-radio-button :label="toBePublisherVistLab">待回访</el-radio-button>
          </el-badge>
          <el-radio-button
            v-else
            :label="toBePublisherVistLab"
          >待回访</el-radio-button>

          <el-badge
            v-if="toBePaiedTasksCount>0"
            :value="toBePaiedTasksCount"
            class="item"
          >
            <el-radio-button :label="toBePaiedLab">待支付</el-radio-button>
          </el-badge>
          <el-radio-button
            v-else
            :label="toBePaiedLab"
          >待支付</el-radio-button>

          <el-radio-button :label="completedLab">完结</el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>
    <!-- task table -->
    <el-row>
      <el-col :span="24">
        <TaskTableVue :dataProp="filteredTaskObjs">
          <template
            slot="buttons"
            slot-scope="scope"
          >
            <el-button
              type="primary"
              size="mini"
              plain
              v-if="isInfoReadyToBeAudited(scope.$index, scope.row)"
              @click.stop="onInfoAudit(scope.$index, scope.row)"
            >任务信息审核</el-button>

            <el-button
              type="primary"
              size="mini"
              plain
              v-if="isDepositReadyToBeAudited(scope.$index, scope.row)"
              @click.stop="onDepositAudit(scope.$index, scope.row)"
            >托管资金审核</el-button>

            <el-button
              type="primary"
              size="mini"
              plain
              v-if="isExecutorReadyToBeAudited(scope.$index, scope.row)"
              @click.stop="onExecutorAudit(scope.$index, scope.row)"
            >雇员资质审核</el-button>

            <el-button
              type="primary"
              size="mini"
              plain
              v-if="isMarginReadyToBeAudited(scope.$index, scope.row)"
              @click.stop="onMarginAudit(scope.$index, scope.row)"
            >保证金托管审核</el-button>

            <el-button
              type="primary"
              size="mini"
              plain
              v-if="isResultReadyToBeAudited(scope.$index, scope.row)"
              @click.stop="onResultAudit(scope.$index, scope.row)"
            >结果审核</el-button>

            <el-button
              type="primary"
              size="mini"
              plain
              v-if="isReadyToVisitPublisher(scope.$index, scope.row)"
              @click.stop="onPublisherVisit(scope.$index, scope.row)"
            >用户回访</el-button>

            <el-button
              type="primary"
              size="mini"
              plain
              v-if="isReadyToPayToExecutor(scope.$index, scope.row)"
              @click.stop="onPayToExecutor(scope.$index, scope.row)"
            >支付酬劳</el-button>

            <el-button
              type="primary"
              size="mini"
              plain
              v-if="isReadyToReceiptUpload(scope.$index, scope.row)"
              @click.stop="onReceiptUpload(scope.$index, scope.row)"
            >发票入账</el-button>

            <el-button
              type="primary"
              size="mini"
              plain
              v-if="!isNotSubmitted(scope.$index, scope.row)"
              @click.stop="onTaskProgressCheck(scope.$index, scope.row)"
            >进度查询</el-button>
          </template>
        </TaskTableVue>
      </el-col>
    </el-row>
    <!-- task process dialog -->
    <TaskProgressDialogVue
      :visibleProp="taskProgressDialogVisible"
      :taskProp="selectedTask"
      @closed="onTaskProgressDialogClosed"
    >
    </TaskProgressDialogVue>

    <!-- dialog to audit the task info -->
    <AuditDialogVue
      titleProp="任务信息审核"
      widthProp="400px"
      :visibleProp="infoAuditDialogVisible"
      @submit="onInfoAuditSubmit"
      @cancel="onInfoAuditCancel"
    >
      <el-alert
        title="审核前，请点击’任务详情‘按钮，查看任务信息"
        type="warning"
        center
        show-icon
      >
      </el-alert>
    </AuditDialogVue>

    <!-- dialog for deposit and margin audit -->
    <AuditDialogVue
      :titleProp="fundAuditDialogTitle"
      :visibleProp="fundAuditDialogVisible"
      :usageScenarioProp="fundScenario"
      @submit="onFundAuditSubmit"
      @cancel="onFundAuditCancel"
      @refund="onRefund"
    >
      <el-row class="row-dialog-item">
        <el-col :span="24">
          支付成功截图
        </el-col>
      </el-row>
      <el-row class="row-dialog-item">
        <el-col :span="24">
          <div class="div-image">
            <img
              id="img-deposit-orign"
              class="image-item"
              :src="fundImageUrl"
            >
            <span
              class="span-image-mask"
              @click="onFundPreview()"
            >
              <i
                class="el-icon-zoom-in"
                @click="onFundPreview()"
              ></i>
            </span>
          </div>
        </el-col>
      </el-row>
    </AuditDialogVue>

    <!-- dailog for deposit and margin refund -->
    <RefundDialogVue
      :visibleProp="refundAuditDialogVisible"
      :refundScenarioProp="refundScenario"
      :taskProp="selectedTask"
      :userProp="refundUser"
      @success="onRefundSuccess"
      @cancel="onRefundCancel"
    >

    </RefundDialogVue>

    <!-- dialog for executor qualification audit -->
    <AuditDialogVue
      titleProp="雇员资质审核"
      widthProp="40%"
      :visibleProp="executorAuditDialogVisible"
      @submit="onExecutorAuditSubmit"
      @cancel="onExecutorAuditCancel"
    >
      <AvatarWithNameVue
        :nameProp="executorName"
        :logoUrlProp="executorLogoUrl"
        :qualificationStarProp="executorQualificationStar"
        :qualificationScoreProp="executorQualificationScore"
      >
      </AvatarWithNameVue>
    </AuditDialogVue>

    <!-- dialog for result audit -->
    <FileCheckDialogVue
      titleProp="尽调结果审核"
      :scenarioProp="2"
      :targetFileUidProp="selectedTask.resultFileUid"
      :visibleProp="resultAuditDialogVisible"
      @submitted="onResultAuditSubmitted"
      @cancelled="onResultAuditCancelled"
      @download="onResultDownload"
    >
    </FileCheckDialogVue>

    <!-- publisher visit dialog -->
    <PublisherVisitDialogVue
      :visibleProp="publisherVisitDialogVisible"
      :taskProp="selectedTask"
      :targetTaskPublisherProp="publisherOfSelectedTask"
      @success="onPublisherVisitSuccess"
      @cancel="onPublisherVisitCancel"
      @failure="onPublisherVisitFailure"
    >
    </PublisherVisitDialogVue>

    <!-- dialog for pay to executor -->
    <PayToExecutorDialogVue
      :visibleProp="payToExecutorDialogVisible"
      :taskProp="selectedTask"
      :targetTaskExecutorProp="executorOfSelectedTask"
      @success="onPayToExecutorSuccess"
      @cancel="onPayToExecutorCancel"
    >
    </PayToExecutorDialogVue>

    <!-- receipt upload dialog -->
    <ReceiptUploadDialogVue
      :visibleProp="receiptDialogVisible"
      :taskProp="selectedTask"
      @success="onReceiptUploadSuccess"
      @cancel="onReceiptUploadCancel"
    >

    </ReceiptUploadDialogVue>
  </div>
</template>

<script lang="ts">
import { AdminTaskTS } from "./AdminTaskTS";
export default class AdminTaskVue extends AdminTaskTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
@maxImageHeight: 300px;
.row-dialog-item {
  margin-bottom: 10px;

  .div-image {
    position: relative;
    margin: 0 auto;
    .image-item {
      width: 100%;
      max-height: @maxImageHeight;
    }
    .span-image-mask {
      position: absolute;
      opacity: 0;
      left: 0px;
      top: 0px;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      text-align: center;
      font-size: 40px;
      &:hover {
        opacity: 50;
      }
      .el-icon-zoom-in {
        position: absolute;
        top: 50%;
        cursor: pointer;
        opacity: 10;
        color: antiquewhite;
      }
    }
  }

  .col-align-left {
    text-align: left;
  }
  .row-deadline-gt-5 {
    background: none;
  }
  .row-deadline-between-5-3 {
    background: yellow;
  }
  .row-deadline-lt-3 {
    background: red;
  }
}
</style>
