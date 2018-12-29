import axios from 'axios';
import { HttpPathItem } from 'common/HttpPathItem';
import { Commit } from 'vuex';
import { HttpUtils } from 'client/VuexOperations/HttpUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { TemplateView } from 'common/responseResults/TemplateView';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { APIResult } from 'common/responseResults/APIResult';
export const actions = {

    /**
     * get templates by conditions
     * @param param0 
     * @param args 
     */
    async [StoreActionNames.templateQuery](
        { commit, state }: { commit: Commit, state: IStoreState }, args: IStoreActionArgs) {
        let result: APIResult = { code: ApiResultCode.Success } as APIResult;
        if (args.notUseLocalData) {
            const response = await axios.post(
                `${HttpPathItem.API}/${HttpPathItem.TEMPLATE}/${HttpPathItem.QUERY}`, args.data || {});
            result = HttpUtils.getApiResultFromResponse(response);
            if (result.code === ApiResultCode.Success) {
                commit(StoreMutationNames.templatesUpdate, result.data);
            }
        } else {
            result.data = state.templateObjs;
        }

        return result;
    },
    async [StoreActionNames.templateRemove]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.TEMPLATE}/${HttpPathItem.REMOVE}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        return result;
    },
    async [StoreActionNames.templateEdit]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.TEMPLATE}/${HttpPathItem.EDIT}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        return result;
    },
};

export const mutations = {
    [StoreMutationNames.templatesUpdate](stateInst: IStoreState, templateObjs: TemplateView[]) {
        stateInst.templateObjs = templateObjs;
    },
};
