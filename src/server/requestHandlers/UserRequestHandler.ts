import { CommonUtils } from 'common/CommonUtils';
import { IQueryConditions } from 'common/IQueryConditions';
import { UserBasicInfoEditParam } from 'common/requestParams/UserBasicInfoEditParam';
import { UserCheckParam } from 'common/requestParams/UserCheckParam';
import { UserPasswordEditParam } from 'common/requestParams/UserPasswordEditParam';
import { UserRemoveParam } from 'common/requestParams/UserRemoveParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { IdentityState } from 'common/responseResults/IdentityState';
import { LogoState } from 'common/responseResults/LogoState';
import { QualificationState } from 'common/responseResults/QualificationState';
import { keysOfIUserView, UserView } from 'common/responseResults/UserView';
import { UserState } from 'common/UserState';
import { ApiError } from 'server/common/ApiError';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { UserModelWrapper } from '../dataModels/UserModelWrapper';
import { UserObject } from '../dataObjects/UserObject';
import { UserNotificationObject } from 'server/dataObjects/UserNotificationObject';
import { UserNotificationModelWrapper } from 'server/dataModels/UserNotificationModelWrapper';
import { NotificationRequestHandler } from './NotificationRequestHandler';
import { NotificationType } from 'common/NotificationType';

export class UserRequestHandler {

    public static async $$find(conditions: IQueryConditions): Promise<UserView[]> {
        const dbObjs: UserObject[] = await UserModelWrapper.$$find(conditions) as UserObject[];
        const views: UserView[] = [];
        if (dbObjs != null && dbObjs.length > 0) {
            for (const obj of dbObjs) {
                views.push(await this.$$convertToDBView(obj));
            }
        }
        return views;
    }

    public static async $$basicInfoEdit(
        reqParam: UserBasicInfoEditParam, currentUser: UserObject): Promise<UserView> {
        let hasDataUpdate: boolean = false;
        const updatedProps: UserObject = {} as UserObject;

        // only the following props can be updated
        if (reqParam.nickName != null) {
            updatedProps.nickName = reqParam.nickName;
            hasDataUpdate = true;
        }
        if (!CommonUtils.isNullOrEmpty(reqParam.name)) {
            updatedProps.name = reqParam.name;
            hasDataUpdate = true;
        }
        if (!CommonUtils.isNullOrEmpty(reqParam.email)) {
            updatedProps.email = reqParam.email;
            hasDataUpdate = true;
        }
        if (!CommonUtils.isNullOrEmpty(reqParam.telephone)) {
            updatedProps.telephone = reqParam.telephone;

            hasDataUpdate = true;
        }

        if (!CommonUtils.isNullOrEmpty(reqParam.realName)) {
            updatedProps.realName = reqParam.realName;
            hasDataUpdate = true;
        }
        if (!CommonUtils.isNullOrEmpty(reqParam.address)) {
            updatedProps.address = reqParam.address;
            hasDataUpdate = true;
        }
        if (!CommonUtils.isNullOrEmpty(reqParam.description)) {
            updatedProps.description = reqParam.description;
            hasDataUpdate = true;
        }
        if (!CommonUtils.isNullOrEmpty(reqParam.identityNumber)) {
            updatedProps.identityNumber = reqParam.identityNumber;
            hasDataUpdate = true;
        }
        if (!CommonUtils.isNullOrEmpty(reqParam.sex)) {
            updatedProps.sex = reqParam.sex;
            hasDataUpdate = true;
        }

        if (hasDataUpdate) {
            await UserModelWrapper.$$updateOne({ uid: currentUser.uid } as UserObject, updatedProps);
            Object.assign(currentUser, updatedProps);
        }
        return await this.$$convertToDBView(currentUser);
    }

    public static async $$passwordEdit(
        reqParam: UserPasswordEditParam, currentUser: UserObject): Promise<void> {
        if (reqParam.oldPassword !== currentUser.password) {
            throw new ApiError(ApiResultCode.InputInvalidPassword);
        }
        const dbObj: UserObject = { password: reqParam.newPassword } as UserObject;

        await UserModelWrapper.$$updateOne({ uid: currentUser.uid } as UserObject, dbObj);
    }

    public static async $$remove(reqParam: UserRemoveParam, currentUser: UserObject): Promise<UserView | null> {
        if (reqParam == null || CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserRemoveParam or UserRemoveParam.uid should not be null');
        }
        // cannot delete default user admin
        if (reqParam.uid === UserModelWrapper.adminUID) {
            throw new ApiError(ApiResultCode.AuthForbidden, 'cannot remove default admin');
        }
        // only admin can remove user
        if (!CommonUtils.isAdmin(currentUser.roles)) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        const dbObj: UserObject = await UserModelWrapper.$$findeOneAndDelete(
            { uid: reqParam.uid } as UserObject) as UserObject;
        if (dbObj != null) {
            return await this.$$convertToDBView(dbObj);
        } else {
            return null;
        }
    }

    public static async $$check(reqParam: UserCheckParam, currentUser: UserObject): Promise<UserView> {
        // only admin can check user register
        if (!CommonUtils.isAdmin(currentUser.roles)) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        if (reqParam == null ||
            CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCheckParam, UserCheckParam.uid');
        }
        const dbObj: UserObject = await UserModelWrapper.$$findOne({ uid: reqParam.uid } as UserObject) as UserObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `UserId:${reqParam.uid}`);
        }
        const updatedProps: UserObject = {};
        const notifications: UserNotificationObject[] = [];
        if (reqParam.qualitificationState != null) {
            if (reqParam.qualitificationState === QualificationState.FailedToCheck) {
                updatedProps.qualificationState = QualificationState.FailedToCheck;
                notifications.push(
                    NotificationRequestHandler.createNotificationObject(
                        NotificationType.UserQualificationCheckFailure,
                        dbObj.uid as string,
                        dbObj.qualificationUid as string,
                        reqParam.noteForQualification)
                );

            } else if (reqParam.qualitificationState === QualificationState.Checked) {
                updatedProps.qualificationState = QualificationState.Checked;
                notifications.push(
                    NotificationRequestHandler.createNotificationObject(
                        NotificationType.UserQualificationCheckPass,
                        dbObj.uid as string,
                        dbObj.qualificationUid as string,
                        reqParam.noteForQualification)
                );
            }
        }
        if (reqParam.backIdState != null) {
            if (reqParam.backIdState === IdentityState.FailedToCheck) {
                updatedProps.backIdState = IdentityState.FailedToCheck;
                notifications.push(
                    NotificationRequestHandler.createNotificationObject(
                        NotificationType.UserIdCheckFailure,
                        dbObj.uid as string,
                        dbObj.backIdUid as string,
                        reqParam.noteForBackId)
                );
            } else if (reqParam.backIdState === IdentityState.Checked) {
                updatedProps.backIdState = IdentityState.Checked;
                notifications.push(
                    NotificationRequestHandler.createNotificationObject(
                        NotificationType.UserIdCheckPass,
                        dbObj.uid as string,
                        dbObj.backIdUid as string,
                        reqParam.noteForBackId)
                );
            }
        }
        if (reqParam.frontIdState != null) {
            if (reqParam.frontIdState === IdentityState.FailedToCheck) {
                updatedProps.frontIdState = IdentityState.FailedToCheck;
                notifications.push(
                    NotificationRequestHandler.createNotificationObject(
                        NotificationType.UserIdCheckFailure,
                        dbObj.uid as string,
                        dbObj.frontIdUid as string,
                        reqParam.noteForFrontId)
                );
            } else if (reqParam.frontIdState === IdentityState.Checked) {
                updatedProps.frontIdState = IdentityState.Checked;
                notifications.push(
                    NotificationRequestHandler.createNotificationObject(
                        NotificationType.UserIdCheckPass,
                        dbObj.uid as string,
                        dbObj.frontIdUid as string,
                        reqParam.noteForFrontId)
                );
            }
        }
        if (reqParam.logoState != null) {
            if (reqParam.logoState === LogoState.FailedToCheck) {
                updatedProps.logoState = LogoState.FailedToCheck;
                notifications.push(
                    NotificationRequestHandler.createNotificationObject(
                        NotificationType.UserLogoCheckFailure,
                        dbObj.uid as string,
                        dbObj.logoUid as string,
                        reqParam.noteForLogo)
                );
            } else if (reqParam.logoState === LogoState.Checked) {
                updatedProps.logoState = LogoState.Checked;
                notifications.push(
                    NotificationRequestHandler.createNotificationObject(
                        NotificationType.UserLogoCheckPass,
                        dbObj.uid as string,
                        dbObj.logoUid as string,
                        reqParam.noteForLogo)
                );
            }
        }
        if (Object.keys(updatedProps).length > 0) {
            await UserModelWrapper.$$updateOne({ uid: dbObj.uid } as UserObject, updatedProps);
            Object.assign(dbObj, updatedProps);
        }
        for (const item of notifications) {
            await UserNotificationModelWrapper.$$create(item);
        }
        return await this.$$convertToDBView(dbObj);
    }

    public static async $$enableOrDisable(
        uid: string | undefined,
        state: UserState.Disabled | UserState.Enabled,
        currentUser: UserObject): Promise<UserView> {
        // only admin can check user register
        if (!CommonUtils.isAdmin(currentUser.roles)) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        if (CommonUtils.isNullOrEmpty(uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'uid should not be null');
        }
        const dbObj: UserObject = await UserModelWrapper.$$findOne({ uid } as UserObject) as UserObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `UserId:${uid}`);
        }
        dbObj.state = state;
        await UserModelWrapper.$$updateOne({ uid: dbObj.uid } as UserObject, { state } as UserObject);
        return await this.$$convertToDBView(dbObj);
    }

    public static async $$convertToDBView(dbObj: UserObject): Promise<UserView> {
        const view: UserView = new UserView();
        keysOfIUserView.forEach((key: string) => {
            if (key in dbObj) {
                view[key] = dbObj[key];
            } else {
                LoggerManager.warn('missed Key in UserObjects:', key);
            }

        });
        return view;
    }
}
