import axios from 'axios';
import { HttpUtils } from 'client/VuexOperations/HttpUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { HttpPathItem } from 'common/HttpPathItem';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { Commit } from 'vuex';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { ApiResult } from 'common/responseResults/APIResult';

export const actions = {
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

    async [StoreActionNames.userCheck]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Check}`, args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                commit(StoreMutationNames.userItemReplace, apiResult.data);
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },
    async [StoreActionNames.userEnable]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Enable}`, args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                commit(StoreMutationNames.userItemReplace, apiResult.data);
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },
    async [StoreActionNames.userDisable]({ commit }: { commit: Commit }, args: IStoreActionArgs) {

        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Disable}`, args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                commit(StoreMutationNames.userItemReplace, apiResult.data);
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },
    async [StoreActionNames.userBasicInfoEdit]({ commit }: { commit: Commit }, args: IStoreActionArgs) {

        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Edit}`, args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                commit(StoreMutationNames.userItemReplace, apiResult.data);
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
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
                `${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Password}/${HttpPathItem.Edit}`, args.data || {});
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
        if (updatedItem == null) {
            return;
        }
        let indexToBeReplaced: number = -1;
        state.userObjs.forEach((item, index) => {
            if (item.uid === updatedItem.uid) {
                indexToBeReplaced = index;
            }
        });
        if (indexToBeReplaced !== -1) {
            state.userObjs.splice(indexToBeReplaced, 1, updatedItem);
        }
    },
    [StoreMutationNames.userItemDelete](state: IStoreState, deletedItem: UserView) {
        if (deletedItem == null) {
            return;
        }
        let indexToBeReplaced: number = -1;
        state.userObjs.forEach((item, index) => {
            if (item.uid === deletedItem.uid) {
                indexToBeReplaced = index;
            }
        });
        if (indexToBeReplaced !== -1) {
            state.userObjs.splice(indexToBeReplaced, 1);
        }
    },
    [StoreMutationNames.userItemUpdate](state: IStoreState, updatedProps: UserView) {
        if (updatedProps == null) {
            return;
        }
        let indexToBeUpdated: number = -1;
        state.userObjs.forEach((item, index) => {
            if (item.uid === updatedProps.uid) {
                indexToBeUpdated = index;
            }
        });
        if (indexToBeUpdated !== -1) {
            const origItem = state.userObjs[indexToBeUpdated];
            const newItem = Object.assign({}, origItem, updatedProps);
            state.userObjs.splice(indexToBeUpdated, 1, newItem);
        }
    },
};
