<template>
  <el-container v-loading="!isInitialized">
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
          </el-step>

          <el-step
            title="身份信息"
            :status="idInfoStatus"
          >
          </el-step>

          <el-step
            title="资质上传"
            :status="qualificationStatus"
          >
          </el-step>
          <el-step
            title="资质审查"
            :status="checkStatus"
          ></el-step>
          <el-step
            title="注册完成"
            :status="doneStatus"
          ></el-step>
        </el-steps>
      </div>
    </el-aside>

    <el-main>
      <el-alert
        v-if="hasCheckAlert"
        :title="checkAlertTitle"
        type="error"
        center
        show-icon
        :description="checkAlertDesc"
      >
      </el-alert>
      <el-row class="row-title">
        <el-col :span=24>
          <span>{{title()}}</span>
        </el-col>
      </el-row>
      <el-row v-if="isBasicUserRegister()">
        <el-col :span=24>
          <BasicUserRegisterVue
            :roleProp="userRole"
            @success="onBasicUserSuccess"
            @failure="onBasicUserFailure"
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
          <el-row style="margin-bottom:10px">
            <el-col :span=24>
              请参照模板中的资料，上传您或贵公司的资质材料，该材料将作为我们对您或贵公司等级评定的重要依据
            </el-col>
          </el-row>
          <el-row style="margin-bottom:10px">
            <el-col :span=24>
              <el-button
                size="small"
                type="primary"
                @click="onQaulificationTemplateDownload"
              >资质模板下载<i class="el-icon-download el-icon--right"></i></el-button>
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
        </el-col>
      </el-row>
      <el-row v-else-if="isQualificationChecking()">
        <el-col :span=24>
          资质审查中，请耐心等待。。。
        </el-col>
      </el-row>
      <el-row v-else-if="isDone()">
        <el-col :span=24>
          恭喜你，审查通过，{{countdown}} 秒后自动跳转到首页 。。。
        </el-col>
      </el-row>

    </el-main>
  </el-container>

</template>

<script lang="ts">
import { UserRegisterTS } from "./UserRegisterTS";
export default class UserRegisterVue extends UserRegisterTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.el-main {
  padding: 0px;
}
.row-title {
  padding-bottom: 20px;
  font-size: 20px;
}
</style>
