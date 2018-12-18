import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { CommonUtils } from 'common/CommonUtils';
import { ApiError } from 'server/common/ApiError';
import { IDBObject } from '../dataObjects/IDBObject';
import { IModel } from './mongoDB/IModel';
import { IQueryConditions } from 'common/requestParams/IQueryConditions';

export class BaseModelWrapper implements IDBObject {
    [key: string]: any;
    // #region -- implement IDBObject property
    public uid: string;
    public createTime: number;
    // #endregion
    constructor() {
        // All the uid of data in MongoDB with the prefix of 'A-'
        this.uid = CommonUtils.getUUIDForMongoDB();
        this.createTime = Date.now();
    }
    // #region -- implement IDBObject methods
    public async $$save() {
        throw new ApiError(ApiResultCode.MethodNotImplemented);
    }
    public async $$find(conditions: IQueryConditions): Promise<any> {
        throw new ApiError(ApiResultCode.MethodNotImplemented);
    }
    // #endregion
    protected assembleModel(modelInst: IModel, keysOfSchema: string[]): void {
        keysOfSchema.forEach((item: string) => {
            if (this[item] != null) {
                modelInst[item] = this[item];
            }
        });
    }
}
