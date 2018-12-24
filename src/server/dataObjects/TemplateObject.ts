import { CommonUtils } from 'common/CommonUtils';
import { DBObject, IDBObject } from './DBObject';
export interface ITemplateObject extends IDBObject {
    name: string;
    version: number;
    note: string;
    templateFileId: string;
}

export class TemplateObject extends DBObject implements ITemplateObject {
    [key: string]: any;
    public name: string;
    public version: number;
    public note: string;
    public templateFileId: string;
    constructor() {
        super();
        this.name = '';
        this.version = -1;
        this.note = '';
        this.templateFileId = '';
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfITemplateObject;
    }
}
export const keysOfITemplateObject: string[] = CommonUtils.getPropKeys(new TemplateObject());
