<template>
  <el-table
    style="width: 100%"
    stripe
    :cell-style="getDeadlineColStyle"
    :ref="taskTableRefName"
    :data="filteredTaskObjs"
    @row-click="onRowClick"
  >
    <el-table-column type="expand">
      <template slot-scope="props">
        <TaskSpecificInTableVue :dataProp="props.row"></TaskSpecificInTableVue>
      </template>
    </el-table-column>

    <el-table-column
      sortable
      :sortMethod="nameSort"
      label="名称"
      prop="name"
      width="280px"
    >
    </el-table-column>
    <el-table-column
      sortable
      label="金额"
      prop="reward"
      width="80px"
    >
    </el-table-column>

    <el-table-column
      sortable
      :sortMethod="locationSort"
      label="所在区域"
      width="140px"
    >
      <template slot-scope="scope">
        <span>{{getTaskArea(scope.row)}}</span>
      </template>
    </el-table-column>

    <el-table-column
      sortable
      :sortMethod="deadlineSort"
      label="截止时间"
      width="100px"
    >
      <template slot-scope="scope">
        <span>{{timestampToDate(scope.row.deadline)}}</span>
      </template>
    </el-table-column>

    <el-table-column
      sortable
      :sortMethod="remainingDaysSort"
      :label="labelOfRemainingDays"
      width="100px"
    >
      <template slot-scope="scope">
        <span>{{getRemainingDaysText(scope.row)}}</span>
      </template>
    </el-table-column>

    <el-table-column
      sortable
      :sortMethod="stateSort"
      label="状态"
      width="80px"
    >
      <template slot-scope="scope">
        <span>{{taskStateToText(scope.row.state)}}</span>
      </template>
    </el-table-column>

    <el-table-column
      sortable
      :sortMethod="createTimeSort"
      label="创建时间"
      width="100px"
    >
      <template slot-scope="scope">
        <span>{{timestampToDate(scope.row.createTime)}}</span>
      </template>
    </el-table-column>

    <el-table-column align="right">
      <template
        slot="header"
        slot-scope="scope"
      >
        <el-input
          v-if="isSearchReady(scope.row)"
          v-model="search"
          size="mini"
          placeholder="名称搜索"
        />
      </template>
      <template slot-scope="scope">
        <slot
          name="buttons"
          :row="scope.row"
        >
        </slot>
        <el-button
          type="primary"
          size="mini"
          plain
          v-if="!isNotSubmitted(scope.$index, scope.row)"
          @click.stop="onTaskDetailCheck(scope.$index, scope.row)"
        >任务详情</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
import { TaskTableTS } from './TaskTableTS';
export default class TaskTableVue extends TaskTableTS {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less" >
</style>
