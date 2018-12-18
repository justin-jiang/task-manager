import { IAPIResult } from '@/common/responseResults/IAPIResult';
import { ApiResultCode } from '@/common/responseResults/ApiResultCode';
import { AxiosResponse } from 'axios';

export class Utils {
    public static getApiResultFromResponse(response: AxiosResponse<any>): IAPIResult {
        if (response == null || response.data == null) {
            return { code: ApiResultCode.UnknownError } as IAPIResult;
        }
        return response.data as IAPIResult;
    }
}
