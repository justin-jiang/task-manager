import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import * as mongoose from 'mongoose';
import { CommonUtils } from 'common/CommonUtils';
export class ApiError {
    public static fromError(error: any): ApiError {
        const outputError: ApiError = new ApiError(ApiResultCode.SystemError);
        if (error instanceof mongoose.Error.ValidationError) {
            outputError.code = ApiResultCode.DB_VALIDATION_ERROR;
        }
        if (error.code != null) {
            outputError.data = `orignCode:${error.code}`;
        } else {
            outputError.data = error.message;
        }
        if (error.message != null) {
            outputError.message = error.message;
        }
        if (error.stack != null) {
            outputError.stack = error.stack;
            if (CommonUtils.isPrimitiveString(outputError.stack)) {
                if ((outputError.stack as string).includes('E11000 duplicate key')) {
                    outputError.code = ApiResultCode.DB_DUPLICATE_KEY;
                }
            }
        }
        return outputError;
    }

    public code: ApiResultCode;
    public message: string;
    public data?: any;
    public stack?: string;

    constructor(code: ApiResultCode, message?: string, data?: any) {
        this.code = code;
        if (message == null) {
            this.message = ApiResultCode[code];
        } else {
            this.message = message;
        }
        if (data) {
            this.data = data;
        } else {
            this.data = message;
        }
    }
}
