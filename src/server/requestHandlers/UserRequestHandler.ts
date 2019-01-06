import { CommonUtils } from 'common/CommonUtils';
import { IQueryConditions } from 'common/IQueryConditions';
import { UserBasicInfoEditParam } from 'common/requestParams/UserBasicInfoEditParam';
import { UserCheckParam } from 'common/requestParams/UserCheckParam';
import { UserPasswordEditParam } from 'common/requestParams/UserPasswordEditParam';
import { UserRemoveParam } from 'common/requestParams/UserRemoveParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { keysOfIUserView, UserView } from 'common/responseResults/UserView';
import { UserState } from 'common/UserState';
import { ApiError } from 'server/common/ApiError';
import { FileStorage, IFileMetaData } from 'server/dbDrivers/mongoDB/FileStorage';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { UserModelWrapper } from '../dataModels/UserModelWrapper';
import { UserObject } from '../dataObjects/UserObject';
import { FileType } from 'common/FileType';
import { LogoState } from 'common/responseResults/LogoState';
import { QualificationState } from 'common/responseResults/QualificationState';

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
        const dbObj: UserObject = {} as UserObject;

        // only the following props can be updated
        if (reqParam.nickName != null) {
            dbObj.nickName = reqParam.nickName;
            currentUser.nickName = reqParam.nickName;
            hasDataUpdate = true;
        }
        if (!CommonUtils.isNullOrEmpty(reqParam.name)) {
            dbObj.name = reqParam.name;
            currentUser.name = reqParam.name;
            hasDataUpdate = true;
        }
        if (!CommonUtils.isNullOrEmpty(reqParam.email)) {
            dbObj.email = reqParam.email;
            currentUser.email = reqParam.email;
            currentUser.email = reqParam.email;
            hasDataUpdate = true;
        }
        if (!CommonUtils.isNullOrEmpty(reqParam.telephone)) {
            dbObj.telephone = reqParam.telephone;
            currentUser.telephone = reqParam.telephone;
            hasDataUpdate = true;
        }
        if (hasDataUpdate) {
            await UserModelWrapper.$$updateOne({ uid: currentUser.uid } as UserObject, dbObj);
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
            CommonUtils.isNullOrEmpty(reqParam.uid) ||
            reqParam.pass == null ||
            reqParam.type == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCheckParam, UserCheckParam.uid, UserCheckParam.type or UserCheckParam.pass should not be null');
        }
        const dbObj: UserObject = await UserModelWrapper.$$findOne({ uid: reqParam.uid } as UserObject) as UserObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `UserId:${reqParam.uid}`);
        }
        if (reqParam.type === FileType.UserLogo) {
            if (reqParam.pass === true) {
                dbObj.logoState = LogoState.Checked;
            } else {
                dbObj.logoState = LogoState.FailedToCheck;
            }
            await FileStorage.$$updateEntryMeta(`${currentUser.logoId}_0`, { checked: reqParam.pass } as IFileMetaData);
            await UserModelWrapper.$$updateOne(
                { uid: dbObj.uid } as UserObject, { logoState: dbObj.logoState } as UserObject);
        } else if (reqParam.type === FileType.Qualification) {
            if (reqParam.pass === true) {
                dbObj.qualificationState = QualificationState.Checked;
            } else {
                dbObj.qualificationState = QualificationState.FailedToCheck;
            }
            await FileStorage.$$updateEntryMeta(
                `${currentUser.qualificationId}_${currentUser.qualificationVersion}`,
                { checked: reqParam.pass } as IFileMetaData);
            await UserModelWrapper.$$updateOne(
                { uid: dbObj.uid } as UserObject, { qualificationState: dbObj.qualificationState } as UserObject);
        } else {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'UserCheckParam.type');
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
