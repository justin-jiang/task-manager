import { CommonUtils } from 'common/CommonUtils';
import { IRequestParam } from 'common/requestParams/IRequestParam';

export interface IDBObject {
    uid: string;
    createTime: number;
    // todo
    // $$save?(): any;
    // $$find?(conditions: IQueryConditions): any;
}

export class DBObject implements IDBObject {
    [key: string]: any;
    public uid: string;
    public createTime: number;
    constructor() {
        this.uid = CommonUtils.getUUIDForMongoDB();
        this.createTime = Date.now();
    }

    public assembleFromReqParam(reqParam: IRequestParam): void {
        const keysOfDBObject: string[] = this.getKeysOfDBObject();
        keysOfDBObject.forEach((item: string) => {
            if (reqParam[item] != null) {
                this[item] = reqParam[item];
            }
        });
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfIDBObject;
    }

}

export const keysOfIDBObject: string[] = CommonUtils.getPropKeys(new DBObject());
