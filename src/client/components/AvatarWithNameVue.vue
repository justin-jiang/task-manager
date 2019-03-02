<template>
  <div>
    <el-row>
      <el-col
        :span="12"
        style="margin-top:8px;"
      >
        <el-row
          v-if="hasQualificationInfo"
          style="text-align:center"
        >
          <el-col :span=24>
            综合分数：{{qualificationScore}}
          </el-col>
        </el-row>
        <el-row
          v-if="hasQualificationInfo"
          style="text-align:center"
        >
          <el-col :span=24>
            <el-rate
              v-model="qualificationStar"
              disabled
              text-color="#ff9900"
            >
            </el-rate>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="4">
        <avatar
          v-if='isLogoUidReady'
          :image="logoUrlProp"
        ></avatar>
        <img
          class="img-item"
          v-else
          src="../assets/logo.png"
        />
      </el-col>
      <el-col
        :span="8"
        style="margin-top:18px;padding-left:8px"
      >
        <span>{{nameProp}}</span>
      </el-col>
    </el-row>

  </div>
</template>

<script lang="ts">
import { AvatarWithNameTS } from "./AvatarWithNameTS";
export default class AvatarWithNameVue extends AvatarWithNameTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.img-item {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  font-size: 24px;
  background-color: rgba(34, 51, 0, 0);
}
</style>
