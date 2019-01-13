import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { LoggerManager } from 'client/LoggerManager';

export class ApiErrorHandler {
    public static updateErrorMessageByCode(resultCode: ApiResultCode, state: IStoreState): void {

    }

    public static updateErrorMessage(errorMessage: string, state: IStoreState): void {
        state.errorMessage = errorMessage;
    }

    public static getTextByCode(code: ApiResultCode): string {
        switch (code) {
            case ApiResultCode.AuthUnauthorized:
                return '未登录';
            case ApiResultCode.AuthForbidden:
                return '没有权限';
            default:
                return ApiResultCode[code];
        }
    }
    public static getTextFromAxiosResponse(response: { response: { status: number, statusText: string, data: string } }) {
        LoggerManager.error('Error:', response);
        if (response.response != null) {
            return `HttpStatus:${response.response.status}`;
        } else {
            return 'Unknown';
        }
    }
}
