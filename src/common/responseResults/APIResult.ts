import { ApiResultCode } from './ApiResultCode';

export class APIResult {
    public code: ApiResultCode;
    public data?: any;
    constructor() {
        this.code = ApiResultCode.NONE;
    }
}
