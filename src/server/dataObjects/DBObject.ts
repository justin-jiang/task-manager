import { CommonObject, getPropKeys } from 'common/commonDataObjects/CommonObject';


export class DBObject extends CommonObject {

    constructor(withFullProps?: boolean) {
        super(withFullProps);
        
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfIDBObject;
    }

}
export const keysOfIDBObject: string[] = getPropKeys(new DBObject(true));
