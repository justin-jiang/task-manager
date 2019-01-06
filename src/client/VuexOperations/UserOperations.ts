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
    async [StoreActionNames.userEnable]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.ENABLE}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            commit(StoreMutationNames.userItemReplace, result.data);
        }
        return result;
    },
    async [StoreActionNames.userDisable]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.DISABLE}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            commit(StoreMutationNames.userItemReplace, result.data);
        }
        return result;
    },
    async [StoreActionNames.userBasicInfoEdit]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.EDIT}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            commit(StoreMutationNames.userItemReplace, result.data);
        }
        return result;
    },
    async [StoreActionNames.userRemove]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.REMOVE}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        if (result.code === ApiResultCode.Success) {
            commit(StoreMutationNames.userItemDelete, result.data);
        }
        return result;
    },
    async [StoreActionNames.userPasswordEdit]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.PASSWORD}/${HttpPathItem.EDIT}`, args.data || {});
        const result = HttpUtils.getApiResultFromResponse(response);
        return result;
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
};
