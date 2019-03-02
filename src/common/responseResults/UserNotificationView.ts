import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { UserNotificationCommon } from 'common/commonDataObjects/UserNotificationCommon';

export class UserNotificationView extends UserNotificationCommon {

    constructor(withFullProps?: boolean) {
        super(withFullProps);
    }
}

export const keysOfUserNotificationView: string[] = getPropKeys(new UserNotificationView(true));
