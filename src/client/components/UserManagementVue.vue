<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-table
          :data="getUserObjs().filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
          style="width: 100%"
        >
          <el-table-column
            label="名称"
            prop="name"
          >
          </el-table-column>
          <el-table-column
            label="昵称"
            prop="nickName"
          >
          </el-table-column>
          <el-table-column
            label="状态"
            width="220"
          >
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{ getUserState(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            align="right"
            width="500"
          >
            <template
              slot="header"
              slot-scope="scope"
              v-if="isSearchReady(scope.row)"
            >
              <el-input
                v-model="search"
                size="mini"
                placeholder="输入关键字搜索"
                style="width:500px;"
              />
            </template>
            <template slot-scope="scope">
              <el-button
                v-if="isIdToBeChecked(scope.row)"
                size="mini"
                @click="onIdCheck(scope.$index, scope.row)"
              >身份审核</el-button>
              <el-button
                v-if="isQualificationToBeChecked(scope.row)"
                size="mini"
                @click="onQualificationCheck(scope.$index, scope.row)"
              >资质下载审核</el-button>
              <el-button
                size="mini"
                @click="onUserDisableOrEnable(scope.$index, scope.row)"
              >{{btnTextForEnableOrDisable(scope.row)}}</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="onUserDelete(scope.$index, scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <IdentityCheckDialogVue
      :userUidProp="selectedUserUid"
      :visibleProp="idCheckDialogVisible"
      @submit="onIdCheckSubmit"
      @canceled="onIdCheckCanceled"
    >
    </IdentityCheckDialogVue>

    <FileCheckDialogVue
      titleProp="资质文件审核"
      :visibleProp="qualificationCheckDialogVisible"
      @accepted="onQualificationCheckAccepted"
      @denied="onQualificationCheckDenied"
      @canceled="onQualificationCheckCanceled"
      @download="onQualificationDownload"
    >
    </FileCheckDialogVue>
  </div>
</template>

<script lang="ts">
import { UserManagementTS } from "./UserManagementTS";
export default class UserManagementVue extends UserManagementTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
</style>
