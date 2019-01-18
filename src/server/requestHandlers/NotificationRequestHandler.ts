import { UserNotificationView } from 'common/responseResults/UserNotificationView';
import { UserNotificationModelWrapper } from 'server/dataModels/UserNotificationModelWrapper';
import { keysOfIDBObject, UserNotificationObject } from 'server/dataObjects/UserNotificationObject';
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

    public static async $$read(reqParam: NotificationReadParam, currentUser: UserObject): Promise<UserNotificationView | null> {
        const dbObj: UserNotificationObject = await UserNotificationModelWrapper.$$findOneAndUpdate(
            { uid: reqParam.uid } as UserNotificationObject, { state: NotificationState.Read } as UserNotificationObject) as UserNotificationObject;
        if (dbObj != null) {
            return this.$$convertToDBView(dbObj);
        } else {
            return null;
        }
    }

    public static async  $$convertToDBView(dbObj: UserNotificationObject): Promise<UserNotificationView> {
        const view: UserNotificationView = new UserNotificationView();
        keysOfIDBObject.forEach((key: string) => {
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

        switch (type) {
            case NotificationType.TaskApply:
                notification.title = '任务申请';
                break;
            case NotificationType.TaskApplyAccepted:
                notification.title = '任务申请通过';
                break;
            case NotificationType.TaskApplyDenied:
                notification.title = '任务申请被拒绝';
                break;
            case NotificationType.TaskAuditAccepted:
                notification.title = '任务申请已通过平台审核并提交给发布者';
                break;
            case NotificationType.TaskAuditDenied:
                notification.title = '任务申请没有通过平台审核';
                break;
            case NotificationType.TaskResultAccepted:
                notification.title = '任务结果审核通过';
                break;
            case NotificationType.TaskResultDenied:
                notification.title = '任务结果被拒绝';
                break;
            case NotificationType.FrontIdCheckFailure:
            case NotificationType.BackIdCheckFailure:
                notification.title = '用户身份审查被拒绝';
                break;
            case NotificationType.FrontIdCheckPass:
            case NotificationType.BackIdCheckPass:
                notification.title = '用户身份审查通过';
                break;
            case NotificationType.UserLogoCheckFailure:
                notification.title = '用户头像审查被拒绝';
                break;
            case NotificationType.UserLogoCheckPass:
                notification.title = '用户头像审查通过';
                break;
            case NotificationType.UserQualificationCheckFailure:
                notification.title = '资质文件审核被拒绝';
                break;
            case NotificationType.UserQualificationCheckPass:
                notification.title = '资质文件审核通过';
                break;
            default:
                notification.title = '消息';
        }
        notification.content = content || '';
        return notification;
    }
}
