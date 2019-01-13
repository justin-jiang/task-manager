import { ApiResultCode } from './ApiResultCode';

export class ApiResult {
    public code: ApiResultCode;
    public data?: any;
    constructor() {
        this.code = ApiResultCode.NONE;
    }
}
