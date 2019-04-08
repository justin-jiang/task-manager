import { SessionCreateParam } from 'common/requestParams/SessionCreateParam';
import { UserView } from 'common/responseResults/UserView';
import { Response } from 'express';
import { CookieUtils, ILoginUserInfoInCookie } from 'server/expresses/CookieUtils';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { UserModelWrapper } from '../dataModels/UserModelWrapper';
import { keysOfUserObject, UserObject } from '../dataObjects/UserObject';

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
                    return await this.$$convertToDBView(userObjs[0]);
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
                return await this.$$convertToDBView(userObjs[0]);
            } else {
                LoggerManager.error(`Too many duplicated userids:${uid}`);
            }
        } else {
            LoggerManager.error(`userid:${uid} not found`);
        }
        return undefined;
    }

    public static async  $$convertToDBView(dbObj: UserObject): Promise<UserView> {
        const view: UserView = new UserView();
        keysOfUserObject.forEach((key: string) => {
            if (key in dbObj) {
                view[key] = dbObj[key];
            }
        });
        return view;
    }
}
