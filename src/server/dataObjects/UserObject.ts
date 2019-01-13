import { CommonUser } from 'common/commonDataObjects/CommonUser';
import { CommonUtils } from 'common/CommonUtils';
export class UserObject extends CommonUser {
    constructor(withFullProps?: boolean) {
        super(withFullProps);
    }
}

export const keysOfIUserObject: string[] = CommonUtils.getPropKeys(new UserObject(true));
