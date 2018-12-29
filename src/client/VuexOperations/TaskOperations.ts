import axios from 'axios';
import { HttpUtils } from 'client/VuexOperations/HttpUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { HttpPathItem } from 'common/HttpPathItem';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { Commit } from 'vuex';
export const actions = {

    /**
     * get templates by conditions
     * @param param0 
     * @param args 
     */
    async [StoreActionNames.taskCreation](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.TASK}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            const newTaskList = state.taskObjs || [];
            newTaskList.push(result.data);
            commit(StoreMutationNames.tasksUpdate, newTaskList);
        }
        return result;
    },
    async [StoreActionNames.taskQuery](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        let result: APIResult = { code: ApiResultCode.Success } as APIResult;
        if (args.notUseLocalData) {
            const response = await axios.post(
                `${HttpPathItem.API}/${HttpPathItem.TASK}/${HttpPathItem.QUERY}`, args.data || {});
            result = HttpUtils.getApiResultFromResponse(response);
            if (result.code === ApiResultCode.Success) {
                commit(StoreMutationNames.tasksUpdate, result.data);
            }
        } else {
            result.data = state.taskObjs;
        }

        return result;
    },
    async [StoreActionNames.taskApplyAccept](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        let result: APIResult = { code: ApiResultCode.Success } as APIResult;
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.TASK}/${HttpPathItem.APPLY}/${HttpPathItem.ACCEPT}`, args.data || {});
        result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            const updatedTaskView: TaskView = result.data;
            commit(StoreMutationNames.taskItemReplace, updatedTaskView);
        }

        return result;
    },

    async [StoreActionNames.taskApplyDeny](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        let result: APIResult = { code: ApiResultCode.Success } as APIResult;
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.TASK}/${HttpPathItem.APPLY}/${HttpPathItem.DENY}`, args.data || {});
        result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            const updatedTaskView: TaskView = result.data;
            commit(StoreMutationNames.taskItemReplace, updatedTaskView);
        }

        return result;
    },

    async [StoreActionNames.taskRemove]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.TASK}/${HttpPathItem.REMOVE}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            const removedTaskView: TaskView = result.data;
            if (removedTaskView != null) {
                commit(StoreMutationNames.taskItemReplace, removedTaskView.uid);
            }
        }
        return result;
    },
    async [StoreActionNames.taskApply]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.TASK}/${HttpPathItem.APPLY}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            commit(StoreMutationNames.taskItemReplace, result.data);
        }
        return result;
    },
};

export const mutations = {
    [StoreMutationNames.tasksUpdate](state: IStoreState, taskObjs: TaskView[]) {
        state.taskObjs = taskObjs;
    },

    [StoreMutationNames.taskItemReplace](state: IStoreState, updatedTaskView: TaskView) {
        if (updatedTaskView == null) {
            return;
        }
        let indexToBeReplaced: number = -1;
        (state.taskObjs as TaskView[]).forEach((task, index) => {
            if (task.uid === updatedTaskView.uid) {
                indexToBeReplaced = index;
            }
        });
        if (indexToBeReplaced !== -1) {
            (state.taskObjs as TaskView[]).splice(indexToBeReplaced, 1, updatedTaskView);
        }
    },

    [StoreMutationNames.taskItemRemove](state: IStoreState, removedTaskUid: string) {
        let indexToBeRemoved: number = -1;
        (state.taskObjs as TaskView[]).forEach((task, index) => {
            if (task.uid === removedTaskUid) {
                indexToBeRemoved = index;
            }
        });
        if (indexToBeRemoved !== -1) {
            (state.taskObjs as TaskView[]).splice(indexToBeRemoved, 1);
        }
    },
};
