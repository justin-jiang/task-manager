import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { UserNotificationCommon } from 'common/commonDataObjects/UserNotificationCommon';

export class UserNotificationObject extends UserNotificationCommon {
    constructor(withFullProps?: boolean) {
        super(withFullProps);
    }
}
export const keysOfUserNotificationObject: string[] = getPropKeys(new UserNotificationObject(true));
