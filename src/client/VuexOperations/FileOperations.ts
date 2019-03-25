import axios from 'axios';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { HttpPathItem } from 'common/HttpPathItem';
import { HttpUploadKey } from 'common/HttpUploadKey';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { Commit } from 'vuex';
import { TaskView } from 'common/responseResults/TaskView';
function handleImageUploadSucess(uploadScenario: FileAPIScenario, commit: Commit, userView: UserView | TaskView) {
    (async () => {
        switch (uploadScenario) {
            case FileAPIScenario.UploadAuthLetter:
                userView.authLetterUrl = '';
                commit(StoreMutationNames.sessionInfoPropUpdate, userView);
                break;
            case FileAPIScenario.UploadUserBackId:
                userView.backIdUrl = '';
                commit(StoreMutationNames.sessionInfoPropUpdate, userView);
                break;
            case FileAPIScenario.UploadUserFrontId:
                userView.frontIdUrl = '';
                commit(StoreMutationNames.sessionInfoPropUpdate, userView);
                break;
            case FileAPIScenario.UploadLicense:
                userView.licenseUrl = '';
                commit(StoreMutationNames.sessionInfoPropUpdate, userView);
                break;
            case FileAPIScenario.UploadLicenseWithPerson:
                userView.licenseWithPersonUrl = '';
                commit(StoreMutationNames.sessionInfoPropUpdate, userView);
                break;
            case FileAPIScenario.UploadUserLogo:
                userView.logoUrl = '';
                commit(StoreMutationNames.sessionInfoPropUpdate, userView);
                break;
        }
    })();
}
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
            const formData = new FormData();
            formData.append(HttpUploadKey.File, reqParam.blob as Blob, reqParam.fileName);
            formData.append('scenario', (reqParam.scenario as FileAPIScenario).toString());
            formData.append('optionData', reqParam.optionData as string);
            const response = await axios.post(
                `${HttpPathItem.Api}/${HttpPathItem.File}/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            apiResult = { code: ApiResultCode.Success } as ApiResult;
            if (response.status === 200) {
                apiResult = response.data as ApiResult;
                handleImageUploadSucess(reqParam.scenario as FileAPIScenario, commit, apiResult.data);
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
