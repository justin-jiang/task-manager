import { UserNotificationView } from 'common/responseResults/UserNotificationView';
import { UserNotificationModelWrapper } from 'server/dataModels/UserNotificationModelWrapper';
import { keysOfUserNotificationObject, UserNotificationObject } from 'server/dataObjects/UserNotificationObject';
import { UserObject } from '../dataObjects/UserObject';
import { CommonUtils } from 'common/CommonUtils';
import { NotificationType } from 'common/NotificationType';
import { NotificationState } from 'common/NotificationState';
import { NotificationReadParam } from 'common/requestParams/NotificationReadParam';

export class NotificationRequestHandler {
    /**
     * Login Scenario
     * @param user 
     */

    public static async $$query(currentUser: UserObject): Promise<UserNotificationView[] | undefined> {
        const dbObjs: UserNotificationObject[] = await UserNotificationModelWrapper.$$find(
            { targetUserUid: currentUser.uid } as UserNotificationObject) as UserNotificationObject[];
        const objViews: UserNotificationView[] = [];
        if (dbObjs != null && dbObjs.length > 0) {
            for (const item of dbObjs) {
                objViews.push(await this.$$convertToDBView(item));
            }
        }
        return objViews;
    }

    public static async $$read(
        reqParam: NotificationReadParam,
        currentUser: UserObject): Promise<UserNotificationView | null> {
        const dbObj: UserNotificationObject = await UserNotificationModelWrapper.$$findOneAndUpdate(
            { uid: reqParam.uid } as UserNotificationObject,
            { state: NotificationState.Read } as UserNotificationObject) as UserNotificationObject;
        if (dbObj != null) {
            return this.$$convertToDBView(dbObj);
        } else {
            return null;
        }
    }

    public static async  $$convertToDBView(dbObj: UserNotificationObject): Promise<UserNotificationView> {
        const view: UserNotificationView = new UserNotificationView();
        keysOfUserNotificationObject.forEach((key: string) => {
            if (key in dbObj) {
                view[key] = dbObj[key];
            }
        });
        return view;
    }

    public static createNotificationObject(
        type: NotificationType, targetUserUid: string, targetObjectUid: string, content?: string) {
        const notification: UserNotificationObject = new UserNotificationObject();
        notification.uid = CommonUtils.getUUIDForMongoDB();
        notification.state = NotificationState.Unread;
        notification.type = type;
        notification.targetUserUid = targetUserUid;
        notification.targetObjectUid = targetObjectUid;
        notification.content = content || '';
        return notification;
    }
}
