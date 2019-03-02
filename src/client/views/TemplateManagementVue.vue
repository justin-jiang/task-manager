<template>
  <el-tabs
    type="card"
    class="tabs-main"
    v-model="activeTabName"
  >
    <el-tab-pane
      label="创建模板"
      :name="templageCreationTabName"
    >
      <el-form
        :model="formCreateDatas"
        :ref="formCreateRefName"
        :rules="formRules"
        label-width="100px"
        class="form-main"
      >
        <el-form-item
          label="模板名称"
          prop="name"
        >
          <el-input v-model="formCreateDatas.name"></el-input>
        </el-form-item>
        <el-form-item
          label="备注"
          prop="note"
        >
          <el-input v-model="formCreateDatas.note"></el-input>
        </el-form-item>
        <el-form-item label="模板文档">
          <SingleFileUploadVue
            :ref="uploaderCreateRefName"
            :filePostParamProp="fileUploadCreateParam"
            :fileTypesProp="templateFileTypes"
            :fileSizeMProp="templateFileSizeMLimit"
            @success="onTemplateCreateSuccess"
          />
        </el-form-item>
      </el-form>
    </el-tab-pane>
    <el-tab-pane :name="templateEditTabName">
      <span slot="label"><i class="el-icon-date"></i> 已有模板</span>
      <el-row>
        <el-col :span="24">
          <el-table
            :data="templateObjs.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
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
                  placeholder="输入关键字搜索"
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
      <el-row style="padding-top:100px">
        <el-col :span="24">
          <el-collapse
            v-model="activeCollapseNames"
            @change="onCollapseChange"
          >
            <el-collapse-item
              title="模板信息编辑"
              :name="editCollapseName"
              :id="editCollapseName"
            >
              <el-row>
                <el-col :span="12">
                  <el-form
                    :model="formEditDatas"
                    :ref="formEditRefName"
                    :rules="formRules"
                    label-width="100px"
                    class="form-main"
                  >
                    <el-form-item
                      label="模板名称"
                      prop="name"
                    >
                      <el-input v-model="formEditDatas.name"></el-input>
                    </el-form-item>
                    <el-form-item
                      label="备注"
                      prop="note"
                    >
                      <el-input v-model="formEditDatas.note"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        :disabled="!isBasicInfoUpdated"
                        @click="onTemplateInfoEditSubmit()"
                      >提交</el-button>
                    </el-form-item>
                  </el-form>
                </el-col>
              </el-row>
            </el-collapse-item>
            <el-collapse-item
              title="提交"
              :name="fileUploadCollapseName"
            >
              <el-row>
                <el-col
                  :span="12"
                  style="margin-left:200px;"
                >
                  <SingleFileUploadVue
                    :ref="uploaderEditRefName"
                    :filePostParamProp="fileUploadEditParam"
                    :fileTypesProp="templateFileTypes"
                    :fileSizeMProp="templateFileSizeMLimit"
                    buttonTextProp="提交"
                    @success="onTemplateFileUpdateSuccess"
                  />
                </el-col>
              </el-row>
            </el-collapse-item>
          </el-collapse>
        </el-col>
      </el-row>
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts">
import { TemplateManagementTS } from "./TemplateManagementTS";
export default class TemplateManagementVue extends TemplateManagementTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
