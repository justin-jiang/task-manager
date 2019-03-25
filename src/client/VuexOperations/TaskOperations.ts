import axios from 'axios';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
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
async function commonUpdate(
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

    // #region -- create, query and remove
    async [StoreActionNames.taskCreate](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Create}`, args.data || {});
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
    async [StoreActionNames.taskHistoryQuery](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.History}/${HttpPathItem.Query}`,
                args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
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
    // #endregion

    // #region -- edit
    // #region [Black] -- -- Task
    async [StoreActionNames.taskBasicInfoEdit](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Edit}`,
            args.data || {});
    },
    async [StoreActionNames.taskSubmit](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Submit}`,
            args.data || {});
    },
    async [StoreActionNames.taskInfoAudit](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Audit}`,
            args.data || {});
    },
    async [StoreActionNames.taskExecutorAudit](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Executor}/${HttpPathItem.Audit}`,
            args.data || {});
    },
    async [StoreActionNames.taskPublisherVisit](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Visit}`,
            args.data || {});
    },
    // #endregion

    // #region [Black] -- -- task apply
    async [StoreActionNames.taskApplyCheck](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Apply}/${HttpPathItem.Check}`,
            args.data || {});
    },

    async [StoreActionNames.taskApply](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Apply}`,
            args.data || {});
    },
    async [StoreActionNames.taskMarginAudit](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Margin}/${HttpPathItem.Audit}`,
            args.data || {});
    },
    async [StoreActionNames.taskApplyRemove](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Apply}/${HttpPathItem.Remove}`,
            args.data || {});
    },
    // #endregion

    // #region [Black] -- -- task result
    async [StoreActionNames.taskResultCheck](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Result}/${HttpPathItem.Check}`,
            args.data || {});
    },

    async [StoreActionNames.taskResultAuit](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Result}/${HttpPathItem.Audit}`,
            args.data || {});
    },

    // #endregion 

    // #region [Black] -- -- task deposit
    async [StoreActionNames.taskDepositAudit](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Deposit}/${HttpPathItem.Audit}`,
            args.data || {});
    },
    // #endregion

    // #region [Black] -- -- task receipt
    /**
     * this api is for no-receipt scenario
     * for receipt scenario, please refer to FileAPIScenario.UpdateTaskReceipt
     * @param param0 
     * @param args 
     */
    async [StoreActionNames.taskExecutorReceiptNotRequired](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Receipt}/${HttpPathItem.Deny}`,
            args.data || {});
    },
    // #endregion
    // #endregion

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
