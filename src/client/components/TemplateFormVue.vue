<!--used to create or edit task-->
<template>
  <div>
    <el-row>
      <el-col :span=24>
        <el-form
          :model="formData"
          :ref="formRefName"
          :rules="formRules"
          label-width="100px"
          class="form-main"
        >
          <el-form-item
            label="模板名称"
            prop="name"
          >
            <el-input v-model="formData.name"></el-input>
          </el-form-item>
          <el-form-item
            label="备注"
            prop="note"
          >
            <el-input v-model="formData.note"></el-input>
          </el-form-item>
          <el-form-item label="模板文档">
            <SingleFileUploadVue
              :ref="uploaderRefName"
              :filePostParamProp="uploadParam"
              :fileTypesProp="templateFileTypes"
              :fileSizeMProp="templateFileSizeMLimit"
              :hideSubmitButtonProp="true"
              @success="onTemplateCreateSuccess"
              @change="onTemplateFileChange"
            />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-row
      class="row-align-form"
      style="text-align:center"
    >
      <el-col :span=24>
        <el-button
          type="primary"
          size="small"
          :disabled="!isReadyToSave"
          @click="onSave()"
        >保存</el-button>
        <el-button
          type="warning"
          size="small"
          plain
          @click="onReset()"
        >重置</el-button>
        <el-button
          type="primary"
          size="small"
          plain
          @click="onCancel()"
        >关闭</el-button>
      </el-col>
    </el-row>
  </div>

</template>

<script lang="ts">
import { TemplateFormTS } from "./TemplateFormTS";
export default class TemplateFormVue extends TemplateFormTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
