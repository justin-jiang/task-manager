import { API_PATH_API, API_PATH_USER } from '@/common/Constants';
import { IUserPostParam } from '@/common/requestParams/IUserPostParam';
import { ApiResultCode } from '@/common/responseResults/ApiResultCode';
import { IUserView } from '@/common/responseResults/IUserView';
import axios from 'axios';
import { Commit } from 'vuex';
import { IStoreActionArgs } from './IStoreActionArgs';
import { IAdminStoreState } from './IStoreState';
import { StoreActionNames } from './StoreActionNames';
import { StoreMutationNames } from './StoreMutationNames';
import { Utils } from './Utils';
async function $$getUserList(commit: Commit) {
    const response = await axios.get('/api/users/');
    const result = Utils.getApiResultFromResponse(response);
    if (result.code === ApiResultCode.Success) {
        commit(StoreMutationNames.updateUserList, result.data);
    }
    return result;
}
export const actions = {

    async [StoreActionNames.createUser]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const userPostParam: IUserPostParam = args.data;
        const response = await axios.post(`/${API_PATH_API}/${API_PATH_USER}/`, userPostParam);
        const result = Utils.getApiResultFromResponse(response);
        return result;
    },
};

export const mutations = {
    /**
     * Update userDetails
     * @param {IAdminStoreState} stateInst
     * @param {IUser} user
     */
    [StoreMutationNames.updateUserDetails](stateInst: IAdminStoreState, user: IUserView) {
        stateInst.selectedUser = user;
    },
};
