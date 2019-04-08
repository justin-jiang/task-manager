<template>
  <div>
    <!-- Radio Button Group for applied Task table -->
    <el-row>
      <el-col :span="24">
        <el-radio-group
          v-model="filterRadio"
          size="small"
        >
          <div class="div-radio-button">
            <el-radio-button :label="executorRadioLab">雇员管理</el-radio-button>
          </div>

          <div class="div-radio-button">
            <el-radio-button :label="publisherRadioLab">雇主管理</el-radio-button>
          </div>
        </el-radio-group>
      </el-col>
    </el-row>
    <!-- Users Table -->
    <el-row>
      <el-col :span="24">
        <el-table
          :ref="userTableRefName"
          :data="filterUserObjs"
          stripe
          @row-click="onRowClick"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <UserDetailInTableVue :dataProp="props.row"></UserDetailInTableVue>
            </template>
          </el-table-column>
          <el-table-column
            label="账号"
            prop="name"
            width="150px"
            sortable
          >
          </el-table-column>
          <el-table-column
            label="名称"
            prop="realName"
            width="300px"
            sortable
            :sortMethod="realNameSort"
          >
          </el-table-column>

          <el-table-column
            label="角色"
            width="110px"
            prop="type"
            :filters="typeFilter"
            :filter-method="typeFilterHandler"
          >
            <template slot-scope="scope">
              <span class="span-in-col">{{ getUserRole(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            width="100px"
          >
            <template slot-scope="scope">
              <span class="span-in-col">{{ getUserState(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            align="right"
            class="col-buttons"
          >
            <template
              slot="header"
              slot-scope="scope"
              v-if="isSearchReady(scope.row)"
            >
              <el-input
                v-model="executorSearch"
                size="mini"
                placeholder="账号搜索"
                class="input-search"
              />
            </template>
            <template slot-scope="scope">
              <el-button
                v-if="isIdToBeChecked(scope.row)"
                type="primary"
                size="mini"
                plain
                @click.stop="onIdCheck(scope.$index, scope.row)"
              >主体审核</el-button>
              <el-button
                v-if="isQualificationToBeChecked(scope.row)"
                type="primary"
                size="mini"
                plain
                @click.stop="onQualificationCheck(scope.$index, scope.row)"
              >资质审核</el-button>
              <el-button
                type="warning"
                size="mini"
                plain
                @click.stop="onUserPasswordReset(scope.$index, scope.row)"
              >重置口令</el-button>

              <el-button
                v-if="isDisabled(scope.$index, scope.row)"
                type="success"
                size="mini"
                plain
                @click.stop="onUserDisableOrEnable(scope.$index, scope.row)"
              >启用</el-button>
              <el-button
                v-else
                type="warning"
                size="mini"
                plain
                @click.stop="onUserDisableOrEnable(scope.$index, scope.row)"
              >禁用</el-button>

              <el-button
                size="mini"
                type="danger"
                @click.stop="onUserDelete(scope.$index, scope.row)"
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
      @cancel="onIdCheckCancel"
    >
    </IdentityCheckDialogVue>

    <FileCheckDialogVue
      titleProp="资质认证审核"
      :scenarioProp="1"
      :targetUserProp="selectedUser.qualificationUid"
      :visibleProp="qualificationCheckDialogVisible"
      @submit="onQualificationCheckSubmit"
      @cancel="onQualificationCheckCancel"
      @download="onQualificationDownload"
    >
    </FileCheckDialogVue>
  </div>
</template>

<script lang="ts">
import { UserManagementTS } from './UserManagementTS';
export default class UserManagementVue extends UserManagementTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
.div-radio-button {
  display: inline-block;
  margin-right: 5px;
}
.el-table {
  .col-name {
    width: 120px;
  }
  .col-buttons {
    width: 500px;
  }
  .input-search {
    width: 500px;
  }
}
</style>
