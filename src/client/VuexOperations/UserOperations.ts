import axios from 'axios';
import { HttpPathItem } from 'common/HttpPathItem';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { UserView } from 'common/responseResults/UserView';
import { Commit } from 'vuex';
import { HttpUtils } from './HttpUtils';
import { IStoreActionArgs } from './IStoreActionArgs';
import { IStoreState } from './IStoreState';
import { StoreActionNames } from './StoreActionNames';
import { StoreMutationNames } from './StoreMutationNames';

export const actions = {

    async [StoreActionNames.userCreate]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const userPostParam: UserCreateParam = args.data;
        const response = await axios.post(`${HttpPathItem.API}/${HttpPathItem.USER}/`, userPostParam);
        const result = HttpUtils.getApiResultFromResponse(response);
        return result;
    },

    async [StoreActionNames.userQuery]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.QUERY}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        return result;
    },
};

export const mutations = {
    /**
     * Update userDetails
     * @param {IStoreState} stateInst
     * @param {IUser} user
     */
    [StoreMutationNames.updateUserDetails](stateInst: IStoreState, user: UserView) {
        stateInst.sessionInfo = user;
    },
};
