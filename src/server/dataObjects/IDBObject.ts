import { IQueryConditions } from 'common/requestParams/IQueryConditions';

export interface IDBObject {
    [key: string]: any;
    uid: string;
    createTime: number;
    // todo
    $$save?(): any;
    $$find?(conditions: IQueryConditions): any;
}
