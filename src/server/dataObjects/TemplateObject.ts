import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { TemplateCommon } from 'common/commonDataObjects/TemplateCommon';

export class TemplateObject extends TemplateCommon {
    constructor(withFullProps?: boolean) {
        super(withFullProps);
    }
}

export const keysOfTemplateObject: string[] = getPropKeys(new TemplateObject(true));
