import { Vue } from 'vue-property-decorator';
import { APIResult } from 'common/responseResults/APIResult';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { LoggerManager } from 'client/LoggerManager';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
export class ComponentUtils {
    public static async getLogoUrl(vue: Vue, logoId: string): Promise<string | undefined> {
        let logoUrl: string | undefined;
        let apiResult: APIResult = await vue.$store.dispatch(
            StoreActionNames.fileDownload,
            {
                data: {
                    fileId: logoId,
                    scenario: FileAPIScenario.DownloadUserLogo,
                    version: 0,
                } as FileDownloadParam,
            } as IStoreActionArgs);
        if (apiResult.code !== ApiResultCode.Success) {
            vue.$message.error(`获取Logo失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
        } else {
            if (apiResult.data.type === 'application/json') {
                const reader = new FileReader();
                reader.onloadend = (e: ProgressEvent) => {
                    apiResult = JSON.parse((e.srcElement as any).result);
                    vue.$message.error(`获取Logo失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                    LoggerManager.error((e.srcElement as any).result);
                };
                reader.readAsText(apiResult.data);
            } else {
                logoUrl = URL.createObjectURL(apiResult.data);
            }
        }
        return logoUrl;
    }
}
