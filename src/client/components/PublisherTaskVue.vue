<template>
  <el-tabs
    type="border-card"
    style="min-height:600px; padding:0px;"
    v-model="activeTabName"
    v-loading="isLoading"
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
        label-width="100px"
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
                <el-form
                  label-position="left"
                  class="task-table-expand"
                >
                  <el-form-item label="名称">
                    <span>{{ props.row.name }}</span>
                  </el-form-item>
                  <el-form-item label="金额">
                    <span>{{ props.row.reward }}</span>
                  </el-form-item>
                  <el-form-item label="发布人">
                    <span>{{ props.row.publisherName }}</span>
                  </el-form-item>
                  <el-form-item label="描述">
                    <span>{{ props.row.note }}</span>
                  </el-form-item>
                  <el-form-item label="状态">
                    <span>{{ taskStateToText(props.row.state) }}</span>
                  </el-form-item>
                  <el-form-item label="申请人">
                    <span>{{ props.row.applicantName }}</span>
                  </el-form-item>
                  <el-form-item label="执行人">
                    <span>{{ props.row.executorName }}</span>
                  </el-form-item>
                </el-form>
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
            <el-table-column align="right">
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
                  size="mini"
                  @click="onTaskSelect(scope.$index, scope.row)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="onTaskDelete(scope.$index, scope.row)"
                >删除</el-button>
                <el-button
                  v-if="isTaskApplying(scope.row)"
                  size="mini"
                  @click="onTaskApplyAccept(scope.$index, scope.row)"
                >接受申请</el-button>
                <el-button
                  v-if="isTaskApplying(scope.row)"
                  size="mini"
                  @click="onTaskApplyDeny(scope.$index, scope.row)"
                >拒绝申请</el-button>
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
