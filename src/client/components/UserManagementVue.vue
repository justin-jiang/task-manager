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
          <el-table-column label="状态">
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{ getUserState(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            align="right"
            min-width="500"
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
                v-if="isLogoToBeChecked(scope.row)"
                size="mini"
                @click="onLogoCheck(scope.$index, scope.row)"
              >头像审核</el-button>
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
    <el-dialog
      width="30%"
      title="头像审核"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="logoCheckDialogVisible"
    >
      <el-row>
        <el-col :span="24">
          <img
            style="width:100%;height:100%"
            :src="selectedUserLogoUrl"
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-button
            size="mini"
            type="primary"
            @click="onLogoCheckAccepted()"
          >通过</el-button>
        </el-col>
        <el-col :span="8">
          <el-button
            size="mini"
            type="primary"
            @click="onLogoCheckDenied()"
          >拒绝</el-button>
        </el-col>
        <el-col :span="8">
          <el-button
            size="mini"
            type="primary"
            @click="onLogoCheckCanceled()"
          >取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <el-dialog
      width="30%"
      title="资质文件审核"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="qualificationCheckDialogVisible"
    >
      <el-row style="margin-bottom:20px;">
        <el-col :span="24">
          <span style="display:block;">点击下载</span>
          <el-button
            icon="el-icon-download"
            circle
            @click="onQualificationDownload"
          ></el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-button
            size="mini"
            type="primary"
            @click="onQualificationCheckAccepted()"
          >通过</el-button>
        </el-col>
        <el-col :span="8">
          <el-button
            size="mini"
            type="primary"
            @click="onQualificationCheckDenied()"
          >拒绝</el-button>
        </el-col>
        <el-col :span="8">
          <el-button
            size="mini"
            type="primary"
            @click="onQualificationCheckCanceled()"
          >取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { UserManagementTS } from "./UserManagementTS";
export default class UserManagementVue extends UserManagementTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
</style>
