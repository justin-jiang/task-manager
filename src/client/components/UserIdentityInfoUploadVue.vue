<template>
  <div>
    <el-row>
      <el-col :span="24">
        <!-- 个人信息 -->
        <el-form
          :model="formDatas"
          status-icon
          :rules="formRules"
          :ref="formRefName"
          style="max-width:1000px; min-width:500px;"
          label-width="150px"
          class="form-idUpload"
          :disabled="isSubmitting"
        >
          <el-form-item
            :label="labelOfRealName"
            prop="realName"
          >
            <el-input v-model="formDatas.realName"></el-input>
          </el-form-item>
          <el-form-item
            v-if="!isCorpUser"
            label="性别"
            prop="sex"
          >
            <el-switch
              v-model="formDatas.sex"
              active-text="男"
              inactive-text="女"
              active-color="#13ce66"
              inactive-color="#13ce66"
              :active-value="0"
              :inactive-value="1"
            >
            </el-switch>
          </el-form-item>
          <el-form-item
            :label="labelOfIdNumber"
            prop="idNumber"
          >
            <el-input v-model="formDatas.idNumber"></el-input>
          </el-form-item>

          <el-form-item
            :label="labelOfAddress"
            prop="address"
          >
            <el-input v-model="formDatas.address"></el-input>
          </el-form-item>
          <el-form-item
            :label="labelOfFrontUploader"
            prop="idNumber"
          >
            <SingleImageUploaderVue
              :ref="frontUploaderRefName"
              :filePostParamProp="frontUploadParam"
              :noCropProp="true"
              :imageUidProp="frontIdUid"
              @imageChanged="onFrontIdImageChanged"
              @success="onFrontUploadSuccess"
              @failure="onFrontUploadFailure"
            ></SingleImageUploaderVue>
          </el-form-item>
          <el-form-item
            :label="labelOfBackUploader"
            prop="idNumber"
          >
            <SingleImageUploaderVue
              :ref="backUploaderRefName"
              :filePostParamProp="backUploadParam"
              :noCropProp="true"
              :imageUidProp="backIdUid"
              @imageChanged="onBackIdImageChanged"
              @success="onBackUploadSuccess"
              @failure="onBackUploadFailure"
            ></SingleImageUploaderVue>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :disabled="!isReadyToSubmit()"
              @click="onSubmitForm()"
            >提交</el-button>
            <el-button @click="resetForm()">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>

</template>

<script lang="ts">
import { UserIdentityInfoUploadTS } from "./UserIdentityInfoUploadTS";
export default class UserIdentityInfoUploadVue extends UserIdentityInfoUploadTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
