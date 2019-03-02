import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { UserCommon } from 'common/commonDataObjects/UserCommon';
export class UserObject extends UserCommon {
    constructor(withFullProps?: boolean) {
        super(withFullProps);
    }
}

export const keysOfUserObject: string[] = getPropKeys(new UserObject(true));
