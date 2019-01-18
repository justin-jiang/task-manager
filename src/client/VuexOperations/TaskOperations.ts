import axios from 'axios';
import { LoggerManager } from 'client/LoggerManager';
import { HttpUtils } from 'client/VuexOperations/HttpUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { HttpPathItem } from 'common/HttpPathItem';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { Commit } from 'vuex';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
async function taskUpdate(
    { commit }: { commit: Commit, state: IStoreState },
    url: string, args: any): Promise<ApiResult> {
    let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
    try {
        const response = await axios.post(url, args || {});
        apiResult = HttpUtils.getApiResultFromResponse(response);
        if (apiResult.code === ApiResultCode.Success) {
            const updatedTaskView: TaskView = apiResult.data;
            if (updatedTaskView != null) {
                commit(StoreMutationNames.taskItemReplace, updatedTaskView);
            } else {
                LoggerManager.warn('No UpdatedItem');
            }
        }
    } catch (ex) {
        apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
    }
    return apiResult;
}
export const actions = {

    /**
     * get templates by conditions
     * @param param0 
     * @param args 
     */
    async [StoreActionNames.taskCreation](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.Task}`, args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                if (apiResult.data != null) {
                    commit(StoreMutationNames.taskItemInsert, apiResult.data);
                } else {
                    LoggerManager.warn('No InsertedItem');
                }
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },
    async [StoreActionNames.taskQuery](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {

        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            if (args.notUseLocalData) {
                const response = await axios.post(
                    `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Query}`, args.data || {});
                apiResult = HttpUtils.getApiResultFromResponse(response);
                if (apiResult.code === ApiResultCode.Success) {
                    if (apiResult.data != null) {
                        commit(StoreMutationNames.tasksUpdate, apiResult.data);
                    } else {
                        LoggerManager.warn('No UpdatedItem');
                    }
                }
            } else {
                apiResult.data = state.taskObjs;
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },

    async [StoreActionNames.taskRemove]({ commit }: { commit: Commit }, args: IStoreActionArgs) {

        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Remove}`, args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                const removedTaskView: TaskView = apiResult.data;
                if (removedTaskView != null) {
                    commit(StoreMutationNames.taskItemRemove, removedTaskView.uid);
                } else {
                    LoggerManager.warn('No RemovedItem');
                }
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },

    async [StoreActionNames.taskApplyCheck](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await taskUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Apply}/${HttpPathItem.Check}`,
            args.data || {});
    },

    async [StoreActionNames.taskApply](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await taskUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Apply}`,
            args.data || {});
    },

    async [StoreActionNames.taskResultCheck](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await taskUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Result}/${HttpPathItem.Check}`,
            args.data || {});
    },

    async [StoreActionNames.taskAudit](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await taskUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Audit}`,
            args.data || {});
    },
    async [StoreActionNames.taskApplyAudit](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await taskUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Apply}/${HttpPathItem.Audit}`,
            args.data || {});
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
