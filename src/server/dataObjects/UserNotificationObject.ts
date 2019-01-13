import { CommonUtils } from 'common/CommonUtils';
import { NotificationState } from 'common/NotificationState';
import { NotificationType } from 'common/NotificationType';
import { DBObject } from 'server/dataObjects/DBObject';

export class UserNotificationObject extends DBObject {
    [key: string]: any;
    public targetUserUid?: string;
    public targetObjectUid?: string;
    public type?: NotificationType;
    public title?: string;
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
            this.title = '';
            this.type = NotificationType.None;
        }
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfIDBObject;
    }
}
export const keysOfIDBObject: string[] = CommonUtils.getPropKeys(new UserNotificationObject(true));
