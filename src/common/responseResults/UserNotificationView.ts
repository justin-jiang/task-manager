import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { NotificationState } from 'common/NotificationState';
import { NotificationType } from 'common/NotificationType';
import { DBObjectView } from './DBObjectView';

export class UserNotificationView extends DBObjectView {
    public targetUserUid?: string;
    public targetObjectUid?: string;
    public type?: NotificationType;
    public title?: string;
    public content?: string;
    public state?: NotificationState;
    public optionData?: any;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps) {
            this.content = '';
            this.optionData = '';
            this.state = NotificationState.None;
            this.targetObjectUid = '';
            this.targetUserUid = '';
            this.title = '';
            this.type = NotificationType.None;
        }
    }
}

export const keysOfITemplateView: string[] = getPropKeys(new UserNotificationView(true));
