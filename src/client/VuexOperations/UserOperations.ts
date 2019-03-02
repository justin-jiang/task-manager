import axios from 'axios';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { StoreUtils } from 'client/common/StoreUtils';
import { LoggerManager } from 'client/LoggerManager';
import { HttpUtils } from 'client/VuexOperations/HttpUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { HttpPathItem } from 'common/HttpPathItem';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { Commit } from 'vuex';
async function commonUpdate(
    { commit }: { commit: Commit, state: IStoreState },
    url: string, args: any): Promise<ApiResult> {
    let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
    try {
        const response = await axios.post(url, args || {});
        apiResult = HttpUtils.getApiResultFromResponse(response);
        if (apiResult.code === ApiResultCode.Success) {
            const objView: UserView = apiResult.data;
            if (objView != null) {
                commit(StoreMutationNames.userItemReplace, objView);
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
    async [StoreActionNames.userCreate]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.User}`, args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                commit(StoreMutationNames.userItemInsert, apiResult.data);
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },

    async [StoreActionNames.userQuery]({ commit }: { commit: Commit }, args: IStoreActionArgs) {

        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Query}`, args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                commit(StoreMutationNames.usersUpdate, apiResult.data);
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },

    async [StoreActionNames.userCheck](
        { commit, state }: { commit: Commit, state: IStoreState },
        args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Check}`,
            args.data || {});
    },

    async [StoreActionNames.userEnable](
        { commit, state }: { commit: Commit, state: IStoreState },
        args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Enable}`,
            args.data || {});
    },

    async [StoreActionNames.userDisable](
        { commit, state }: { commit: Commit, state: IStoreState },
        args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Disable}`,
            args.data || {});
    },

    async [StoreActionNames.userBasicInfoEdit](
        { commit, state }: { commit: Commit, state: IStoreState },
        args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Edit}`,
            args.data || {});
    },

    async [StoreActionNames.userAccountInfoEdit](
        { commit, state }: { commit: Commit, state: IStoreState },
        args: IStoreActionArgs) {
        return await commonUpdate({ commit, state },
            `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.AccoutInfo}/${HttpPathItem.Edit}`,
            args.data || {});
    },

    async [StoreActionNames.userRemove]({ commit }: { commit: Commit }, args: IStoreActionArgs) {

        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Remove}`, args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                commit(StoreMutationNames.userItemDelete, apiResult.data);
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },

    async [StoreActionNames.userPasswordEdit]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Password}/${HttpPathItem.Edit}`,
                args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },
    async [StoreActionNames.userPasswordReset]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Password}/${HttpPathItem.Reset}`,
                args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },
};

export const mutations = {
    [StoreMutationNames.usersUpdate](state: IStoreState, objViews: UserView[]) {
        objViews = objViews || {};
        state.userObjs = objViews;
    },
    [StoreMutationNames.userItemInsert](state: IStoreState, insertedItem: UserView) {
        if (insertedItem != null) {
            state.userObjs.push(insertedItem);
        }
    },

    [StoreMutationNames.userItemReplace](state: IStoreState, updatedItem: UserView) {
        StoreUtils.replaceFromArray(state.userObjs, updatedItem);
    },

    [StoreMutationNames.userItemDelete](state: IStoreState, deletedItem: UserView) {
        StoreUtils.deleteFromArray(state.userObjs, deletedItem);
    },
    [StoreMutationNames.userItemUpdate](state: IStoreState, updatedProps: UserView) {
        StoreUtils.updateItemOfArray(state.userObjs, updatedProps);
    },
};
