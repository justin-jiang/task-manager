import axios from 'axios';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { HttpPathItem } from 'common/HttpPathItem';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { Commit } from 'vuex';
import { HttpUtils } from './HttpUtils';

export const actions = {
    async [StoreActionNames.userQuery]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.QUERY}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            commit(StoreMutationNames.usersUpdate, result.data);
        }
        return result;
    },

    async [StoreActionNames.userCheck]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.CHECK}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            commit(StoreMutationNames.userItemReplace, result.data);
        }
        return result;
    },
};

export const mutations = {
    [StoreMutationNames.usersUpdate](state: IStoreState, userObjs: UserView[]) {
        state.userObjs = userObjs;
    },
    [StoreMutationNames.userItemInsert](state: IStoreState, userObj: UserView) {
        state.userObjs.push(userObj);
    },

    [StoreMutationNames.userItemReplace](state: IStoreState, userObj: UserView) {
        if (userObj == null) {
            return;
        }
        let indexToBeReplaced: number = -1;
        state.userObjs.forEach((item, index) => {
            if (item.uid === userObj.uid) {
                indexToBeReplaced = index;
            }
        });
        if (indexToBeReplaced !== -1) {
            state.userObjs.splice(indexToBeReplaced, 1, userObj);
        }
    },
};
