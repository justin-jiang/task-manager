import { getPropKeys } from 'common/commonDataObjects/CommonObject';

export interface IDBObjectView {

    uid?: string;
}

export class DBObjectView implements IDBObjectView {
    [key: string]: any;
    public uid?: string;
    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.uid = '';
        }
    }
}

export const keysOfIDBView: string[] = getPropKeys(new DBObjectView(true));
