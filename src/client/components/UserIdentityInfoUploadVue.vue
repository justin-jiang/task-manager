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
          label-width="200px"
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
            :label="labelOfArea"
            prop="area"
          >
            <el-col :span="8">
              <el-select
                v-model="formDatas.province"
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
                v-model="formDatas.city"
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
                v-model="formDatas.district"
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
          </el-form-item>
          <el-form-item
            :label="labelOfAddress"
            prop="address"
          >
            <el-input v-model="formDatas.address"></el-input>
          </el-form-item>
          <el-form-item
            :label="labelOfFrontIdUploader"
            prop=""
          >
            <SingleImageUploaderVue
              :ref="frontUploaderRefName"
              :filePostParamProp="frontUploadParam"
              :noCropProp="true"
              :imageUidProp="frontIdUid"
              @imageChanged="onFrontIdImageChanged"
              @success="onFrontIdUploadSuccess"
              @failure="onFrontIdUploadFailure"
            ></SingleImageUploaderVue>
          </el-form-item>
          <el-form-item
            :label="labelOfBackIdUploader"
            prop="backIdUploader"
          >
            <SingleImageUploaderVue
              :ref="backUploaderRefName"
              :filePostParamProp="backUploadParam"
              :noCropProp="true"
              :imageUidProp="backIdUid"
              @imageChanged="onBackIdImageChanged"
              @success="onBackIdUploadSuccess"
              @failure="onBackIdUploadFailure"
            ></SingleImageUploaderVue>
          </el-form-item>
          <el-form-item
            label="营业执照副本照"
            prop=""
            v-if="isCorpUser"
          >
            <SingleImageUploaderVue
              :ref="licenseUploaderRefName"
              :filePostParamProp="licenseUploadParam"
              :noCropProp="true"
              :imageUidProp="licenseUid"
              @imageChanged="onLicenseImageChanged"
              @success="onLicenseUploadSuccess"
              @failure="onLicenseUploadFailure"
            ></SingleImageUploaderVue>
          </el-form-item>
          <el-form-item
            label="负责人手持执照副本照"
            prop=""
            v-if="isCorpUser"
          >
            <SingleImageUploaderVue
              :ref="licenseWithPersonUploaderRefName"
              :filePostParamProp="licenseWithPersonUploadParam"
              :noCropProp="true"
              :imageUidProp="licenseWithPersonUid"
              @imageChanged="onLicenseWithPersonImageChanged"
              @success="onLicenseWithPersonUploadSuccess"
              @failure="onLicenseWithPersonUploadFailure"
            ></SingleImageUploaderVue>
          </el-form-item>
          <el-form-item
            label="法人授权证书照"
            prop=""
            v-if="isCorpUser"
          >
            <SingleImageUploaderVue
              :ref="authLetterUploaderRefName"
              :filePostParamProp="authLetterUploadParam"
              :noCropProp="true"
              :imageUidProp="authLetterUid"
              @imageChanged="onAuthLetterImageChanged"
              @success="onAuthLetterUploadSuccess"
              @failure="onAuthLetterUploadFailure"
            ></SingleImageUploaderVue>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :disabled="!isReadyToSubmit()"
              :loading="isSubmitting"
              @click="onSubmitForm()"
            >提交</el-button>
            <el-button
              @click="resetForm()"
              type="warning"
            >重置</el-button>
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
