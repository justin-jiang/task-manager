import { Request, Response } from 'express';
export interface ILoginUserInfoInCookie {
    uid?: string;
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

    public static setUserToCookie(res: Response, cookie?: ILoginUserInfoInCookie): void {
        const headerValue = res.getHeader('set-cookie');
        if (headerValue != null) {
            res.removeHeader('set-cookie');
        }
        if (cookie != null) {
            res.cookie(this.cookieNameForUserInfo,
                cookie,
                { signed: true, maxAge: 1 * 24 * 3600 * 1000 /*milliSeconds*/ });
        } else {
            res.clearCookie(this.cookieNameForUserInfo);
        }
    }
}

