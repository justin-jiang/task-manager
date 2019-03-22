<template>
  <el-dialog
    width="450px"
    title="资质&保证金审核"
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
            雇员资质信息
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <AvatarWithNameVue
              :nameProp="executorProp.name"
              :logoUrlProp="executorProp.logoUrl"
              :qualificationStarProp="executorProp.qualificationStar"
              :qualificationScoreProp="executorProp.qualificationScore"
            ></AvatarWithNameVue>
          </el-col>
        </el-row>

      </el-carousel-item>

      <el-carousel-item class="carousel-item">
        <el-row class="row-title">
          <el-col :span="24">
            保证金支付成功截图
          </el-col>
        </el-row>
        <el-row class="row-image">
          <el-col :span="24">
            <div class="div-image">
              <img
                class="image-item"
                :src="marginImageUrlProp"
              >
              <span
                class="span-image-mask"
                @click="onPreview(marginImageUrlProp)"
              >
                <i
                  class="el-icon-zoom-in"
                  @click="onPreview(marginImageUrlProp)"
                ></i>
              </span>
            </div>
          </el-col>
        </el-row>
      </el-carousel-item>
    </el-carousel>

    <el-row class="row-dialog">
      <el-col :span="24">
        <el-radio-group v-model="auditParam.state">
          <el-radio
            :label="radioLabelAssigned"
            border
          >通过</el-radio>
          <el-radio
            :label="radioLabelQualificationDenied"
            border
          >资质未通过</el-radio>
          <el-radio
            :label="radioLabelMarginDenied"
            border
          >保证金未通过</el-radio>
        </el-radio-group>
      </el-col>
    </el-row>

    <el-row
      class="row-dialog-last"
      v-if="!isAccepted"
    >
      <el-col :span="24">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="如果拒绝，请输入原因"
          v-model="auditParam.note"
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
          size="mini"
          :disabled="!isReadyToSubmit"
          @click="onSubmit()"
        >提交</el-button>
        <el-button
          type="primary"
          size="mini"
          plain
          @click="onCancel()"
        >取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { TaskApplyCheckDialogTS } from "./TaskApplyCheckDialogTS";
export default class TaskApplyCheckDialogVue extends TaskApplyCheckDialogTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
@carouselHeight: 320px;
@maxImageHeight: @carouselHeight - 30px;
.carousel-dialog {
  height: @carouselHeight;
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
          top: 40%;
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
.row-dialog {
  margin-bottom: 10px;
}
</style>
