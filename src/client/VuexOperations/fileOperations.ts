import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { Commit } from 'vuex';
import axios from 'axios';
import { HttpPathItem } from 'common/HttpPathItem';
import { HttpUtils } from 'client/VuexOperations/HttpUtils';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
export const actions = {
    async [StoreActionNames.fileDownload]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        const response = await axios.post(
            `${HttpPathItem.API}/${HttpPathItem.FILE}/${HttpPathItem.DOWNLOAD}`,
            args.data || {},
            {
                responseType: 'blob',
            });
        const result: APIResult = { code: ApiResultCode.Success } as APIResult;
        if (response.status === 200) {
            result.data = response.data;
        } else {
            result.code = ApiResultCode.FILE_FAILED_DOWNLOAD;
            result.data = `HttpStatus:${response.status}`;
        }
        return result;
    },
};

export const mutations = {
};
