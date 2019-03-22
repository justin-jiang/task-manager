import axios from 'axios';
import { LoggerManager } from 'client/LoggerManager';
import { HttpUtils } from 'client/VuexOperations/HttpUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { HttpPathItem } from 'common/HttpPathItem';
import { SessionCreateParam } from 'common/requestParams/SessionCreateParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { Commit } from 'vuex';
import { StoreGetterNames } from './StoreGetterNames';
import { blankStoreState } from 'client/store';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
export const actions = {

    /**
     * get current loginuser(sessionInfo)
     * @param param0 
     * @param args 
     */
    async [StoreActionNames.sessionQuery]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(`${HttpPathItem.Api}/${HttpPathItem.Session}/${HttpPathItem.Query}`);
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                commit(StoreMutationNames.sessionInfoUpdate, apiResult.data);
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }

        return apiResult;
    },

    /**
     * used to login
     * @param param0 
     * @param args 
     */
    async [StoreActionNames.sessionCreate]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const reqParam: SessionCreateParam = args.data as SessionCreateParam;
            const response = await axios.post(`${HttpPathItem.Api}/${HttpPathItem.Session}/`, reqParam);
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                if (apiResult.data != null) {
                    commit(StoreMutationNames.sessionInfoUpdate, apiResult.data);
                } else {
                    LoggerManager.warn('No CreatedSession');
                }

            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }

        return apiResult;
    },

    async [StoreActionNames.sessionRemove]({ commit }: { commit: Commit }, args: IStoreActionArgs) {

        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const reqParam: SessionCreateParam = args.data as SessionCreateParam;
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.Session}/${HttpPathItem.Remove}`,
                reqParam);
            apiResult = HttpUtils.getApiResultFromResponse(response);
            if (apiResult.code === ApiResultCode.Success) {
                const blankUser: UserView = new UserView(true);
                commit(StoreMutationNames.sessionInfoUpdate, blankUser);
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }

        return apiResult;
    },
};

export const mutations = {
    /**
     * Update loginUser(sessionInfo)
     * @param {IStoreState} stateInst
     * @param {IUser} user
     */
    [StoreMutationNames.sessionInfoUpdate](stateInst: IStoreState, user: UserView) {
        user = user || {};
        stateInst.sessionInfo = user;
    },
    [StoreMutationNames.sessionInfoPropUpdate](stateInst: IStoreState, user: UserView) {
        user = user || {};
        stateInst.sessionInfo = Object.assign({}, stateInst.sessionInfo, user);
    },
    [StoreMutationNames.sessionRedirectUrlUpdate](stateInst: IStoreState, redirectUrl: string) {
        stateInst.redirectURLAfterLogin = redirectUrl;
    },

    [StoreMutationNames.sessionReset](stateInst: IStoreState) {
        Object.assign(stateInst, blankStoreState);
    },

};

export const getters = {
    [StoreGetterNames.sessionInfoLogoUrl](stateInst: IStoreState) {
        return stateInst.sessionInfo.logoUrl;
    }
}
