import axios from 'axios';
import { LoggerManager } from 'client/LoggerManager';
import { HttpPathItem } from 'common/HttpPathItem';
import { SessionCreateParam } from 'common/requestParams/SessionCreateParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { Commit } from 'vuex';
import { HttpUtils } from './HttpUtils';
import { IStoreActionArgs } from './IStoreActionArgs';
import { IStoreState } from './IStoreState';
import { StoreActionNames } from './StoreActionNames';
import { StoreMutationNames } from './StoreMutationNames';
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
            commit(StoreMutationNames.updateSessionInfo, result.data);
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
            commit(StoreMutationNames.updateSessionInfo, result.data);
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
            commit(StoreMutationNames.updateSessionInfo, result.data);
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
    [StoreMutationNames.updateSessionInfo](stateInst: IStoreState, user: UserView) {
        if (user == null) {
            LoggerManager.error('sessionInfo should not be null');
        } else if (user.uid == null || user.name == null) {
            LoggerManager.error('sessionInfo.uid or sessionInfo.name should not be null');
        } else {
            stateInst.sessionInfo = user;
        }
    },
};
