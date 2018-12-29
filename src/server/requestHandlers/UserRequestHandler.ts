import { CommonUtils } from 'common/CommonUtils';
import { IQueryConditions } from 'common/IQueryConditions';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { UserEditParam } from 'common/requestParams/UserEditParam';
import { UserRemoveParam } from 'common/requestParams/UserRemoveParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { keysOfIUserView, UserView } from 'common/responseResults/UserView';
import { UserState } from 'common/UserState';
import { ApiError } from 'server/common/ApiError';
import { FileStorage, IFileMetaData } from 'server/dbDrivers/mongoDB/FileStorage';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { UserModelWrapper } from '../dataModels/UserModelWrapper';
import { UserObject } from '../dataObjects/UserObject';
import { UserCheckParam } from 'common/requestParams/UserCheckParam';

export class UserRequestHandler {
    // system can only has one admin with the following UID
    private static readonly adminUID: string = '68727e717a3c40b351b567ba0ae2c48f';
    public static async $$create(reqParam: UserCreateParam): Promise<UserView> {
        let dbObj: UserObject = new UserObject();
        if (CommonUtils.isNullOrEmpty(reqParam.name)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'UserCreateParam.name should not be null');
        }
        dbObj.name = reqParam.name;

        if (CommonUtils.isNullOrEmpty(reqParam.email)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'UserCreateParam.email should not be null');
        }
        dbObj.email = reqParam.email;

        if (CommonUtils.isNullOrEmpty(reqParam.password)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'UserCreateParam.password should not be null');
        }
        dbObj.password = reqParam.password;

        if (CommonUtils.isNullOrEmpty(reqParam.telephone)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'UserCreateParam.telephone should not be null');
        }
        dbObj.telephone = reqParam.telephone;

        if (reqParam.roles == null || reqParam.roles.length === 0) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'UserCreateParam.roles should not be null');
        }
        dbObj.roles = reqParam.roles;

        if (CommonUtils.isAdmin(dbObj.roles)) {
            dbObj.uid = this.adminUID;
        } else {
            dbObj.uid = CommonUtils.getUUIDForMongoDB();
        }
        dbObj.logoId = CommonUtils.getUUIDForMongoDB();
        // if admin has been existing, the following sentence will throw dup error
        dbObj = await UserModelWrapper.$$create(dbObj) as UserObject;
        const view: UserView = new UserView();
        view.assembleFromDBObject(dbObj);
        return view;
    }

    public static async $$find(conditions: IQueryConditions): Promise<UserView[]> {
        const dbObjs: UserObject[] = await UserModelWrapper.$$find(conditions) as UserObject[];
        const views: UserView[] = [];
        dbObjs.forEach((obj: UserObject) => {
            if (obj.uid === this.adminUID) {
                // ignore default admin
                return;
            }
            views.push(this.convertToDBView(obj));
        });
        return views;
    }

    public static async $$updateOne(reqParam: UserEditParam, currentUser: UserObject): Promise<void> {
        let hasDataUpdate: boolean = false;
        const dbObj: UserObject = {
            uid: reqParam.uid,
        } as UserObject;
        if (!CommonUtils.isNullOrEmpty(reqParam.nickName)) {
            dbObj.nick = reqParam.nickName;
            hasDataUpdate = true;
        }
        if (!CommonUtils.isNullOrEmpty(reqParam.state)) {
            dbObj.state = reqParam.state;
            hasDataUpdate = true;
        }
        if (hasDataUpdate) {
            await UserModelWrapper.$$updateOne({ uid: dbObj.uid } as UserObject, dbObj);
        }
        if (dbObj.state === UserState.Ready) {
            // set the user logo and qualification FileMetaData.checked as true
            await FileStorage.$$updateEntryMeta(`${currentUser.logoId}_0`, { checked: true } as IFileMetaData);
            await FileStorage.$$updateEntryMeta(
                `${currentUser.qualificationId}_${currentUser.qualificationVersion}`,
                { checked: true } as IFileMetaData);
        }
    }

    public static async $$remove(reqParam: UserRemoveParam, currentUser: UserObject): Promise<void> {
        if (reqParam == null || CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'UserRemoveParam or UserRemoveParam.uid should not be null');
        }
        // cannot delete default user admin
        if (reqParam.uid === this.adminUID) {
            throw new ApiError(ApiResultCode.Auth_Forbidden, 'cannot remove default admin');
        }
        // only admin can remove user
        if (!CommonUtils.isAdmin(currentUser.roles)) {
            throw new ApiError(ApiResultCode.Auth_Forbidden);
        }
        await UserModelWrapper.$$deleteOne({ uid: reqParam.uid } as UserObject);
    }

    public static async $$check(reqParam: UserCheckParam, currentUser: UserObject): Promise<UserView> {
        // only admin can check user register
        if (!CommonUtils.isAdmin(currentUser.roles)) {
            throw new ApiError(ApiResultCode.Auth_Forbidden);
        }
        if (reqParam == null ||
            CommonUtils.isNullOrEmpty(reqParam.uid) ||
            reqParam.pass == null) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'UserCheckParam, UserCheckParam.uid or UserCheckParam.pass should not be null');
        }
        const dbObj: UserObject = await UserModelWrapper.$$findOne({ uid: reqParam.uid } as UserObject) as UserObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DB_NOT_FOUND, `UserId:${reqParam.uid}`);
        }
        if (dbObj.state !== UserState.toBeChecked) {
            throw new ApiError(ApiResultCode.DB_Unexpected_User_State,
                `User.state - expected:${UserState.toBeChecked}, actual:${dbObj.state}`);
        }
        if (reqParam.pass === true) {
            dbObj.state = UserState.Ready;
        } else {
            dbObj.state = UserState.failedToCheck;
        }

        await UserModelWrapper.$$updateOne({ uid: dbObj.uid } as UserObject, { state: dbObj.state } as UserObject);
        return this.convertToDBView(dbObj);
    }

    private static convertToDBView(dbObj: UserObject): UserView {
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
