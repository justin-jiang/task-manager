import { AxiosResponse } from 'axios';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { StoreUtils } from 'client/common/StoreUtils';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Vue } from 'vue-property-decorator';
export class ComponentUtils {
    //#region -- actions to get data from server or store
    /**
     * download the image by specified image id
     * @param vue 
     * @param imageUid 
     * @param scenario 
     */
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

    /**
     * download file by specified file id
     * @param vue 
     * @param reqParam 
     * @param defaultFileName 
     */
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
                    vue.$message.success('下载开始');
                }
            } else {
                vue.$message.error(`文件下载失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })().catch((ex) => {
            LoggerManager.error('Error:', ex);
            vue.$message.error(`服务异常，文件下载失败`);
        });
    }

    /**
     * 
     * @param vue 
     * @param isBackground 
     */
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

    /**
     * 
     * @param vue 
     * @param isBackground 
     */
    public static pullTemplates(vue: Vue, isBackground?: boolean): void {
        const store = vue.$store;
        const storeState = store.state as IStoreState;
        if (!CommonUtils.isNullOrEmpty(storeState.sessionInfo.uid)) {
            (async () => {
                const apiResult: ApiResult = await StoreUtils.$$pullTemplates(store);
                if (apiResult.code !== ApiResultCode.Success) {
                    const errorMessage = `获取模板信息失败：${ApiErrorHandler.getTextByCode(apiResult)}`;
                    if (isBackground) {
                        LoggerManager.error(errorMessage);
                    } else {
                        vue.$message.error(errorMessage);
                    }
                }
            })();
        }
    }

    //#endregion


    //#region -- GUI related

    public static scrollToView(elemId: string) {
        const element = document.getElementById(elemId);
        if (element != null) {
            element.scrollIntoView();
        }
    }
    //#endregion

    //#region -- others

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

    public static copyEmailAddressToClipboard(value: string): void {
        // Create new element
        const el = document.createElement('textarea');
        // Set value (string to be copied)
        el.value = value;
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');

        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        // Select text inside element
        el.select();
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);
    }

    //#endregion
}
