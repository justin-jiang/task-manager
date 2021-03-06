import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import * as mongoose from 'mongoose';
import { CommonUtils } from 'common/CommonUtils';
import { ApiResult } from 'common/responseResults/APIResult';
interface IErrorData {
    originalCode: number;
    message: string;
}
export class ApiError extends ApiResult {
    public static fromError(error: any): ApiError {
        const outputError: ApiError = new ApiError(ApiResultCode.ConnectionError);
        if (error instanceof mongoose.Error.ValidationError) {
            outputError.code = ApiResultCode.DbValidationError;
        }
        if (error.code != null) {
            (outputError.data as IErrorData).originalCode = error.code;
        }
        if (error.message != null) {
            (outputError.data as IErrorData).message = error.message;
        }
        if (error.stack != null) {
            outputError.stack = error.stack;
            if (CommonUtils.isPrimitiveString(outputError.stack)) {
                if ((outputError.stack as string).includes('taskManager.taskApplications index: taskUid_1 dup key')) {
                    outputError.code = ApiResultCode.Logic_Task_Been_Applied;
                } else if ((outputError.stack as string).includes('E11000 duplicate key')) {
                    outputError.code = ApiResultCode.DbDuplicateKey;
                }
            }
        }
        return outputError;
    }

    public stack?: string;

    constructor(code: ApiResultCode, message?: string, data?: IErrorData) {
        super();
        this.code = code;
        this.data = data || {} as IErrorData;
        if (message == null) {
            this.data = { message: ApiResultCode[code] } as IErrorData;
        } else {
            this.data.message = message;
        }
    }
}
