import { CommonUtils } from 'common/CommonUtils';
import { DBObject } from 'server/dataObjects/DBObject';

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

    public assembleFromDBObject(dbObj: DBObject): void {
        const keysOfDBView: string[] = this.getKeysOfDBView();
        keysOfDBView.forEach((item: string) => {
            if (dbObj[item] != null) {
                this[item] = dbObj[item];
            }
        });
    }

    protected getKeysOfDBView(): string[] {
        return keysOfIDBView;
    }
}

export const keysOfIDBView: string[] = CommonUtils.getPropKeys(new DBObjectView(true));
