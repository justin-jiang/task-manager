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
export const actions = {

    /**
     * get current loginuser(sessionInfo)
     * @param param0 
     * @param args 
     */
    async [StoreActionNames.sessionQuery]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(`${HttpPathItem.API}/${HttpPathItem.SESSION}/${HttpPathItem.QUERY}`);
        const result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            commit(StoreMutationNames.sessionInfoUpdate, result.data);
        }
        return result;
    },

    /**
     * used to login
     * @param param0 
     * @param args 
     */
    async [StoreActionNames.sessionCreate]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const reqParam: SessionCreateParam = args.data as SessionCreateParam;
        const response = await axios.post(`${HttpPathItem.API}/${HttpPathItem.SESSION}/`, reqParam);
        const result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            if (result.data != null) {
                commit(StoreMutationNames.sessionInfoUpdate, result.data);
            } else {
                LoggerManager.warn('No CreatedSession');
            }

        }
        return result;
    },

    async [StoreActionNames.sessionRemove]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const reqParam: SessionCreateParam = args.data as SessionCreateParam;
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.SESSION}/${HttpPathItem.REMOVE}`,
            reqParam);
        const result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            commit(StoreMutationNames.sessionInfoUpdate, {});
        }
        return result;
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
};
