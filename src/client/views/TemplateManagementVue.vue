<template>
  <div>
    <el-row>
      <el-col :span="4">
        <el-button
          type="success"
          icon="el-icon-plus"
          @click="onCreate()"
        >创建新模板</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-table
          :data="templateObjs"
          style="width: 100%"
        >
          <el-table-column
            label="名称"
            prop="name"
          >
          </el-table-column>
          <el-table-column
            label="备注"
            prop="note"
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
                placeholder="名称搜索"
                v-if="isSearchReady(scope.row)"
              />
            </template>
            <template slot-scope="scope">
              <el-button
                type="primary"
                plain
                size="mini"
                @click="onTemplateSelect(scope.$index, scope.row)"
              >编辑</el-button>
              <el-button
                type="primary"
                size="mini"
                plain
                @click="onTemplateDownload(scope.$index, scope.row)"
              >下载</el-button>
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

    <!-- dialog to create or edit task -->
    <el-dialog
      width="50%"
      :title="templateDialogTitle"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="templateDialogVisible"
    >
      <el-row>
        <el-col :span="24">
          <TemplateFormVue
            :templateViewProp="selectedTemplate"
            @cancel="onTemplateFormCancel"
            @success="onTemplateFormSuccess"
          ></TemplateFormVue>
        </el-col>
      </el-row>
    </el-dialog>

  </div>
</template>

<script lang="ts">
import { TemplateManagementTS } from "./TemplateManagementTS";
export default class TemplateManagementVue extends TemplateManagementTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
