import { IDBObject } from './IDBObject';
export interface ITemplateObject extends IDBObject {
    name?: string;
    note?: string;
    templateFileId?: string;
}
