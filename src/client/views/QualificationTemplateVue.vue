<template>
  <div>
    <el-row style="margin-bottom:10px">
      <el-alert
        type="info"
        center
        show-icon
        :closable="false"
      >
        <span
          slot="title"
          style="font-size:15px;"
        ><b>资质审核模板，新注册用户会依照此模板中的内容上传资质材料</b></span>
      </el-alert>
    </el-row>
    
    <el-row>
      <el-col :span=24>
        <SingleFileUploadVue
          :filePostParamProp="filePostParam"
          :fileTypesProp="qualificationFileTypes"
          :fileSizeMProp="qualificationFileSizeMLimit"
          @success="onSuccess"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { QualificationTemplateTS } from "./QualificationTemplateTS";
export default class QualificationTemplateVue extends QualificationTemplateTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
