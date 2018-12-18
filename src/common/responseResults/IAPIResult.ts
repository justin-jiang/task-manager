import { ApiResultCode } from './ApiResultCode';

export interface IAPIResult {
    code: ApiResultCode;
    data?: any;
}
