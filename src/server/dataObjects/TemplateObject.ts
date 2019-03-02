import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { TemplateCommon } from 'common/commonDataObjects/TemplateCommon';

export class TemplateObject extends TemplateCommon {
        constructor(withFullProps?: boolean) {
        super(withFullProps);
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfITemplateObject;
    }
}

export const keysOfITemplateObject: string[] = getPropKeys(new TemplateObject(true));
