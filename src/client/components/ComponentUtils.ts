import { AxiosResponse } from 'axios';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { UserView } from 'common/responseResults/UserView';
import { UserState } from 'common/UserState';
import { UserType } from 'common/UserTypes';
import { Vue } from 'vue-property-decorator';
export class ComponentUtils {
    public static async $$getImageUrl(
        vue: Vue, imageUid: string, scenario: FileAPIScenario): Promise<string | undefined> {
        let logoUrl: string | undefined;
        let apiResult: ApiResult = await vue.$store.dispatch(
            StoreActionNames.fileDownload,
            {
                data: {
                    fileId: imageUid,
                    scenario,
                    version: 0,
                } as FileDownloadParam,
            } as IStoreActionArgs);
        const response: AxiosResponse<any> = apiResult.data;
        const responseData = response.data;
        if (apiResult.code !== ApiResultCode.Success) {
            vue.$message.error(`获取图片失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
        } else {
            if (responseData.type === 'application/json') {
                const reader = new FileReader();
                reader.onloadend = (e: ProgressEvent) => {
                    apiResult = JSON.parse((e.srcElement as any).result);
                    vue.$message.error(`获取图片失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                    LoggerManager.error((e.srcElement as any).result);
                };
                reader.readAsText(responseData);
            } else {
                logoUrl = URL.createObjectURL(responseData);
            }
        }
        return logoUrl;
    }

    public static downloadFile(vue: Vue, reqParam: FileDownloadParam, defaultFileName: string) {
        (async () => {
            let apiResult: ApiResult = await vue.$store.dispatch(
                StoreActionNames.fileDownload,
                {
                    data: reqParam,
                } as IStoreActionArgs);
            const response: AxiosResponse<any> = apiResult.data;
            const responseData = response.data;
            if (apiResult.code === ApiResultCode.Success) {
                if (responseData.type === 'application/json') {
                    const reader = new FileReader();
                    reader.onloadend = (e: ProgressEvent) => {
                        apiResult = JSON.parse((e.srcElement as any).result);
                        vue.$message.error(`下载文件失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                        LoggerManager.error((e.srcElement as any).result);
                    };
                    reader.readAsText(responseData);
                } else {
                    const url = window.URL.createObjectURL(new Blob([responseData]));
                    const link = document.createElement('a');
                    link.href = url;
                    let fileName: string = defaultFileName;
                    if (response.headers['content-disposition'] != null) {
                        fileName = decodeURI((response.headers['content-disposition'] as string)).split('=')[1];
                    }
                    link.setAttribute('download', fileName);
                    document.body.appendChild(link);
                    link.click();
                }
            } else {
                vue.$message.error(`文件下载失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })().catch((ex) => {
            RouterUtils.goToErrorView(vue.$router, vue.$store.state, msgConnectionIssue, ex);
        });
    }

    public static pullNotification(vue: Vue, isBackground?: boolean) {
        const store = vue.$store;
        const storeState = store.state as IStoreState;
        if (!CommonUtils.isNullOrEmpty(storeState.sessionInfo.uid)) {
            (async () => {
                const apiResult: ApiResult = await store.dispatch(
                    StoreActionNames.notificationQuery, { notUseLocalData: true } as IStoreActionArgs);
                if (apiResult.code !== ApiResultCode.Success) {
                    const errorMessage = `获取通知消息失败：${ApiErrorHandler.getTextByCode(apiResult)}`;
                    if (isBackground) {
                        LoggerManager.error(errorMessage);
                    } else {
                        vue.$message.error(errorMessage);
                    }
                }
            })();
        }
    }
    public static getUserStateText(userView: UserView): string {
        if (!this.isAllRequiredIdsUploaded(userView) || userView.qualificationState === CheckState.Missed) {
            return '信息缺失';
        }

        if (userView.idState === CheckState.FailedToCheck || userView.qualificationState === CheckState.FailedToCheck) {
            return '审核失败';
        }

        if (userView.idState === CheckState.ToBeChecked || userView.qualificationState === CheckState.ToBeChecked) {
            return '审核中';
        }

        switch (userView.state) {
            case UserState.Enabled:
                return '已启用';
            case UserState.Disabled:
                return '已禁用';
            default:
                return '错误状态';
        }
    }
    public static isAllRequiredIdsUploaded(userView: UserView): boolean {
        if (userView.type === UserType.Individual) {
            return !CommonUtils.isNullOrEmpty(userView.backIdUid) &&
                !CommonUtils.isNullOrEmpty(userView.frontIdUid);
        } else {
            return !CommonUtils.isNullOrEmpty(userView.backIdUid) &&
                !CommonUtils.isNullOrEmpty(userView.frontIdUid) &&
                !CommonUtils.isNullOrEmpty(userView.licenseUid) &&
                !CommonUtils.isNullOrEmpty(userView.licenseWithPersonUid);
        }
    }

    public static scrollToView(elemId: string) {
        const element = document.getElementById(elemId);
        if (element != null) {
            element.scrollIntoView();
        }
    }

    /**
     * according the param model to pick up matched prop from form data
     * @param formData 
     * @param paramModel 
     */
    public static pickUpKeysByModel(formData: any, paramModel: any): any {
        const result: any = {};
        const paramKeys = Object.keys(formData);
        const modelKeys = Object.keys(paramModel);
        paramKeys.forEach((key) => {
            if (modelKeys.includes(key)) {
                result[key] = formData[key];
            }
        });
        return result;
    }
}
