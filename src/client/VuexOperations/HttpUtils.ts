import { AxiosResponse } from 'axios';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';

export class HttpUtils {
    public static getApiResultFromResponse(response: AxiosResponse<any>): ApiResult {
        if (response == null || response.data == null) {
            return { code: ApiResultCode.ConnectionError } as ApiResult;
        }
        return response.data as ApiResult;
    }
}
