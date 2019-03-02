import { CommonObject, getPropKeys } from 'common/commonDataObjects/CommonObject';
import { NotificationState } from 'common/NotificationState';
import { NotificationType } from 'common/NotificationType';

export class UserNotificationCommon extends CommonObject {
    public targetUserUid?: string;
    public targetObjectUid?: string;
    public type?: NotificationType;
    public content?: string;
    public state?: NotificationState;
    public optionData?: any;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.content = '';
            this.optionData = '';
            this.state = NotificationState.None;
            this.targetObjectUid = '';
            this.targetUserUid = '';
            this.type = NotificationType.None;
        }
    }
}
export const keysOfUserNotificationCommon: string[] = getPropKeys(new UserNotificationCommon(true));
