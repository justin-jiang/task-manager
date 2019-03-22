import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { LoggerManager } from 'client/LoggerManager';
import { ApiResult } from 'common/responseResults/APIResult';

export class ApiErrorHandler {
    public static updateErrorMessageByCode(resultCode: ApiResultCode, state: IStoreState): void {

    }

    public static updateErrorMessage(errorMessage: string, state: IStoreState): void {
        state.errorMessage = errorMessage;
    }

    public static getTextByCode(apiResult: ApiResult): string {
        switch (apiResult.code) {
            case ApiResultCode.AuthUnauthorized:
                return '未登录';
            case ApiResultCode.AuthForbidden:
                return '没有权限';
            case ApiResultCode.DbDuplicateKey:
                return this.getDbDuplicateText(apiResult);
            case ApiResultCode.ConnectionError:
                return '服务器异常';
            case ApiResultCode.InputImageTooLarge:
                return '图片大小超过限制';
            case ApiResultCode.DbNotFound:
                return '数据库中不存在';
            case ApiResultCode.DbNotFound_User:
                return '此用户不存在';
            default:
                return ApiResultCode[apiResult.code];
        }
    }
    public static getTextFromAxiosResponse(
        response: { response: { status: number, statusText: string, data: string } }) {
        LoggerManager.error('Error:', response);
        if (response.response != null) {
            return `HttpStatus:${response.response.status}`;
        } else {
            return 'Unknown';
        }
    }

    private static getDbDuplicateText(apiResult: ApiResult): string {
        if (/index: name_1_collation/.test(apiResult.data.message)) {
            return '名称冲突';
        }
        if (/index: email_1_collation/.test(apiResult.data.message)) {
            return '邮箱名称冲突';
        }

        if (/index: telephone_1/.test(apiResult.data.message)) {
            return '电话号码冲突';
        }
        return '提交内容有冲突';
    }
}
