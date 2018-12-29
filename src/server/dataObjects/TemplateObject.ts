import { CommonUtils } from 'common/CommonUtils';
import { DBObject, IDBObject } from './DBObject';
interface ITemplateObject extends IDBObject {
    name?: string;
    version?: number;
    note?: string;
    templateFileId?: string;
}

export class TemplateObject extends DBObject implements ITemplateObject {
    [key: string]: any;
    public name?: string;
    public version?: number;
    public note?: string;
    public templateFileId?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.name = '';
            this.note = '';
            this.templateFileId = '';
            this.version = -1;
        }
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfITemplateObject;
    }
}

export const keysOfITemplateObject: string[] = CommonUtils.getPropKeys(new TemplateObject(true));
