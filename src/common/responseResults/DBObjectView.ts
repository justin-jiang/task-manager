import { getPropKeys, CommonObject } from 'common/commonDataObjects/CommonObject';

export class DBObjectView extends CommonObject {
    constructor(withFullProps?: boolean) {
        super(withFullProps);
    }
}

export const keysOfDBObjectView: string[] = getPropKeys(new DBObjectView(true));
