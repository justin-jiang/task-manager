import { CommonUtils } from 'common/CommonUtils';

export interface IDBObject {
    uid?: string;
    createTime?: number;
    // todo
    // $$save?(): any;
    // $$find?(conditions: IQueryConditions): any;
}

export class DBObject implements IDBObject {
    [key: string]: any;
    public uid?: string;
    public createTime?: number;
    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.uid = '';
            this.createTime = 0;
        }
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfIDBObject;
    }

}
export const keysOfIDBObject: string[] = CommonUtils.getPropKeys(new DBObject(true));
