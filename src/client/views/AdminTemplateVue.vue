<template>
  <div>
    <el-row style="margin-bottom:10px">
      <el-col :span=24>
        资质审核模板，新注册用户会依照此模板中的内容上传资质材料
      </el-col>
      
    </el-row>
    <el-row>
      <el-col :span=24>
        <SingleFileUploadVue
          :filePostParamProp="filePostParam"
          :fileTypesProp="qualificationFileTypes"
          :fileSizeMProp="qualificationFileSizeMLimit"
          @success="onQualificationSuccess"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { AdminTemplateTS } from "./AdminTemplateTS";
export default class AdminTemplateVue extends AdminTemplateTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
