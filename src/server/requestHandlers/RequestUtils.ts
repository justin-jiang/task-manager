import { ApiError } from 'server/common/ApiError';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';

export class RequestUtils {
    public static pickUpKeysByModel(reqParam: any, paramModel: any): any {
        if (reqParam == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'reqParam');
        }
        if (paramModel == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'paramModel');
        }
        const result: any = {};
        const paramKeys = Object.keys(reqParam);
        const modelKeys = Object.keys(paramModel);
        paramKeys.forEach((key) => {
            if (modelKeys.includes(key)) {
                result[key] = reqParam[key];
            } else {
                LoggerManager.warn(`upexpected key:${key}`);
            }
        });
        return result;
    }
}
