<template>
  <el-tabs
    type="border-card"
    style="min-height:600px; padding:0px;"
    v-model="activeTabName"
    v-loading="!isInitialized"
  >
    <el-tab-pane
      label="创建任务"
      :name="taskCreationTabName"
    >
      <el-form
        :model="taskCreationFormDatas"
        status-icon
        :rules="formRules"
        :ref="taskCreationFormRefName"
        style="max-width:1000px; margin: 0 auto;"
        label-width="160px"
        class="form-publishTask"
      >
        <el-form-item
          label="名称"
          prop="name"
        >
          <el-input v-model="taskCreationFormDatas.name"></el-input>
        </el-form-item>
        <el-form-item label="模板">
          <el-select
            v-model="templateIdOfTaskCreation"
            placeholder="请选择任务类型"
            @change="onTemplateChangeForTaskCreation"
          >
            <el-option
              v-for="item in getTemplateObjs()"
              :key="item.uid"
              :label="item.name"
              :value="item.uid"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="金额"
          prop="reward"
        >
          <el-input v-model="taskCreationFormDatas.reward"></el-input>
        </el-form-item>
        <el-form-item
          label="任务对象所在区域"
          prop="name"
        >
          <el-row>
            <el-col :span="8">
              <el-select
                v-model="taskCreationFormDatas.province"
                placeholder="请选择省或直辖市"
              >
                <el-option
                  v-for="item in provinces"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-select
                v-model="taskCreationFormDatas.city"
                placeholder="请选择市"
              >
                <el-option
                  v-for="item in cities"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-select
                v-model="taskCreationFormDatas.district"
                placeholder="请选择区"
              >
                <el-option
                  v-for="item in districts"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item
          label="地址"
          prop="address"
        >
          <el-input v-model="taskCreationFormDatas.address"></el-input>
        </el-form-item>
        <el-form-item
          label="描述"
          prop="note"
        >
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入任务描述内容"
            v-model="taskCreationFormDatas.note"
          >
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="submitTaskCreationForm()"
          >提交</el-button>
          <el-button @click="resetTaskCreationForm()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>

    <el-tab-pane
      label="任务列表"
      :name="taskListTabName"
    >
      <el-row>
        <el-col :span="24">
          <el-table
            :data="getTaskObjs().filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
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
              label="金额"
              prop="reward"
            >
            </el-table-column>
            <el-table-column label="状态">
              <template slot-scope="scope">
                <span>{{taskStateToText(scope.row.state)}}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间">
              <template slot-scope="scope">
                <span>{{timestampToText(scope.row.createTime)}}</span>
              </template>
            </el-table-column>
            <el-table-column
              align="right"
              min-width="300"
            >
              <template
                slot="header"
                slot-scope="scope"
              >
                <el-input
                  v-if="isSearchReady(scope.row)"
                  v-model="search"
                  size="mini"
                  placeholder="输入关键字搜索"
                />
              </template>
              <template slot-scope="scope">
                <el-button
                  v-if="isTaskReadyToAssign(scope.row)"
                  size="mini"
                  @click="onTaskApplyAccepted(scope.$index, scope.row)"
                >接受申请</el-button>
                <el-button
                  v-if="isTaskReadyToAssign(scope.row)"
                  size="mini"
                  @click="onTaskApplyDenied(scope.$index, scope.row)"
                >拒绝申请</el-button>
                <el-button
                  type="primary"
                  size="mini"
                  v-if="isTaskResultUploaded(scope.row)"
                  @click="onTaskResultDownload(scope.$index, scope.row)"
                >任务结果下载</el-button>
                <el-button
                  v-if="isTaskResultUploaded(scope.row)"
                  size="mini"
                  @click="onTaskResultAccepting(scope.$index, scope.row)"
                >通过</el-button>
                <el-button
                  v-if="isTaskResultUploaded(scope.row)"
                  size="mini"
                  @click="onTaskResultDenied(scope.$index, scope.row)"
                >拒绝</el-button>
                <el-button
                  size="mini"
                  @click="onTaskSelect(scope.$index, scope.row)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="onTaskDelete(scope.$index, scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <el-row style="padding-top:100px">
        <el-col :span="24">
          <el-collapse
            :id="editCollapseName"
            v-model="activeCollapseNames"
            @change="onCollapseChange"
          >
            <el-collapse-item
              title="任务编辑"
              :name="editCollapseName"
            >
              <el-row>
                <el-col :span="24">
                  <el-form
                    :model="formEditDatas"
                    :ref="formEditRefName"
                    :rules="formRules"
                    style="max-width:1000px; min-width:500px;"
                    label-width="100px"
                    class="form-templateUpload"
                  >
                    <el-form-item
                      label="名称"
                      prop="name"
                    >
                      <el-input v-model="formEditDatas.name"></el-input>
                    </el-form-item>
                    <el-form-item
                      label="金额"
                      prop="reward"
                    >
                      <el-input v-model="formEditDatas.name"></el-input>
                    </el-form-item>
                    <el-form-item
                      label="备注"
                      prop="note"
                    >
                      <el-input v-model="formEditDatas.note"></el-input>
                      <el-button
                        type="primary"
                        style="margin-top:100px;"
                        :disabled="!isBasicInfoUpdated()"
                        @click="onTaskInfoEditSubmit()"
                      >更新基本信息</el-button>
                    </el-form-item>
                    <el-form-item label="">

                    </el-form-item>
                  </el-form>
                </el-col>
              </el-row>
              <el-row>

              </el-row>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>
      <el-dialog
        width="30%"
        title="任务结果审核通过"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :visible.sync="taskResultAcceptDialogVisible"
      >
        <el-row>
          <el-col :span="24">
            <el-rate
              v-model="taskResultRate"
              show-text
            >
            </el-rate>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-button
              size="mini"
              type="primary"
              @click="onTaskResultAccepted()"
            >确认</el-button>
          </el-col>
          <el-col :span="12">
            <el-button
              size="mini"
              type="primary"
              @click="onTaskResultCanceled()"
            >取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>

    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts">
import { PublisherTaskTS } from "./PublisherTaskTS";
export default class PublisherVue extends PublisherTaskTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
