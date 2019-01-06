import axios from 'axios';
import { LoggerManager } from 'client/LoggerManager';
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
            if (result.data != null) {
                commit(StoreMutationNames.taskItemInsert, result.data);
            } else {
                LoggerManager.warn('No InsertedItem');
            }
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
                if (result.data != null) {
                    commit(StoreMutationNames.tasksUpdate, result.data);
                } else {
                    LoggerManager.warn('No UpdatedItem');
                }
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
            if (updatedTaskView != null) {
                commit(StoreMutationNames.taskItemReplace, updatedTaskView);
            } else {
                LoggerManager.warn('No UpdatedItem');
            }
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
            if (updatedTaskView != null) {
                commit(StoreMutationNames.taskItemReplace, updatedTaskView);
            } else {
                LoggerManager.warn('No UpdatedItem');
            }
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
                commit(StoreMutationNames.taskItemRemove, removedTaskView.uid);
            } else {
                LoggerManager.warn('No RemovedItem');
            }
        }
        return result;
    },
    async [StoreActionNames.taskApply]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.TASK}/${HttpPathItem.APPLY}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            if (result.data != null) {
                commit(StoreMutationNames.taskItemReplace, result.data);
            } else {
                LoggerManager.warn('No UpdatedItem');
            }
        }
        return result;
    },
};

export const mutations = {
    [StoreMutationNames.tasksUpdate](state: IStoreState, objViews: TaskView[]) {
        state.taskObjs = objViews;
    },

    [StoreMutationNames.taskItemInsert](state: IStoreState, insertedItem: TaskView) {
        if (insertedItem == null) {
            return;
        }
        state.taskObjs.push(insertedItem);
    },

    [StoreMutationNames.taskItemReplace](state: IStoreState, updatedItem: TaskView) {
        if (updatedItem == null) {
            return;
        }
        let indexToBeReplaced: number = -1;
        state.taskObjs.forEach((item: TaskView, index: number) => {
            if (item.uid === updatedItem.uid) {
                indexToBeReplaced = index;
            }
        });
        if (indexToBeReplaced !== -1) {
            state.taskObjs.splice(indexToBeReplaced, 1, updatedItem);
        }
    },

    [StoreMutationNames.taskItemRemove](state: IStoreState, removedItemUid: string) {
        let indexToBeRemoved: number = -1;
        state.taskObjs.forEach((item: TaskView, index: number) => {
            if (item.uid === removedItemUid) {
                indexToBeRemoved = index;
            }
        });
        if (indexToBeRemoved !== -1) {
            state.taskObjs.splice(indexToBeRemoved, 1);
        }
    },
};
