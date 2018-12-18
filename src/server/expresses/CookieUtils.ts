import { Request } from 'express';
export interface ILoginUserInfoInCookie {
    id?: string;
    password?: string;
}
export class CookieUtils {
    private static readonly cookieNameForUserInfo: string = 'userInCookie';
    public static getUserFromCookie(req: Request): ILoginUserInfoInCookie | undefined {
        if ((req.signedCookies != null)) {
            return req.signedCookies[this.cookieNameForUserInfo] as ILoginUserInfoInCookie;
        } else {
            return undefined;
        }
    }
}

