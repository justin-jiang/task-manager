<template>
  <el-dialog
    width="600px"
    title="主体认证审核"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="visibleProp"
  >
    <el-carousel
      arrow="always"
      indicator-position="none"
      class="carousel-dialog"
      :autoplay="false"
      :loop="false"
    >
      <el-carousel-item class="carousel-item">
        <el-row class="row-title">
          <el-col :span="24">
            基本信息
          </el-col>
        </el-row>
        <el-row class="row-basic-info">
          <el-col
            class="col-basic-info"
            style="width:120px"
          >
            单位或个人名称：
          </el-col>
          <el-col
            class="col-basic-info"
            style="width:300px"
          >
            {{targetUser.realName}}
          </el-col>
          <el-col
            style="width:70px"
            class="col-basic-info"
          >
            用户类别：
          </el-col>
          <el-col
            style="width:30px"
            class="col-basic-info-value"
          >
            {{userType}}
          </el-col>
        </el-row>
        <el-row
          class="row-basic-info"
          v-if="isCorpUser"
        >
          <el-col style="width:20%">
            负责人名称：
          </el-col>
          <el-col
            style="width:80%"
            class="col-basic-info-value"
          >
            {{targetUser.principalName}}
          </el-col>
        </el-row>
        <el-row class="row-basic-info">
          <el-col style="width:20%">
            {{titleOfId}}
          </el-col>
          <el-col
            style="width:80%"
            class="col-basic-info-value"
          >
            {{targetUser.identityNumber}}
          </el-col>
        </el-row>
        <el-row class="row-basic-info">
          <el-col style="width:20%">
            联系电话：
          </el-col>
          <el-col
            style="width:30%"
            class="col-basic-info-value"
          >
            {{targetUser.telephone}}
          </el-col>
          <el-col style="width:20%">
            电子邮箱：
          </el-col>
          <el-col
            style="width:30%"
            class="col-basic-info-value"
          >
            {{targetUser.email}}
          </el-col>
        </el-row>
        <el-row class="row-basic-info">
          <el-col style="width:20%">
            区域：
          </el-col>
          <el-col
            style="width:80%"
            class="col-basic-info-value"
          >
            {{area}}
          </el-col>
        </el-row>
        <el-row class="row-basic-info">
          <el-col style="width:20%">
            详细地址：
          </el-col>
          <el-col
            style="width:80%"
            class="col-basic-info-value"
          >
            {{targetUser.address}}
          </el-col>
        </el-row>
      </el-carousel-item>

      <el-carousel-item
        v-if="islogoIdReady"
        class="carousel-item"
      >
        <el-row class="row-title">
          <el-col :span="24">
            头像
          </el-col>
        </el-row>
        <el-row class="row-image">
          <el-col :span="24">
            <div class="div-image">
              <img
                class="image-item"
                :src="logoUrl"
              >
              <span class="span-image-mask">
                <i
                  class="el-icon-zoom-in"
                  @click="onPreview(logoUrl)"
                ></i>
              </span>
            </div>
          </el-col>
        </el-row>
      </el-carousel-item>

      <el-carousel-item class="carousel-item">
        <el-row class="row-title">
          <el-col :span="24">
            {{titleOfFrontImage}}
          </el-col>
        </el-row>
        <el-row class="row-image">
          <el-col :span="24">
            <div class="div-image">
              <img
                class="image-item"
                :src="frontImageUrl"
              >
              <span class="span-image-mask">
                <i
                  class="el-icon-zoom-in"
                  @click="onPreview(frontImageUrl)"
                ></i>
              </span>
            </div>
          </el-col>
        </el-row>
      </el-carousel-item>

      <el-carousel-item class="carousel-item">
        <div>
          <el-row class="row-title">
            <el-col :span="24">
              {{titleOfBackImage}}
            </el-col>
          </el-row>
          <el-row class="row-image">
            <el-col
              :span="24"
              class="col-image"
            >
              <div class="div-image">
                <img
                  class="image-item"
                  :src="backImageUrl"
                >
                <span class="span-image-mask">
                  <i
                    class="el-icon-zoom-in"
                    @click="onPreview(backImageUrl)"
                  ></i>
                </span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-carousel-item>

      <el-carousel-item
        v-if="isCorpUser"
        class="carousel-item"
      >
        <div>
          <el-row class="row-title">
            <el-col :span="24">
              营业执照副本
            </el-col>
          </el-row>
          <el-row class="row-image">
            <el-col
              :span="24"
              class="col-image"
            >
              <div class="div-image">
                <img
                  class="image-item"
                  :src="licenseImageUrl"
                >
                <span class="span-image-mask">
                  <i
                    class="el-icon-zoom-in"
                    @click="onPreview(licenseImageUrl)"
                  ></i>
                </span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-carousel-item>

      <el-carousel-item
        v-if="isCorpUser"
        class="carousel-item"
      >
        <div>
          <el-row class="row-title">
            <el-col :span="24">
              负责人手持营业执照
            </el-col>
          </el-row>
          <el-row class="row-image">
            <el-col
              :span="24"
              class="col-image"
            >
              <div class="div-image">
                <img
                  class="image-item"
                  :src="licenseWithPersonImageUrl"
                >
                <span class="span-image-mask">
                  <i
                    class="el-icon-zoom-in"
                    @click="onPreview(licenseWithPersonImageUrl)"
                  ></i>
                </span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-carousel-item>

      <el-carousel-item
        v-if="isAuthLetterIdReady"
        class="carousel-item"
      >
        <div>
          <el-row class="row-title">
            <el-col :span="24">
              法人授权书
            </el-col>
          </el-row>
          <el-row class="row-image">
            <el-col
              :span="24"
              class="col-image"
            >
              <div class="div-image">
                <img
                  class="image-item"
                  :src="authLetterUrl"
                >
                <span class="span-image-mask">
                  <i
                    class="el-icon-zoom-in"
                    @click="onPreview(authLetterUrl)"
                  ></i>
                </span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-carousel-item>
    </el-carousel>

    <el-row class="row-dialog">
      <el-col :span="24">
        <el-switch
          v-model="idCheckParam.idState"
          active-text="通过"
          inactive-text="拒绝"
          active-color="#13ce66"
          inactive-color="#13ce66"
          :active-value="idSwitchActiveValue"
          :inactive-value="idSwitchInactiveValue"
        >
        </el-switch>
      </el-col>
    </el-row>

    <el-row
      class="row-dialog"
      v-if="!isAccepted"
    >
      <el-col :span="24">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="如果拒绝，请输入原因"
          v-model="idCheckParam.idCheckNote"
        >
        </el-input>
      </el-col>
    </el-row>
    <!-- footer -->
    <el-row
      slot="footer"
      class="dialog-footer"
    >
      <el-col :span="24">
        <el-button
          type="primary"
          :disabled="!isReadyToSubmit"
          @click="onCheckSubmit()"
        >提交</el-button>
        <el-button @click="onCheckCancelled()">取消</el-button>
      </el-col>
    </el-row>
    <el-dialog
      :visible.sync="previewDialogVisible"
      append-to-body
    >
      <img
        width="100%"
        :src="previewedImageUrl"
        alt=""
      >
    </el-dialog>
  </el-dialog>
</template>

<script lang="ts">
import { IdentityCheckDialogTS } from "./IdentityCheckDialogTS";
export default class IdentityCheckDialogVue extends IdentityCheckDialogTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
@carouselHeight: 320px;
@maxImageHeight: @carouselHeight - 30px;
.carousel-dialog {
  height: @carouselHeight;
  margin-bottom: 30px;
  .row-image {
    height: @maxImageHeight + 5px;
    overflow-y: auto;
    margin-bottom: 10px;
    .div-image {
      position: relative;
      margin: 0 auto;
      .image-item {
        max-height: @maxImageHeight;
      }
      .span-image-mask {
        position: absolute;
        opacity: 0;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        text-align: center;
        font-size: 40px;
        &:hover {
          opacity: 50;
        }
        .el-icon-zoom-in {
          position: absolute;
          top: 50%;
          cursor: pointer;
          opacity: 10;
          color: antiquewhite;
        }
      }
    }
  }
  .carousel-item {
    .row-title {
      font-size: 16px;
      border-bottom: 1px solid cadetblue;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .row-basic-info {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid cadetblue;
    }
    .row-basic-info:nth-child(odd) {
      background: #f0f9eb;
    }
  }
}
.dialog-footer {
  text-align: center;
}

.col-basic-info {
  text-align: left;
  border-radius: 4px;
}
</style>
