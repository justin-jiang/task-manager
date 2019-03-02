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
            v-if="toBeAuditInfoCount>0"
            :value="toBeAuditInfoCount"
            class="item"
          >
            <el-radio-button :label="toBeAuditInfoLab">待通过</el-radio-button>
          </el-badge>
          <el-radio-button
            v-else
            :label="toBeAuditInfoLab"
          >待通过</el-radio-button>

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
    <el-row>
      <el-col :span="24">
        <el-table
          style="width: 100%"
          stripe
          :ref="taskTableName"
          :data="filtredTaskObjs"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <TaskDetailInTableVue :dataProp="props.row"></TaskDetailInTableVue>
            </template>
          </el-table-column>
          <el-table-column
            label="名称"
            prop="name"
            width="400px"
          >
          </el-table-column>
          <el-table-column
            label="金额"
            prop="reward"
            width="100px"
          >
          </el-table-column>

          <el-table-column
            label="状态"
            width="100px"
          >
            <template slot-scope="scope">
              <span>{{taskStateToText(scope.row.state)}}</span>
            </template>
          </el-table-column>

          <el-table-column
            label="创建时间"
            width="200px"
          >
            <template slot-scope="scope">
              <span>{{timestampToText(scope.row.createTime)}}</span>
            </template>
          </el-table-column>

          <el-table-column align="right">
            <template
              slot="header"
              slot-scope="scope"
            >
              <el-input
                v-if="isSearchReady(scope.row)"
                v-model="search"
                size="mini"
                placeholder="任务名称搜索"
              />
            </template>
            <template slot-scope="scope">
              <el-button
                type="primary"
                size="mini"
                plain
                v-if="isInfoReadyToBeAudited(scope.$index, scope.row)"
                @click="onInfoAudit(scope.$index, scope.row)"
              >信息审核</el-button>

              <el-button
                type="primary"
                size="mini"
                plain
                v-if="isDepositReadyToBeAudited(scope.$index, scope.row)"
                @click="onDepositAudit(scope.$index, scope.row)"
              >托管资金审核</el-button>

              <el-button
                type="primary"
                size="mini"
                plain
                v-if="isMarginReadyToBeAudited(scope.$index, scope.row)"
                @click="onMarginAudit(scope.$index, scope.row)"
              >保证金审核</el-button>

              <el-button
                type="primary"
                size="mini"
                plain
                v-if="isResultReadyToBeAudited(scope.$index, scope.row)"
                @click="onResultAudit(scope.$index, scope.row)"
              >结果审核</el-button>

              <el-button
                type="primary"
                size="mini"
                plain
                v-if="isReadyToVisitPublisher(scope.$index, scope.row)"
                @click="onPublisherVisit(scope.$index, scope.row)"
              >用户回访</el-button>

              <el-button
                type="primary"
                size="mini"
                plain
                v-if="!isNotSubmitted(scope.$index, scope.row)"
                @click="onTaskProgressCheck(scope.$index, scope.row)"
              >进度查询</el-button>

              <el-button
                type="primary"
                size="mini"
                plain
                v-if="!isNotSubmitted(scope.$index, scope.row)"
                @click="onTaskDetailCheck(scope.$index, scope.row)"
              >任务详情</el-button>

            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!-- task process dialog -->
    <TaskProgressDialogVue
      :visibleProp="taskProgressDialogVisible"
      :targetTaskProp="selectedTask"
      @closed="onTaskProgressDialogClosed"
    >
    </TaskProgressDialogVue>

    <!-- publisher visit dialog -->
    <el-dialog
      width="30%"
      title="用户回访"
      class="dialog-publisher-visit"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="publisherVisitDialogVisible"
    >
      <el-row class="row-dialog-item">
        <el-col :span="8">
          企业联系人：
        </el-col>
        <el-col
          :span="16"
          class="col-align-left"
        >
          {{publisherOfSelectedTask.principalName}}
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
          {{publisherOfSelectedTask.telephone}}
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
          <el-rate v-model="publisherRateStar">
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
            v-model="publisherVisitNote"
          >
          </el-input>
        </el-col>
      </el-row>
      <el-row class="row-dialog-item">
        <el-col :span="24">
          <el-button
            type="primary"
            size="small"
            @click="onPublisherVisitSubmitted()"
          >提交</el-button>
          <el-button
            type="primary"
            plain
            size="small"
            @click="onPublisherVisitCancelled()"
          >取消</el-button>
        </el-col>
      </el-row>

    </el-dialog>

    <!-- dialog to audit the task info -->
    <AuditDialogVue
      titleProp="任务信息审核"
      widthProp="40%"
      :visibleProp="infoAuditDialogVisible"
      @submitted="onInfoAuditSubmitted"
      @cancelled="onInfoAuditCancelled"
    >
      【任务信息请点击’任务详情‘按钮查看】
    </AuditDialogVue>

    <!-- dialog for fund(deposit and margin) audit -->
    <AuditDialogVue
      :titleProp="fundAuditDialogTitle"
      :visibleProp="fundAuditDialogVisible"
      @submitted="onDepositAuditSubmitted"
      @cancelled="onDepositAuditCancelled"
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
            <span class="span-image-mask">
              <i
                class="el-icon-zoom-in"
                @click="onDepositPreview()"
              ></i>
            </span>
          </div>
        </el-col>
      </el-row>
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

    <!-- dialog for executor qualification audit -->
    <AuditDialogVue
      titleProp="雇员资质审核"
      :visibleProp="executorAuditDialogVisible"
      @submitted="onExecutorAuditSubmitted"
      @cancelled="onExecutorAuditCancelled"
    >
      <AvatarWithNameVue
        :nameProp="executorName"
        :logoUrlProp="executorLogoUrl"
        :qualificationStarProp="executorQualificationStar"
        :qualificationScoreProp="executorQualificationScore"
      ></AvatarWithNameVue>
    </AuditDialogVue>

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
}
</style>
