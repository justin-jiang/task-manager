<template>
  <el-tabs
    type="border-card"
    style="min-height:600px; padding:0px;"
    v-model="activeTabName"
  >
    <el-tab-pane
      label="可申请任务列表"
      :name="readyToApplyTaskTabName"
    >
      <el-table
        :data="readyToApplyTaskObjs().filter(data => !readyToApplyTaskSearch || data.name.toLowerCase().includes(readyToApplyTaskSearch.toLowerCase()))"
        style="width: 100%"
      >
        <el-table-column type="expand">
          <template slot-scope="props">
            <TaskDetailInTableVue :dataProp="props"></TaskDetailInTableVue>
          </template>
        </el-table-column>
        <el-table-column
          label="名称"
          prop="name"
        >
        </el-table-column>
        <el-table-column
          label="酬劳"
          prop="reward"
        >
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <span>{{taskStateToText(scope.row.state)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间">
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
              v-model="readyToApplyTaskSearch"
              size="mini"
              placeholder="输入关键字搜索"
            />
          </template>
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="onTaskApply(scope.$index, scope.row)"
            >申请</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>

    <el-tab-pane
      label="已申请任务列表"
      :name="appliedTaskTabName"
    >
      <el-row>
        <el-col :span="24">
          <el-table
            :data="appliedTaskObjs().filter(data => !appliedTaskSearch || data.name.toLowerCase().includes(appliedTaskSearch.toLowerCase()))"
            style="width: 100%"
          >
            <el-table-column type="expand">
              <template slot-scope="props">
                <TaskDetailInTableVue :dataProp="props"></TaskDetailInTableVue>
              </template>
            </el-table-column>
            <el-table-column
              label="名称"
              prop="name"
            >
            </el-table-column>
            <el-table-column
              label="酬劳"
              prop="reward"
            >
            </el-table-column>
            <el-table-column label="状态">
              <template slot-scope="scope">
                <span>{{taskStateToText(scope.row.state)}}</span>
              </template>
            </el-table-column>
            <el-table-column align="right">
              <template
                slot="header"
                slot-scope="scope"
              >
                <el-input
                  v-if="isSearchReady(scope.row)"
                  v-model="appliedTaskSearch"
                  size="mini"
                  placeholder="输入关键字搜索"
                />
              </template>
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  :disabled="!isTaskApplied(scope.$index, scope.row)"
                  @click="onSelectTaskResultUpload(scope.$index, scope.row)"
                >提交任务结果</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <el-row style="padding-top:100px">
        <el-col :span="24">
          <el-collapse
            v-model="activeCollapseNames"
            @change="onCollapseChange"
          >
            <el-collapse-item
              title="提交任务结果"
              :name="editCollapseName"
              :ref="editCollapseName"
              :id="editCollapseName"
            >
              <el-row>
                <el-col :span="24">
                  <SingleFileUploadVue
                    :filePostParamProp="filePostParam"
                    :fileTypesProp="taskResultFileTypes"
                    :fileSizeMProp="taskResultFileSizeMLimit"
                    @success="onTaskResultUploadSuccess"
                  />
                </el-col>
              </el-row>
              <el-row>

              </el-row>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>
    </el-tab-pane>
  </el-tabs>

</template>

<script lang="ts">
import { ExecutorTaskTS } from "./ExecutorTaskTS";
export default class ExecutorTaskVue extends ExecutorTaskTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
