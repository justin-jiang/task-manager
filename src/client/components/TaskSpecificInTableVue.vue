<template>
  <div>
    <!-- basic info -->
    <el-row class="row-item row-titile">
      <el-col
        :span=24
        class="col-title"
      >
        基本信息
      </el-col>
    </el-row>
    <el-row class="row-item">
      <el-col :span=24>
        <el-row class="row-sub-item">
          <el-col :span="1">
            <b>名称:</b>
          </el-col>
          <el-col :span="4">
            {{targetTask.name}}
          </el-col>
          <el-col :span="1">
            <b> 金额:</b>
          </el-col>
          <el-col :span="4">
            {{targetTask.reward}}
          </el-col>
          <el-col :span="2">
            <b>建议保证金:</b>
          </el-col>
          <el-col :span="3">
            {{targetTask.proposedMargin}}
          </el-col>
          <el-col :span="2">
            <b>截止日期:</b>
          </el-col>
          <el-col :span="3">
            {{ timestampToText(targetTask.deadline) }}
          </el-col>
        </el-row>
        <el-row class="row-sub-item">
          <el-col :span="6">
            <b>任务对象所在区域:</b>
          </el-col>
          <el-col :span="4">
            {{ locationToText }}
          </el-col>
        </el-row>
        <el-row class="row-sub-item">
          <el-col :span="2">
            <b>雇员类别:</b>
          </el-col>
          <el-col :span="4">
            {{ executorTypes }}
          </el-col>
          <el-col :span="2">
            <b>雇员资质:</b>
          </el-col>
          <el-col :span="4">
            {{ executorStar }}
          </el-col>
        </el-row>
        <el-row class="row-sub-item">
          <el-col :span="1">
            <b>描述:</b>
          </el-col>
          <el-col :span="23">
            {{ targetTask.note }}
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <!-- detailed info -->
    <el-row
      v-if="isAdmin || isTaskPublisher || isTaskExecutor"
      class="row-item row-titile"
    >
      <el-col
        :span=24
        class="col-title"
      >
        关键信息
      </el-col>
    </el-row>
    <el-row
      v-if="isAdmin || isTaskPublisher || isTaskExecutor"
      class="row-item"
    >
      <el-col :span=24>
        <el-row class="row-sub-item">
          <el-col :span="3">
            <b>受访企业名称:</b>
          </el-col>
          <el-col :span="9">
            {{ targetTask.companyName }}
          </el-col>
          <el-col :span="3">
            <b>受访企业地址:</b>
          </el-col>
          <el-col :span="9">
            {{ targetTask.address }}
          </el-col>
        </el-row>
        <el-row class="row-sub-item">
          <el-col :span="3">
            <b>企业联系人:</b>
          </el-col>
          <el-col :span="3">
            {{ targetTask.companyContact }}
          </el-col>
          <el-col :span="3">
            <b>联系电话:</b>
          </el-col>
          <el-col :span="3">
            {{ targetTask.contactPhone }}
          </el-col>
          <el-col :span="3">
            <b>联系邮箱:</b>
          </el-col>
          <el-col :span="4">
            {{ targetTask.contactEmail }}
          </el-col>
        </el-row>
        <el-row
          v-if="isTaskExecutor || isAdmin"
          class="row-sub-item"
        >
          <el-col
            :span="24"
            class="col-center"
          >
            <el-button
              type="primary"
              size="small"
              icon="el-icon-download"
              @click="onDownloadTaskTemplate(targetTask)"
            >任务模板下载</el-button>
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <!-- task result -->
    <el-row
      v-if="(isAdmin || isTaskPublisher) && isTaskResultReady"
      class="row-item row-titile"
    >
      <el-col
        :span=24
        class="col-title"
      >
        尽调结果
      </el-col>
    </el-row>
    <el-row
      v-if="(isAdmin || isTaskPublisher) && isTaskResultReady"
      class="row-item"
    >
      <el-row class="row-sub-item">
        <el-col :span="3">
          <b>尽调时间:</b>
        </el-col>
        <el-col :span="9">
          {{ resultUploadDate }}
        </el-col>
        <el-col
          :span="12"
          class="col-center"
        >
          <el-button
            type="primary"
            size="small"
            icon="el-icon-download"
            :disabled="!isTaskResultReady"
            @click="onDownloadResult(targetTask)"
          >尽调结果下载</el-button>
        </el-col>
      </el-row>
    </el-row>

    <!-- task publisher info -->
    <el-row
      v-if="isAdmin"
      class="row-item row-titile"
    >
      <el-col
        :span=24
        class="col-title"
      >
        雇主信息
      </el-col>
    </el-row>
    <el-row
      v-if="isAdmin"
      class="row-item"
    >
      <el-col :span=24>
        <UserDetailInTableVue
          :dataProp="taskPublisher"
          :borderStyleProp="0"
        ></UserDetailInTableVue>
      </el-col>
    </el-row>

    <!-- task executor info -->
    <el-row
      v-if="isAdmin && isTaskExecutorReady"
      class="row-item row-titile"
    >
      <el-col
        :span=24
        class="col-title"
      >
        雇员信息
      </el-col>
    </el-row>
    <el-row
      v-if="isAdmin && isTaskExecutorReady"
      class="row-item"
    >
      <el-col :span=24>
        <UserDetailInTableVue
          :dataProp="taskExecutor"
          :borderStyleProp="0"
        ></UserDetailInTableVue>
      </el-col>
    </el-row>

    <!-- Star Info -->
    <el-row
      v-if="isAdmin && isTaskResultReady"
      class="row-item row-titile"
    >
      <el-col
        :span=24
        class="col-title"
      >
        评价信息
      </el-col>
    </el-row>
    <el-row
      v-if="isAdmin && isTaskResultReady"
      class="row-item"
    >
      <el-col :span=24>
        <el-row class="row-sub-item">
          <el-col :span=4>平台评价：</el-col>
          <el-col :span=20>
            <el-rate
              v-model="targetTask.adminSatisfiedStar"
              disabled
              text-color="#ff9900"
              style="display:inline-block"
              disabled-void-color="rgb(188, 192, 198)"
            >
            </el-rate>
            <span style="margin-right:5px">{{ getScore(targetTask.adminSatisfiedStar) }}</span>
          </el-col>
        </el-row>
        <el-row class="row-sub-item">
          <el-col :span=4>雇主评价：</el-col>
          <el-rate
            v-model="targetTask.publisherResultSatisfactionStar"
            disabled
            text-color="#ff9900"
            style="display:inline-block"
            disabled-void-color="rgb(188, 192, 198)"
          >
          </el-rate>
          <span style="margin-right:5px">{{ getScore(targetTask.publisherResultSatisfactionStar) }}</span>
        </el-row>
        <el-row class="row-sub-item">
          <el-col :span=4>用户回访：</el-col>
          <el-rate
            v-model="targetTask.publisherVisitStar"
            disabled
            text-color="#ff9900"
            style="display:inline-block"
            disabled-void-color="rgb(188, 192, 198)"
          >
          </el-rate>
          <span style="margin-right:5px">{{ getScore(targetTask.publisherResultSatisfactionStar) }}</span>
        </el-row>
        <el-row class="row-sub-item">
          <el-col :span=4>综合评价：</el-col>
          <el-rate
            v-model="averageStar"
            disabled
            text-color="#ff9900"
            style="display:inline-block"
            disabled-void-color="rgb(188, 192, 198)"
          >
          </el-rate>
          <span style="margin-right:5px">{{ averageScore }}</span>
        </el-row>
      </el-col>
    </el-row>

    <!-- Payment info -->
    <el-row
      v-if="isAdmin && isTaskResultReady"
      class="row-item row-titile"
    >
      <el-col
        :span=24
        class="col-title"
      >
        支付信息
      </el-col>
    </el-row>
    <el-row
      class="row-item"
      v-if="isAdmin && isTaskResultReady"
    >
      <el-col :span=24>
        <el-row class="row-sub-item">
          <el-col :span="3">
            <b>雇主资金托管:</b>
          </el-col>
          <el-col :span="5">
            {{ targetTask.reward }}
          </el-col>
          <el-col :span="3">
            <b>雇员保证金托管:</b>
          </el-col>
          <el-col :span="5">
            {{ targetTask.proposedMargin }}
          </el-col>
          <el-col :span="3">
            <b>平台支付酬劳及保证金:</b>
          </el-col>
          <el-col :span="5">
            {{ targetTask.paymentToExecutor }}
          </el-col>
        </el-row>
        <el-row class="row-sub-item">
          <el-col :span="3">
            <b>雇员:</b>
          </el-col>
          <el-col :span="5">
            <el-radio-group
              disabled
              v-model="targetTask.executorReceiptRequired"
              size="mini"
            >
              <el-radio :label="LABEL_RECEIPT">开具发票</el-radio>
              <el-radio :label="LABEL_NO_RECEIPT">不开发票</el-radio>
            </el-radio-group>
          </el-col>
          <el-col :span="4">
            <b>发票入账：</b><span>￥{{executorReceiptFee}}</span>
          </el-col>
          <el-col :span="3">
            <b>雇主:</b>
          </el-col>
          <el-col :span="5">
            <el-radio-group
              disabled
              v-model="targetTask.publisherReceiptRequired"
              size="mini"
            >
              <el-radio :label="LABEL_RECEIPT">开具发票</el-radio>
              <el-radio :label="LABEL_NO_RECEIPT">不开发票</el-radio>
            </el-radio-group>
          </el-col>
          <el-col :span="4">
            <b>开具发票：</b><span>￥{{publisherReceiptFee}}</span>
          </el-col>
        </el-row>
      </el-col>

    </el-row>

  </div>
</template>

<script lang="ts">
import { TaskSpecificInTableTS } from './TaskSpecificInTableTS';
export default class TaskSpecificInTableVue extends TaskSpecificInTableTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.row-item {
  padding: 10px;
  border-bottom: 1px solid cadetblue;
  &:nth-child(odd) {
    background: #f0f9eb;
  }
  &:first-child {
    border-top: 1px solid cadetblue;
  }
  .row-sub-item {
    padding: 10px;
    &:not(:last-child) {
      border-bottom: 1px dotted rgb(202, 235, 15);
    }
    .col-sub-item-date {
      margin-top: 12px;
    }
    .col-center {
      text-align: center;
    }
  }
}
.row-titile {
  text-align: center;
  font-weight: 800;
  font-size: 16px;
  background: white !important;
  color: darkgray;
}
</style>
