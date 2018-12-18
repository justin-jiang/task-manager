import { API_PATH_API, API_PATH_USER, API_PATH_FILE, UPLOAD_TYPE_FILE } from '@/common/Constants';
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
import { IFilePostParam } from '@/common/requestParams/IFilePostParam';
import { IAPIResult } from '@/common/responseResults/IAPIResult';
async function $$getUserList(commit: Commit) {
    const response = await axios.get('/api/users/');
    const result = Utils.getApiResultFromResponse(response);
    if (result.code === ApiResultCode.Success) {
        commit(StoreMutationNames.updateUserList, result.data);
    }
    return result;
}
export const actions = {

    // async [StoreActionNames.uploadFile]({ commit }: { commit: Commit }, args: IStoreActionArgs): Promise<IAPIResult> {
    //     const filePostParam: IFilePostParam = args.data;
    //     const formData = new FormData();
    //     formData.append(UPLOAD_TYPE_FILE, filePostParam.fileData);
    //     formData.append('entryId', filePostParam.entryId);
    //     formData.append('version', filePostParam.version.toString());
    //     formData.append('metaData', filePostParam.metaData);
    //     const response = await axios.post(`/${API_PATH_API}/${API_PATH_FILE}/`,
    //         formData,
    //         {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data',
    //             },
    //         });
    //     const result = Utils.getApiResultFromResponse(response);
    //     return result;
    // },
};

export const mutations = {
};
