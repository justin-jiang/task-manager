import { CommonUtils } from 'common/CommonUtils';
import { DBObject } from 'server/dataObjects/DBObject';

export class TemplateObject extends DBObject {
    [key: string]: any;
    public name?: string;
    public version?: number;
    public note?: string;
    public templateFileUid?: string;
    public ownerUid?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.name = '';
            this.note = '';
            this.templateFileUid = '';
            this.version = -1;
            this.ownerUid = '';
        }
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfITemplateObject;
    }
}

export const keysOfITemplateObject: string[] = CommonUtils.getPropKeys(new TemplateObject(true));
