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
import { UserNotificationView } from 'common/responseResults/UserNotificationView';
import { Commit } from 'vuex';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { StoreUtils } from 'client/common/StoreUtils';
export const actions = {

    async [StoreActionNames.notificationQuery](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            if (args.notUseLocalData) {
                const response = await axios.post(
                    `${HttpPathItem.Api}/${HttpPathItem.Notification}/${HttpPathItem.Query}`, args.data || {});
                apiResult = HttpUtils.getApiResultFromResponse(response);
                if (apiResult.code === ApiResultCode.Success) {
                    commit(StoreMutationNames.notificationUpdate, apiResult.data);
                }
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },

    async [StoreActionNames.notificationRead]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.Notification}/${HttpPathItem.Read}`, args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                const updatedItem: UserNotificationView = apiResult.data;
                if (updatedItem != null) {
                    commit(StoreMutationNames.notificationItemReplace, updatedItem);
                } else {
                    LoggerManager.warn('No updatedItem');
                }
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },
};

export const mutations = {
    [StoreMutationNames.notificationUpdate](stateInst: IStoreState, objViews: UserNotificationView[]) {
        stateInst.notificationObjs = objViews;
    },
    [StoreMutationNames.notificationItemReplace](state: IStoreState, updatedItem: UserNotificationView) {
        StoreUtils.replaceFromArray(state.notificationObjs, updatedItem);
    },

    [StoreMutationNames.notificationItemInsert](state: IStoreState, insertedItem: UserNotificationView) {
        if (insertedItem == null) {
            LoggerManager.warn('insertedItem should not be null in StoreMutationNames.notificationItemInsert');
            return;
        }
        state.notificationObjs.push(insertedItem);
    },
};
