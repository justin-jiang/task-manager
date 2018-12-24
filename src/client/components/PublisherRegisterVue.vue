<template>
  <div>
    开发中。。。
  </div>
    

</template>

<script lang="ts">
import { PublisherRegisterTS } from './PublisherRegisterTS';
export default class CorpUserRegisterVue extends PublisherRegisterTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
// there is bug for scoped style which will not generate the data-v-XXX attr on el-uploader element
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
