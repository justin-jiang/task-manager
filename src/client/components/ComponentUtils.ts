import { AxiosResponse } from 'axios';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Vue } from 'vue-property-decorator';
import { RouterUtils } from 'client/common/RouterUtils';
import { msgConnectionIssue } from 'client/common/Constants';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { UserView } from 'common/responseResults/UserView';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CommonUtils } from 'common/CommonUtils';
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
            vue.$message.error(`获取Logo失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
        } else {
            if (responseData.type === 'application/json') {
                const reader = new FileReader();
                reader.onloadend = (e: ProgressEvent) => {
                    apiResult = JSON.parse((e.srcElement as any).result);
                    vue.$message.error(`获取Logo失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                    LoggerManager.error((e.srcElement as any).result);
                };
                reader.readAsText(responseData);
            } else {
                logoUrl = URL.createObjectURL(responseData);
            }
        }
        return logoUrl;
    }

    public static async $$getSessionInfo(vue: Vue): Promise<void> {
        const store = vue.$store;
        const apiResult: ApiResult = await store.dispatch(
            StoreActionNames.sessionQuery, { notUseLocalData: true } as IStoreActionArgs);
        if (apiResult.code === ApiResultCode.Success) {
            const state = store.state as IStoreState;
            const logoUrl: string | undefined = await this.$$getImageUrl(
                vue, state.sessionInfo.logoUid as string, FileAPIScenario.DownloadUserLogo);
            if (logoUrl != null) {
                store.commit(StoreMutationNames.sessionInfoPropUpdate, { logoUrl } as UserView);
            }
        }
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
                        vue.$message.error(`下载文件失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
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
                vue.$message.error(`文件下载失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
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
                    const errorMessage = `获取通知消息失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`;
                    if (isBackground) {
                        LoggerManager.error(errorMessage);
                    } else {
                        vue.$message.error(errorMessage);
                    }
                }
            })();
        }
    }
}
