<template>
  <div>
    <el-tabs
      type="card"
      class="tabs-main"
      v-model="activeTabName"
      v-loading="!isInitialized"
    >
      <el-tab-pane
        label="雇员管理"
        :name="executorTabName"
      >
        <el-row>
          <el-col :span="24">
            <el-table
              :data="executorObjs"
              stripe
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
              >
              </el-table-column>
              <el-table-column
                label="名称"
                prop="realName"
                width="300px"
              >
              </el-table-column>

              <el-table-column
                label="角色"
                width="110px"
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
                    @click="onIdCheck(scope.$index, scope.row)"
                  >主体审核</el-button>
                  <el-button
                    v-if="isQualificationToBeChecked(scope.row)"
                    type="primary"
                    size="mini"
                    @click="onQualificationCheck(scope.$index, scope.row)"
                  >资质审核</el-button>
                  <el-button
                    type="warning"
                    size="mini"
                    @click="onUserPasswordReset(scope.$index, scope.row)"
                  >重置口令</el-button>
                  <el-button
                    type="warning"
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
      </el-tab-pane>
      <el-tab-pane
        label="雇主管理"
        :name="publisherTabName"
      >
        <el-row>
          <el-col :span="24">
            <el-table
              :data="publisherObjs"
              stripe
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
              >
              </el-table-column>
              <el-table-column
                label="名称"
                prop="realName"
                width="300px"
              >
              </el-table-column>

              <el-table-column
                label="角色"
                width="110px"
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
                    @click="onIdCheck(scope.$index, scope.row)"
                  >主体审核</el-button>
                  <el-button
                    v-if="isQualificationToBeChecked(scope.row)"
                    type="primary"
                    size="mini"
                    @click="onQualificationCheck(scope.$index, scope.row)"
                  >资质审核</el-button>
                  <el-button
                    type="warning"
                    size="mini"
                    @click="onUserPasswordReset(scope.$index, scope.row)"
                  >重置口令</el-button>
                  <el-button
                    type="warning"
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
      </el-tab-pane>
    </el-tabs>

    <IdentityCheckDialogVue
      :userUidProp="selectedUserUid"
      :visibleProp="idCheckDialogVisible"
      @submitted="onIdCheckSubmit"
      @cancelled="onIdCheckCancelled"
    >
    </IdentityCheckDialogVue>

    <FileCheckDialogVue
      titleProp="资质认证审核"
      :scenarioProp="1"
      :targetUserProp="selectedUser.qualificationUid"
      :visibleProp="qualificationCheckDialogVisible"
      @submitted="onQualificationCheckSubmit"
      @cancelled="onQualificationCheckCancelled"
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
<style scoped lang="less" >
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
