import axios from 'axios';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { StoreUtils } from 'client/common/StoreUtils';
import { LoggerManager } from 'client/LoggerManager';
import { HttpUtils } from 'client/VuexOperations/HttpUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { HttpPathItem } from 'common/HttpPathItem';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TemplateView } from 'common/responseResults/TemplateView';
import { Commit } from 'vuex';
export const actions = {

    /**
     * get templates by conditions
     * @param param0 
     * @param args 
     */
    async [StoreActionNames.templateQuery](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            if (args.notUseLocalData) {
                const response = await axios.post(
                    `${HttpPathItem.Api}/${HttpPathItem.Template}/${HttpPathItem.Query}`, args.data || {});
                apiResult = HttpUtils.getApiResultFromResponse(response);
                if (apiResult.code === ApiResultCode.Success) {
                    commit(StoreMutationNames.templatesUpdate, apiResult.data);
                }
            } else {
                apiResult.data = state.templateObjs;
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },
    async [StoreActionNames.templateRemove]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.Template}/${HttpPathItem.Remove}`, args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                const removedItem: TemplateView = apiResult.data;
                if (removedItem != null) {
                    commit(StoreMutationNames.templateItemRemove, removedItem);
                } else {
                    LoggerManager.warn('No removedItem');
                }
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },
    async [StoreActionNames.templateEdit]({ commit }: { commit: Commit }, args: IStoreActionArgs) {

        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.Template}/${HttpPathItem.Edit}`, args.data || {});
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                const updatedItem: TemplateView = apiResult.data;
                if (updatedItem != null) {
                    commit(StoreMutationNames.templateItemReplace, updatedItem);
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
    [StoreMutationNames.templatesUpdate](stateInst: IStoreState, objViews: TemplateView[]) {
        stateInst.templateObjs = objViews;
    },
    [StoreMutationNames.templateItemReplace](state: IStoreState, updatedItem: TemplateView) {
        StoreUtils.replaceFromArray(state.templateObjs, updatedItem);
    },

    [StoreMutationNames.templateItemRemove](state: IStoreState, removedItem: TemplateView) {
        StoreUtils.deleteFromArray(state.templateObjs, removedItem);
    },

    [StoreMutationNames.templateItemInsert](state: IStoreState, insertedItem: TemplateView) {
        if (insertedItem == null) {
            LoggerManager.warn('insertedItem should not be null in StoreMutationNames.templateItemInsert');
            return;
        }
        state.templateObjs.push(insertedItem);
    },
};
