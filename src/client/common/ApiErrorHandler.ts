import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { IStoreState } from 'client/VuexOperations/IStoreState';

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
}
