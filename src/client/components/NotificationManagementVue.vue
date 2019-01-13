<template>
  <div v-show="isInitialized">
    <div v-if="hasNotification">
      <el-row
        style="margin-left:15%"
        v-for="item in renderedNotifications"
        :key="item.uid"
      >
        <el-col :span="18">
          <el-card
            class="box-card"
            style="margin-bottom:10px"
          >
            <div
              slot="header"
              class="clearfix"
            >
              <el-row>
                <el-col :span="12">
                  <el-badge
                    v-if="isUnread(item)"
                    value="new"
                    class="badge_item"
                  ><span style="margin-right:10px">{{item.title}}</span></el-badge>
                  <span v-else>{{item.title}}</span>
                </el-col>
                <el-col
                  :span="12"
                  style="text-align:right;min-width:350px"
                >
                  <span style="margin-right:10px">{{timestampToText(item.createTime)}}</span>
                  <el-button
                    v-if="isUnread(item)"
                    type="primary"
                    size="mini"
                    @click="onSetUnread(item)"
                  >标记为已读</el-button>
                  <el-button
                    v-if="needAction(item)"
                    type="primary"
                    size="mini"
                    @click="onActionClick(item)"
                  >{{getActionName(item)}}</el-button>
                </el-col>
              </el-row>
            </div>
            {{item.content }}
          </el-card>
        </el-col>
      </el-row>
    </div>
    <div v-else>
      <el-row>
        <el-col :span=24>
          没有消息
        </el-col>
      </el-row>
    </div>

    <el-dialog
      width="30%"
      title="申请者资料"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="executorInfoDialogVisible"
    >
      <el-row style="margin-bottom:10px">
        <el-col :span="24">
          显示内容待定。。。
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-button
            size="mini"
            type="primary"
            @click="onGoToAppliedTask()"
          >查看申请的任务</el-button>
        </el-col>
        <el-col :span="12">
          <el-button
            size="mini"
            type="primary"
            @click="onExecutorInfoDialogCancel()"
          >关闭</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { NotificationManagementTS } from "./NotificationManagementTS";
export default class NotificationManagementVue extends NotificationManagementTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.el-badge__content {
  right: 0px;
}
</style>
