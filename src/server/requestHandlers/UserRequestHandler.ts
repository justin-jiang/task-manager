import { CommonUtils } from 'common/CommonUtils';
import { IQueryConditions } from 'common/IQueryConditions';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { UserEditParam } from 'common/requestParams/UserEditParam';
import { keysOfIUserView, UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { UserModelWrapper } from '../dataModels/UserModelWrapper';
import { UserObject } from '../dataObjects/UserObject';
import { ApiError } from 'server/common/ApiError';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';

export class UserRequestHandler {
    // system can only has one admin with the following UID
    private static readonly adminUID: string = '68727e717a3c40b351b567ba0ae2c48f';
    public static async $$create(reqParam: UserCreateParam): Promise<UserView> {
        let userObj: UserObject = new UserObject();
        userObj.assembleFromReqParam(reqParam);
        if (userObj.roles.includes(UserRole.Admin)) {
            userObj.uid = this.adminUID;
        }
        userObj.logoId = CommonUtils.getUUIDForMongoDB();
        userObj = await UserModelWrapper.$$create(userObj) as UserObject;
        const userView: UserView = new UserView();
        userView.assembleFromDBObject(userObj);
        return userView;
    }

    public static async $$find(conditions: IQueryConditions): Promise<UserView[]> {
        const dbObjs: UserObject[] = await UserModelWrapper.$$find(conditions) as UserObject[];
        const views: UserView[] = [];
        dbObjs.forEach((obj: UserObject) => {
            if (obj.uid === this.adminUID) {
                // ignore default admin
                return;
            }
            views.push(this.convertToUserView(obj));
        });
        return views;
    }

    public static async $$updateOne(reqParam: UserEditParam): Promise<void> {
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
            UserModelWrapper.$$updateOne(dbObj);
        }
    }

    public static async $$deleteOne(uid: string): Promise<void> {
        // cannot delete default user admin
        if (uid === this.adminUID) {
            throw new ApiError(ApiResultCode.Forbidden, 'cannot remove default admin');
        }
        await UserModelWrapper.$$deleteOne(uid);
    }

    private static convertToUserView(dbObj: UserObject): UserView {
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
