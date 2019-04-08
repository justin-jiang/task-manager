import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { UserAccountInfoEditParam } from 'common/requestParams/UserAccountInfoEditParam';
import { UserBasicInfoEditParam } from 'common/requestParams/UserBasicInfoEditParam';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { UserIdCheckParam } from 'common/requestParams/UserIdCheckParam';
import { UserPasswordEditParam } from 'common/requestParams/UserPasswordEditParam';
import { UserPasswordResetParam } from 'common/requestParams/UserPasswordResetParam';
import { UserQualificationCheckParam } from 'common/requestParams/UserQualificationCheckParam';
import { UserRemoveParam } from 'common/requestParams/UserRemoveParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { keysOfIUserView, UserView } from 'common/responseResults/UserView';
import { UserState } from 'common/UserState';
import { ApiError } from 'server/common/ApiError';
import { AppStatus } from 'server/common/AppStatus';
import { EmailUtils, IMailContent } from 'server/common/EmailUtils';
import { UserModelWrapper } from '../dataModels/UserModelWrapper';
import { UserObject } from '../dataObjects/UserObject';
import { RequestUtils } from './RequestUtils';
import { UserPasswordRecoverParam } from 'common/requestParams/UserPasswordRecoverParam';
import { PasswordResetResult } from 'common/responseResults/PasswordResetResult';

export class UserRequestHandler {
    public static async $$query(currentUser: UserObject): Promise<UserView[]> {
        RequestUtils.adminCheck(currentUser);
        const dbObjs: UserObject[] = await UserModelWrapper.$$find(
            { uid: { $ne: UserModelWrapper.adminUID } }) as UserObject[];
        const views: UserView[] = [];
        if (dbObjs != null && dbObjs.length > 0) {
            for (const obj of dbObjs) {
                views.push(await this.$$convertToDBView(obj));
            }
        }
        return views;
    }

    public static async $$create(reqParam: UserCreateParam): Promise<UserView> {
        let dbObj: UserObject = new UserObject();
        if (CommonUtils.isNullOrEmpty(reqParam.name)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.name');
        }
        dbObj.name = reqParam.name;

        if (CommonUtils.isNullOrEmpty(reqParam.email)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.email');
        }
        dbObj.email = reqParam.email;

        if (CommonUtils.isNullOrEmpty(reqParam.password)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.password');
        }
        dbObj.password = reqParam.password;

        if (CommonUtils.isNullOrEmpty(reqParam.telephone)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.telephone');
        }
        dbObj.telephone = reqParam.telephone;

        if (reqParam.type == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.type');
        }
        dbObj.type = reqParam.type;

        dbObj.roles = reqParam.roles;
        if (!CommonUtils.isAdmin(dbObj) &&
            !CommonUtils.isExecutor(dbObj) &&
            !CommonUtils.isPublisher(dbObj)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.roles');
        }


        if (CommonUtils.isAdmin(dbObj)) {
            dbObj.uid = UserModelWrapper.adminUID;
        } else {
            dbObj.uid = CommonUtils.getUUIDForMongoDB();
        }
        dbObj.idState = CheckState.Missed;
        dbObj.qualificationState = CheckState.Missed;
        dbObj.state = UserState.Enabled;


        // if admin has been existing, the following sentence will throw dup error
        dbObj = await UserModelWrapper.$$create(dbObj) as UserObject;
        if (CommonUtils.isAdmin(dbObj)) {
            AppStatus.isSystemInitialized = true;
        }
        return await UserRequestHandler.$$convertToDBView(dbObj);
    }

    /**
     * the individual or corp related prop update which NEED admin audit
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$basicInfoEdit(
        reqParam: UserBasicInfoEditParam, currentUser: UserObject): Promise<UserView> {
        const updatedProps: UserObject = RequestUtils.pickUpPropsByModel(
            reqParam, new UserBasicInfoEditParam(true), true);
        const updatedKeys = Object.keys(updatedProps);
        if (updatedKeys.length > 0) {
            updatedProps.idState = CheckState.ToBeChecked;
            await UserModelWrapper.$$updateOne({ uid: currentUser.uid } as UserObject, updatedProps);
            Object.assign(currentUser, updatedProps);
        }
        return await this.$$convertToDBView(currentUser);
    }

    /**
     * the account related prop update which doesn't need admin audit
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$accountInfoEdit(
        reqParam: UserAccountInfoEditParam, currentUser: UserObject): Promise<UserView> {
        const updatedProps: UserObject = RequestUtils.pickUpPropsByModel(
            reqParam, new UserAccountInfoEditParam(true), true);
        const updatedKeys = Object.keys(updatedProps);
        if (updatedKeys.length > 0) {
            await UserModelWrapper.$$updateOne({ uid: currentUser.uid } as UserObject, updatedProps);
            Object.assign(currentUser, updatedProps);
        }
        return await this.$$convertToDBView(currentUser);
    }

    /**
     * password change by userself
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$passwordEdit(
        reqParam: UserPasswordEditParam, currentUser: UserObject): Promise<void> {
        if (reqParam.oldPassword !== currentUser.password) {
            throw new ApiError(ApiResultCode.InputInvalidPassword);
        }
        const dbObj: UserObject = { password: reqParam.newPassword } as UserObject;

        await UserModelWrapper.$$updateOne({ uid: currentUser.uid } as UserObject, dbObj);
    }

    /**
     * password reset by admin
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$passwordReset(
        reqParam: UserPasswordResetParam, currentUser: UserObject): Promise<PasswordResetResult> {
        RequestUtils.adminCheck(currentUser);
        const targetUser: UserObject = await RequestUtils.$$userExistenceCheck(reqParam.uid as string);

        const randomPassword = CommonUtils.getRandomString(6);

        const updatedProps: UserObject = {
            password: randomPassword,
        } as UserObject;
        await UserModelWrapper.$$updateOne({ uid: targetUser.uid } as UserObject, updatedProps);
        return { uid: targetUser.uid, password: randomPassword } as PasswordResetResult;
    }

    public static async $$passwordRecover(
        reqParam: UserPasswordRecoverParam): Promise<void> {
        const targetUser: UserObject = await UserModelWrapper.$$findOne(
            { name: reqParam.name } as UserObject) as UserObject;
        if (targetUser == null) {
            throw new ApiError(ApiResultCode.DbNotFound_User, `UserName:${reqParam.name}`);
        }

        const mailOptions: IMailContent = {
            to: 'public@khoodys.com',
            subject: `用户${targetUser.name}申请密码密码重置`,
            html: `用户${targetUser.name}申请密码密码重置，请通过系统的重置密码功能，完成用户密码的重置`,
        };

        // send mail with defined transport object
        await EmailUtils.sendEmail(mailOptions);
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
        RequestUtils.adminCheck(currentUser);
        const dbObj: UserObject = await UserModelWrapper.$$findeOneAndDelete(
            { uid: reqParam.uid } as UserObject) as UserObject;
        if (dbObj != null) {
            return await this.$$convertToDBView(dbObj);
        } else {
            return null;
        }
    }

    /**
     * user info or qualification check
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$check(
        reqParam: UserQualificationCheckParam | UserIdCheckParam, currentUser: UserObject): Promise<UserView> {
        // only admin can check user register
        RequestUtils.adminCheck(currentUser);
        reqParam = reqParam || {};
        if (CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, JSON.stringify(reqParam));
        }
        const dbObj: UserObject = await await RequestUtils.$$userExistenceCheck(reqParam.uid as string);
        let updatedProps: UserObject = {};
        if ((reqParam as UserIdCheckParam).idState != null) {
            updatedProps = RequestUtils.pickUpPropsByModel(reqParam, new UserIdCheckParam(true), true);
        } else {
            updatedProps = RequestUtils.pickUpPropsByModel(reqParam, new UserQualificationCheckParam(true), true);
        }

        if (Object.keys(updatedProps).length > 0) {
            await UserModelWrapper.$$updateOne({ uid: dbObj.uid } as UserObject, updatedProps);
            Object.assign(dbObj, updatedProps);
        }
        return await this.$$convertToDBView(dbObj);
    }

    public static async $$enableOrDisable(
        uid: string | undefined,
        state: UserState.Disabled | UserState.Enabled,
        currentUser: UserObject): Promise<UserView> {
        // only admin can check user register
        if (!CommonUtils.isAdmin(currentUser)) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        if (CommonUtils.isNullOrEmpty(uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'uid should not be null');
        }
        const dbObj: UserObject = await await RequestUtils.$$userExistenceCheck(uid as string);
        dbObj.state = state;
        await UserModelWrapper.$$updateOne({ uid: dbObj.uid } as UserObject, { state } as UserObject);
        return await this.$$convertToDBView(dbObj);
    }

    public static async $$convertToDBView(dbObj: UserObject): Promise<UserView> {
        const view: UserView = new UserView();
        keysOfIUserView.forEach((key: string) => {
            if (key in dbObj) {
                view[key] = dbObj[key];
            }
        });
        return view;
    }
}
