import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { NextFunction, Request, Response, Router } from 'express';
import * as multer from 'multer';
import { ApiError } from 'server/common/ApiError';
import { AppStatus } from 'server/common/AppStatus';
import { GlobalCache } from 'server/common/GlobalCache';
import { UserModelWrapper } from 'server/dataModels/UserModelWrapper';
import { UserObject } from 'server/dataObjects/UserObject';
import { CookieUtils, ILoginUserInfoInCookie } from 'server/expresses/CookieUtils';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { ApiRouter } from '../ApiRouter';
import { HttpPathItem } from 'common/HttpPathItem';
import { HttpUploadKey } from 'common/HttpUploadKey';


export enum UploadType {
    NONE = 0,
    File = 1,
}

export interface IApiHandlers {
    all?: (req: Request, res: Response, next: NextFunction) => void;
    post?: (req: Request, res: Response, next: NextFunction) => void;
    put?: (req: Request, res: Response, next: NextFunction) => void;
    get?: (req: Request, res: Response, next: NextFunction) => void;
    delete?: (req: Request, res: Response, next: NextFunction) => void;
}

export class ApiBuilder {
    protected apiRooter: ApiRouter;

    constructor(apiRouter: ApiRouter) {
        this.apiRooter = apiRouter;
    }

    public buildApiForPath(path: string, handlers: IApiHandlers, uploadType?: UploadType) {
        const exPressRouter: Router = this.apiRooter.getExpRouter();
        if (uploadType === UploadType.File) {
            const upload: multer.Instance = (multer as any)();
            exPressRouter.route(path).post(upload.single(HttpUploadKey.File));
        }

        exPressRouter.route(path)
            .all((req: Request, res: Response, next: NextFunction) => {
                (async () => {
                    if (handlers.all) {
                        LoggerManager.error('Request.all cannot be overridden');
                    }
                    await this.all(req, res, next);
                })().catch((error: ApiError) => {
                    this.handleError(req, res, error);
                });
            })
            .get((req: Request, res: Response, next: NextFunction) => {
                (async () => {
                    if (handlers.get) {
                        await handlers.get.call(this, req, res, next);
                    } else {
                        throw new ApiError(ApiResultCode.ApiNotImplemented);
                    }
                })().catch((error: ApiError) => {
                    this.handleError(req, res, error);
                });
            })
            .put((req: Request, res: Response, next: NextFunction) => {
                (async () => {
                    if (handlers.put) {
                        await handlers.put.call(this, req, res, next);
                    } else {
                        throw new ApiError(ApiResultCode.ApiNotImplemented);
                    }
                })().catch((error: ApiError) => {
                    this.handleError(req, res, error);
                });
            })
            .delete((req: Request, res: Response, next: NextFunction) => {
                (async () => {
                    if (handlers.delete) {
                        await handlers.delete.call(this, req, res, next);
                    } else {
                        throw new ApiError(ApiResultCode.ApiNotImplemented);
                    }
                })().catch((error: ApiError) => {
                    this.handleError(req, res, error);
                });
            })
            .post((req: Request, res: Response, next: NextFunction) => {
                (async () => {
                    if (handlers) {
                        if (handlers.post) {
                            await handlers.post.call(this, req, res, next);
                        } else {
                            throw new ApiError(ApiResultCode.ApiNotImplemented);
                        }
                    } else {
                        throw new ApiError(ApiResultCode.ApiNotImplemented);
                    }
                })().catch((error: ApiError) => {
                    this.handleError(req, res, error);
                });
            });
    }

    protected async all(req: Request, res: Response, next: NextFunction) {
        LoggerManager.debug(`Request:${req.method} ${req.path}`, req.body);
        // set no cache for all API
        res.setHeader('Surrogate-Control', 'no-store');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        const loginUserInCookie: ILoginUserInfoInCookie | undefined = CookieUtils.getUserFromCookie(req);
        if (loginUserInCookie != null) {
            // cache cookie
            GlobalCache.set(loginUserInCookie.uid as string, loginUserInCookie);
        }

        //  we should check filePost api before isSystemInitialized, because the system initialize
        // depends on the filePost api(i.e. admin register)
        const filePostPattern = new RegExp(`^\/${HttpPathItem.Api}/${HttpPathItem.File}\/?$`, 'i');
        if (req.method === 'POST' && filePostPattern.test(req.path)) {
            const reqParam: FileUploadParam = req.body as FileUploadParam;
            // parameter transform, which has been converted to string by el-uploader component
            const scenario: FileAPIScenario = Number.parseInt(reqParam.scenario as any, 10);
            reqParam.scenario = scenario;
            if (reqParam.scenario === FileAPIScenario.UploadUser) {
                // only postuser(i.e. user register) does not need to login check
                next();
                return;
            }
        }

        // check whether system has been initialized
        if (AppStatus.isSystemInitialized !== true) {
            await UserModelWrapper.$$adminCheck();
        }
        if (AppStatus.isSystemInitialized !== true) {
            throw new ApiError(ApiResultCode.SystemNotInitialized);
        }
        // igore login request
        const sessionPostPattern = new RegExp(`^\/${HttpPathItem.Api}/${HttpPathItem.Session}\/?$`, 'i');
        if (req.method === 'POST' && sessionPostPattern.test(req.path)) {
            next();
            return;
        }
        // check if cookie is available
        if (await this.$$cookieChecking(loginUserInCookie) === false) {
            res.json({ code: ApiResultCode.AuthUnauthorized }).end();
        } else {
            CookieUtils.setUserToCookie(res, loginUserInCookie as ILoginUserInfoInCookie);
            next();
        }
    }

    protected async $$cookieChecking(loginUserInCookie: ILoginUserInfoInCookie | undefined): Promise<boolean> {
        // verify the login user is still valid and password is still valid
        if (loginUserInCookie != null) {
            const loginUserInDBs: UserObject[] = await UserModelWrapper.$$find(
                { uid: loginUserInCookie.uid } as UserObject) as UserObject[];
            if (loginUserInDBs != null && loginUserInDBs.length > 0) {
                if (loginUserInDBs.length === 1) {
                    if (loginUserInDBs[0].password === loginUserInCookie.password) {
                        return true;
                    } else {
                        LoggerManager.error(`uid:${loginUserInCookie.uid} password incorrect`);
                    }
                } else {
                    LoggerManager.error(`Too many duplicated uid:${loginUserInCookie.uid}`);
                }
            } else {
                LoggerManager.error(`uid:${loginUserInCookie.uid} not in DB`);
            }
        } else {
            LoggerManager.debug('No LoginUser in Cookie');
        }
        return false;
    }

    protected handleError(req: Request, res: Response, error: any, statusCode = 200) {
        let apiError: ApiError = error;
        if (!(error instanceof ApiError)) {
            apiError = ApiError.fromError(error);
        }

        LoggerManager.error('API Error:', apiError);
        res.json(apiError).end();
    }
}
