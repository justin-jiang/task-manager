<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-table
          :data="userObjs.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
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
            prop="state"
          >
          </el-table-column>
          <el-table-column align="right">
            <template
              slot="header"
              slot-scope="scope"
            >
              <el-input
                v-model="search"
                size="mini"
                placeholder="输入关键字搜索"
              />
            </template>
            <template slot-scope="scope">
              <el-button
                size="mini"
                @click="onTemplateSelect(scope.$index, scope.row)"
              >编辑</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="onTemplateDelete(scope.$index, scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { UserManagementTS } from './UserManagementTS';
export default class UserManagementVue extends UserManagementTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" >
</style>
