<template>
  <el-container style="min-height: 600px;">
    <el-aside width="200px">
      <div style="height: 300px;">
        <el-steps
          direction="vertical"
          :active="currentStep"
        >
          <el-step title="基本信息"></el-step>
          <el-step title="资质认证"></el-step>
          <el-step title="资质审查"></el-step>
          <el-step title="注册完成"></el-step>
        </el-steps>
      </div>
    </el-aside>

    <el-main>
      <el-row v-if="isBasicUserRegister()">
        <BasicUserRegisterVue
          :roleProp="userRole"
          @success="onBasicUserSuccess"
        />
      </el-row>
      <el-row v-else-if="isQualificationUpload()">
        <SingleFileUploadVue
          :filePostParamProp="filePostParam"
          :fileTypesProp="qualificationFileTypes"
          :fileSizeMProp="qualificationFileSizeMLimit"
          @success="onQualificationSuccess"
        />
      </el-row>
      <el-row v-else-if="isQualificationChecking()">
        资质审查中，请耐心等待。。。
      </el-row>
      <el-row v-else-if="isDone()">
        恭喜你，审查通过，可以接受任务了。。。
      </el-row>

    </el-main>
  </el-container>

</template>

<script lang="ts">
import { ExecutorRegisterTS } from './ExecutorRegisterTS';
export default class ExecutorRegisterVue extends ExecutorRegisterTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.el-main {
  padding: 0px;
}
</style>
