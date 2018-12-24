import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { AxiosResponse } from 'axios';

export class HttpUtils {
    public static getApiResultFromResponse(response: AxiosResponse<any>): APIResult {
        if (response == null || response.data == null) {
            return { code: ApiResultCode.SystemError } as APIResult;
        }
        return response.data as APIResult;
    }
}
