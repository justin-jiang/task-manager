<template>
  <el-container style="min-height: 600px;">
    <el-aside width="200px">
      <div style="height: 300px;">
        <el-steps
          direction="vertical"
          :active="currentStep"
          align-center
          finish-status="success"
        >
          <el-step
            title="基本信息"
            :status="basicInfoStatus"
          >
            <el-popover
              placement="right"
              title="原因"
              width="200"
              trigger="hover"
              :content="basicInfoDetails"
              slot="description"
            >
              <span slot="reference">{{basicInfoTitle}}</span>
            </el-popover>
          </el-step>

          <el-step
            title="身份信息"
            :status="idInfoStatus"
          >
            <el-popover
              placement="right"
              title="原因"
              width="200"
              trigger="hover"
              :content="idInfoDetails"
              slot="description"
            >
              <span slot="reference">{{idInfoTitle}}</span>
            </el-popover>
          </el-step>

          <el-step
            title="资质上传"
            :status="qualificationStatus"
          >
            <el-popover
              placement="right"
              title="原因"
              width="200"
              trigger="hover"
              :content="qualificationDetails"
              slot="description"
            >
              <span slot="reference">{{qualificationTitle}}</span>
            </el-popover>
          </el-step>
          <el-step
            title="资质审查"
            :status="checkStatus"
            :description="checkDesc"
          ></el-step>
          <el-step
            title="注册完成"
            :status="doneStatus"
            :description="doneDesc"
          ></el-step>
        </el-steps>
      </div>
    </el-aside>

    <el-main>
      <el-row style="padding-bottom:50px;font-size:20px;text-align:left;">
        <el-col :span=24>
          <span>{{title()}}</span>
        </el-col>
      </el-row>
      <el-row v-if="isBasicUserRegister()">
        <el-col :span=24>
          <BasicUserRegisterVue
            :roleProp="userRole"
            @success="onBasicUserSuccess"
          />
        </el-col>
      </el-row>
      <el-row v-else-if="isIdUpload()">
        <el-col :span=24>
          <UserIdentityInfoUploadVue @success="onIdUploadSuccess" />
        </el-col>
      </el-row>
      <el-row v-else-if="isQualificationUpload()">
        <el-col :span=24>
          <SingleFileUploadVue
            :filePostParamProp="filePostParam"
            :fileTypesProp="qualificationFileTypes"
            :fileSizeMProp="qualificationFileSizeMLimit"
            @success="onQualificationSuccess"
          />
        </el-col>
      </el-row>
      <el-row v-else-if="isQualificationChecking()">
        <el-col :span=24>
          资质审查中，请耐心等待。。。
        </el-col>
      </el-row>
      <el-row v-else-if="isDone()">
        <el-col :span=24>
          恭喜你，审查通过，可以接受任务了。。。
        </el-col>
      </el-row>

    </el-main>
  </el-container>

</template>

<script lang="ts">
import { ExecutorRegisterTS } from "./ExecutorRegisterTS";
export default class ExecutorRegisterVue extends ExecutorRegisterTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.el-main {
  padding: 0px;
}
</style>
