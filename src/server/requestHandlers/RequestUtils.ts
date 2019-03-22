import { CommonUtils } from 'common/CommonUtils';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskState } from 'common/TaskState';
import { Request } from 'express';
import { ApiError } from 'server/common/ApiError';
import { TaskModelWrapper } from 'server/dataModels/TaskModelWrapper';
import { UserModelWrapper } from 'server/dataModels/UserModelWrapper';
import { TaskObject } from 'server/dataObjects/TaskObject';
import { UserObject } from 'server/dataObjects/UserObject';
import { CookieUtils, ILoginUserInfoInCookie } from 'server/expresses/CookieUtils';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';

export class RequestUtils {
    /**
     * according the param model to pick up the matched props from client request
     */
    public static pickUpKeysByModel(reqParam: any, paramModel: any): any {
        if (reqParam == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'reqParam');
        }
        if (paramModel == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'paramModel');
        }
        const result: any = {};
        const paramKeys = Object.keys(reqParam);
        const modelKeys = Object.keys(paramModel);
        paramKeys.forEach((key) => {
            if (modelKeys.includes(key)) {
                result[key] = reqParam[key];
            } else {
                LoggerManager.warn(`unexpected prop:${key} from client`);
            }
        });
        return result;
    }

    // #region -- user related
    public static readyPublisherCheck(currentUser: UserObject): void {
        if (!CommonUtils.isReadyPublisher(currentUser)) {
            throw new ApiError(ApiResultCode.AuthForbidden, 'Not Ready Publisher');
        }
    }
    public static readyExecutorCheck(currentUser: UserObject): void {
        if (!CommonUtils.isReadyExecutor(currentUser)) {
            throw new ApiError(ApiResultCode.AuthForbidden, 'Not Ready Publisher');
        }
    }
    public static adminCheck(currentUser: UserObject): void {
        if (!CommonUtils.isAdmin(currentUser)) {
            throw new ApiError(ApiResultCode.AuthForbidden, `User(${currentUser.name}) is not admin`);
        }
    }

    public static async $$getCurrentUser(req: Request): Promise<UserObject> {
        const loginUserInCookie: ILoginUserInfoInCookie =
            CookieUtils.getUserFromCookie(req) as ILoginUserInfoInCookie;
        // TODO: consider to use cache
        const dbUsers: UserObject[] = await UserModelWrapper.$$find(
            { uid: loginUserInCookie.uid } as UserObject) as UserObject[];
        if (dbUsers == null || dbUsers.length === 0) {
            throw new ApiError(ApiResultCode.DbNotFound, `UserID:${loginUserInCookie.uid}`);
        }
        return dbUsers[0];
    }
    // #endregion

    // #region -- task related
    public static async $$taskStateCheck(uid: string, expectedState: TaskState): Promise<TaskObject> {
        const dbObj: TaskObject | null = await TaskModelWrapper.$$findOne(
            { uid } as TaskObject) as TaskObject | null;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `TaskId:${uid}`);
        }

        if (expectedState != null && dbObj.state !== expectedState) {
            throw new ApiError(ApiResultCode.AuthForbidden,
                `Task:${dbObj.uid} state:${dbObj.state} is not expected one:${expectedState}`);
        }
        return dbObj;
    }
    // #endregion

}
