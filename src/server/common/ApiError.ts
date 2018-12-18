import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import * as mongoose from 'mongoose';
export class ApiError {
    public static fromError(error: any): ApiError {
        const outputError: ApiError = {
            code: ApiResultCode.UnknownError, data: ApiResultCode[ApiResultCode.UnknownError],
        };
        if (error instanceof mongoose.Error.ValidationError) {
            outputError.code = ApiResultCode.DB_VALIDATION_ERROR;
        }
        if (error.code != null) {
            outputError.code = error.code;
            outputError.data = ApiResultCode[outputError.code];
        }
        if (error.message != null) {
            outputError.data = error.message;
        }
        if (error.stack != null) {
            outputError.stack = error.stack;
        }
        return outputError;
    }

    public code: ApiResultCode;
    public data?: any;
    public stack?: string;

    constructor(code: ApiResultCode, data?: any) {
        this.code = code;
        if (data) {
            this.data = data;
        }
    }
}
