import axios from 'axios';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { HttpPathItem } from 'common/HttpPathItem';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Commit } from 'vuex';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { HttpUploadKey } from 'common/HttpUploadKey';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
export const actions = {
    async [StoreActionNames.fileDownload]({ commit }: { commit: Commit }, args: IStoreActionArgs) {
        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.File}/${HttpPathItem.Download}`,
                args.data || {},
                {
                    responseType: 'blob',
                });
            apiResult = { code: ApiResultCode.Success } as ApiResult;
            if (response.status === 200) {
                apiResult.data = response;
            } else {
                apiResult.code = ApiResultCode.FileFailedDownload;
                apiResult.data = `HttpStatus:${response.status}`;
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },
    async [StoreActionNames.fileUpload]({ commit }: { commit: Commit }, args: IStoreActionArgs) {

        let apiResult: ApiResult = { code: ApiResultCode.ConnectionError };
        try {
            const reqParam = args.data as FileUploadParam;
            var formData = new FormData();
            formData.append(HttpUploadKey.File, reqParam.blob as Blob, reqParam.fileName);
            formData.append('scenario', (reqParam.scenario as FileAPIScenario).toString());
            formData.append('optionData', reqParam.optionData as string);
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.File}/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
            apiResult = { code: ApiResultCode.Success } as ApiResult;
            if (response.status === 200) {
                apiResult = response.data as ApiResult;
            } else {
                apiResult.code = ApiResultCode.FileFailedUpload;
                apiResult.data = `HttpStatus:${response.status}`;
            }
        } catch (ex) {
            apiResult.data = ApiErrorHandler.getTextFromAxiosResponse(ex);
        }
        return apiResult;
    },
};

export const mutations = {
};
