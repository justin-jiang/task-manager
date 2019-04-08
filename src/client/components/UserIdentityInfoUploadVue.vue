<template>
  <div>
    <el-row>
      <el-col :span="24">
        <!-- 个人信息 -->
        <el-form
          :model="formData"
          status-icon
          :rules="formRules"
          :ref="formRefName"
          label-width="200px"
          class="form-main"
          :disabled="isSubmitting"
        >
          <el-form-item
            :label="labelOfRealName"
            prop="realName"
          >
            <el-input v-model="formData.realName"></el-input>
          </el-form-item>
          <el-form-item
            v-if="!isCorpUser"
            label="性别"
            prop="sex"
          >
            <el-switch
              v-model="formData.sex"
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
            prop="identityNumber"
          >
            <el-input v-model="formData.identityNumber"></el-input>
          </el-form-item>
          <el-form-item
            v-if="isCorpUser"
            label="负责人姓名"
            prop="principalName"
          >
            <el-input v-model="formData.principalName"></el-input>
          </el-form-item>
          <el-form-item
            v-if="isCorpUser"
            label="负责人身份证号码"
            prop="principalName"
          >
            <el-input v-model="formData.principalIDNumber"></el-input>
          </el-form-item>
          <el-form-item
            :label="labelOfArea"
            prop="area"
          >
            <el-col :span="8">
              <el-select
                v-model="formData.province"
                filterable
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
          </el-form-item>
          <el-form-item
            :label="labelOfAddress"
            prop="address"
          >
            <el-input v-model="formData.address"></el-input>
          </el-form-item>

          <el-form-item
            label="开户银行名称"
            prop="bankName"
          >
            <el-input v-model="formData.bankName"></el-input>
          </el-form-item>

          <el-form-item
            label="银行账户名称"
            prop="bankAccountName"
          >
            <el-input v-model="formData.bankAccountName"></el-input>
          </el-form-item>

          <el-form-item
            label="银行账户"
            prop="bankAccountNumber"
          >
            <el-input v-model="formData.bankAccountNumber"></el-input>
          </el-form-item>

          <el-form-item
            label="开户行联行号"
            prop="linkBankAccountNumber"
          >
            <el-input v-model="formData.linkBankAccountNumber"></el-input>
          </el-form-item>

          <el-form-item
            :ref="frontUploaderItemRefName"
            :label="labelOfFrontIdUploader"
            :prop="formData.frontIdUploader"
          >
            <SingleImageUploaderVue
              :ref="frontUploaderRefName"
              :filePostParamProp="frontUploadParam"
              :noCropProp="true"
              :imageUidProp="frontIdUid"
              @change="onFrontIdImageChanged"
              @reset="onFrontIdImageReset"
              @success="onFrontIdUploadSuccess"
              @failure="onFrontIdUploadFailure"
            ></SingleImageUploaderVue>
          </el-form-item>

          <el-form-item
            :ref="backUploaderItemRefName"
            :label="labelOfBackIdUploader"
            :prop="formData.backIdUploader"
          >
            <SingleImageUploaderVue
              :ref="backUploaderRefName"
              :filePostParamProp="backUploadParam"
              :noCropProp="true"
              :imageUidProp="backIdUid"
              @change="onBackIdImageChanged"
              @reset="onBackIdImageReset"
              @success="onBackIdUploadSuccess"
              @failure="onBackIdUploadFailure"
            ></SingleImageUploaderVue>
          </el-form-item>
          <el-form-item
            :ref="licenseUploaderItemRefName"
            label="营业执照副本照"
            :prop="formData.licenseUploader"
            v-if="isCorpUser"
          >
            <SingleImageUploaderVue
              :ref="licenseUploaderRefName"
              :filePostParamProp="licenseUploadParam"
              :noCropProp="true"
              :imageUidProp="licenseUid"
              @change="onLicenseImageChanged"
              @reset="onLicenseImageReset"
              @success="onLicenseUploadSuccess"
              @failure="onLicenseUploadFailure"
            ></SingleImageUploaderVue>
          </el-form-item>
          <el-form-item
            :ref="licenseWithPersonUploaderItemRefName"
            label="负责人手持执照副本照"
            :prop="formData.licenseWithPersionUploader"
            v-if="isCorpUser"
          >
            <SingleImageUploaderVue
              :ref="licenseWithPersonUploaderRefName"
              :filePostParamProp="licenseWithPersonUploadParam"
              :noCropProp="true"
              :imageUidProp="licenseWithPersonUid"
              @change="onLicenseWithPersonImageChanged"
              @reset="onLicenseWithPersonImageReset"
              @success="onLicenseWithPersonUploadSuccess"
              @failure="onLicenseWithPersonUploadFailure"
            ></SingleImageUploaderVue>
          </el-form-item>
          <el-form-item
            :ref="authLetterUploaderItemRefName"
            label="法人授权证书照"
            v-if="isCorpUser"
          >
            <SingleImageUploaderVue
              :ref="authLetterUploaderRefName"
              :filePostParamProp="authLetterUploadParam"
              :noCropProp="true"
              :imageUidProp="authLetterUid"
              @change="onAuthLetterImageChanged"
              @reset="onAuthLetterImageReset"
              @success="onAuthLetterUploadSuccess"
              @failure="onAuthLetterUploadFailure"
            ></SingleImageUploaderVue>
          </el-form-item>

          <el-form-item
            :ref="logoUploaderItemRefName"
            label="头像"
          >
            <SingleImageUploaderVue
              :ref="logoUploaderRefName"
              :filePostParamProp="logoUploadParam"
              :imageUidProp="logoUid"
              @change="onLogoImageChanged"
              @reset="onLogoImageReset"
              @success="onLogoUploadSuccess"
              @failure="onLogoUploadFailure"
            ></SingleImageUploaderVue>
          </el-form-item>
          <el-form-item>
            <el-button
              @click="resetForm()"
              type="warning"
              plain
            >重置</el-button>
            <el-button
              type="primary"
              :disabled="!isReadyToSubmit()"
              :loading="isSubmitting"
              @click="onSubmitForm()"
            >提交</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>

</template>

<script lang="ts">
import { UserIdentityInfoUploadTS } from './UserIdentityInfoUploadTS';
export default class UserIdentityInfoUploadVue extends UserIdentityInfoUploadTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
