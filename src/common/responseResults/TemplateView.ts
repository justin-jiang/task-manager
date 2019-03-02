import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { TemplateCommon } from 'common/commonDataObjects/TemplateCommon';

export class TemplateView extends TemplateCommon {
    constructor(withFullProps?: boolean) {
        super(withFullProps);
    }
}

export const keysOfITemplateView: string[] = getPropKeys(new TemplateView(true));
