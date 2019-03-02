<template>
  <div>
    <el-row>
      <el-col :span=24>
        <el-form
          label-width="160px"
          class="form-main"
          :model="formData"
          status-icon
          :rules="formRules"
          :ref="taskFormRefName"
          :disabled="isSubmitted || isDetail"
        >
          <el-form-item label="基本信息"></el-form-item>
          <el-form-item
            label="名称"
            prop="name"
          >
            <el-input v-model="formData.name"></el-input>
          </el-form-item>
          <el-form-item
            label="金额"
            prop="reward"
          >
            <el-input-number
              v-model="formData.reward"
              style="display:block;width:100%"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item
            label="建议保证金"
            prop="proposedMargin"
          >
            <el-input-number
              v-model="formData.proposedMargin"
              style="display:block;width:100%"
              :controls="false"
            ></el-input-number>
          </el-form-item>
          <el-form-item
            label="截止时间"
            prop="deadline"
          >
            <el-date-picker
              v-model="formData.deadline"
              type="date"
              placeholder="选择日期"
              value-format="timestamp"
              :picker-options="pickerOptions"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item
            label="任务对象所在区域"
            prop="area"
          >
            <el-row>
              <el-col :span="8">
                <el-select
                  v-model="formData.province"
                  placeholder="请选择省或直辖市"
                  @change="onProvinceChanged"
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
                  v-model="formData.city"
                  placeholder="请选择市"
                  @change="onCityChanged"
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
                  v-model="formData.district"
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
            label="雇员类别"
            prop="executorTypes"
          >
            <el-select
              v-model="formData.executorTypes"
              multiple
              clearable
              placeholder="请选择"
            >
              <el-option
                v-for="item in userTypeSelection"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="雇员资质"
            prop="minExecutorStar"
          >
            <el-select
              v-model="formData.minExecutorStar"
              clearable
              placeholder="请选择"
            >
              <el-option
                v-for="item in userStar"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="描述"
            prop="note"
          >
            <el-input
              type="textarea"
              :rows="4"
              placeholder="请输入任务描述内容"
              v-model="formData.note"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="关键信息"></el-form-item>
          <el-form-item
            label="受访企业名称"
            prop="companyName"
          >
            <el-input v-model="formData.companyName"></el-input>
          </el-form-item>
          <el-form-item
            label="模板"
            prop="templateFileUid"
          >
            <el-select
              v-model="formData.templateFileUid"
              placeholder="请选择任务模板"
              :value="selectedTemplateName"
            >
              <el-option
                v-for="item in templateObjs"
                :key="item.uid"
                :label="item.name"
                :value="item.templateFileUid"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item
            label="地址"
            prop="address"
          >
            <el-input v-model="formData.address"></el-input>
          </el-form-item>
          <el-form-item
            label="企业联系人"
            prop="companyContact"
          >
            <el-input v-model="formData.companyContact"></el-input>
          </el-form-item>
          <el-form-item
            label="联系电话"
            prop="contactPhone"
          >
            <el-input v-model="formData.contactPhone"></el-input>
          </el-form-item>
          <el-form-item
            label="联系邮箱"
            prop="contactEmail"
          >
            <el-input v-model="formData.contactEmail"></el-input>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <el-row
      class="row-align-form"
      style="margin-bottom:30px"
    >
      <el-col :span="24">
        <div
          v-if="isTaskResultReady"
          class="div-download-icon"
        >
          <span style="display:block;">点击下载模板</span>
          <el-button
            icon="el-icon-download"
            circle
            @click="onTemplateDownload"
          ></el-button>
        </div>
        <div
          v-if="isTaskResultReady"
          class="div-download-icon"
        >
          <span style="display:block;">点击下载尽调结果</span>
          <el-button
            icon="el-icon-download"
            circle
            @click="onResultDownload"
          ></el-button>
        </div>
      </el-col>
    </el-row>
    <el-row
      class="row-align-form"
      style="text-align:center"
    >
      <el-col :span=24>
        <el-button
          v-if="isCreate || isEdit"
          type="primary"
          size="small"
          plain
          @click="onSave()"
        >保存</el-button>
        <el-button
          v-if="isCreate || isEdit"
          type="primary"
          size="small"
          @click="onSubmit()"
        >提交</el-button>
        <el-button
          v-if="isCreate || isEdit"
          type="warning"
          size="small"
          @click="onReset()"
        >重置</el-button>
        <el-button
          v-if="isEdit || isDetail"
          type="primary"
          size="small"
          @click="onCancelled()"
        >关闭</el-button>
      </el-col>
    </el-row>
  </div>

</template>

<script lang="ts">
import { TaskFormTS } from "./TaskFormTS";
export default class TaskFormVue extends TaskFormTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.div-download-icon {
  display: inline-block;
  margin-left: 10px;
  margin-right: 10px;
}
</style>
