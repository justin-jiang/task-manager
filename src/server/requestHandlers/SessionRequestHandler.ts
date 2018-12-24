import { SessionCreateParam } from 'common/requestParams/SessionCreateParam';
import { UserView } from 'common/responseResults/UserView';
import { Response } from 'express';
import { CookieUtils, ILoginUserInfoInCookie } from 'server/expresses/CookieUtils';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { UserModelWrapper } from '../dataModels/UserModelWrapper';
import { UserObject } from '../dataObjects/UserObject';

export class SessionRequestHandler {
    /**
     * Login Scenario
     * @param user 
     */
    public static async $$sessionCreate(reqParam: SessionCreateParam, res: Response): Promise<UserView | undefined> {
        const userObjs: UserObject[] = await UserModelWrapper.$$find(
            { name: reqParam.name } as SessionCreateParam) as UserObject[];
        if (userObjs != null && userObjs.length > 0) {
            if (userObjs.length === 1) {
                if (userObjs[0].password === reqParam.password) {
                    const cookieData: ILoginUserInfoInCookie = {
                        uid: userObjs[0].uid,
                        password: userObjs[0].password,
                    };
                    CookieUtils.setUserToCookie(res, cookieData);
                    const view: UserView = new UserView();
                    view.assembleFromDBObject(userObjs[0]);
                    return view;
                } else {
                    LoggerManager.error(`user:${reqParam.name} password not matched`);
                }
            } else {
                LoggerManager.error(`Too many duplicated users:${reqParam.name}`);
            }

        } else {
            LoggerManager.error(`user:${reqParam.name} not found`);
        }
        return undefined;
    }

    public static async $$sessionQuery(uid: string): Promise<UserView | undefined> {
        const userObjs: UserObject[] = await UserModelWrapper.$$find({ uid } as UserObject) as UserObject[];
        if (userObjs != null && userObjs.length > 0) {
            if (userObjs.length === 1) {
                const view: UserView = new UserView();
                view.assembleFromDBObject(userObjs[0]);
                return view;
            } else {
                LoggerManager.error(`Too many duplicated userids:${uid}`);
            }
        } else {
            LoggerManager.error(`userid:${uid} not found`);
        }
        return undefined;
    }
}
