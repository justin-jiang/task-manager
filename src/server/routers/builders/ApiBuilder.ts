import { NextFunction, Request, Response, Router } from 'express';
import * as multer from 'multer';
import { ApiError } from 'server/common/ApiError';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { ApiRouter } from '../ApiRouter';
import { UPLOAD_TYPE_FILE } from 'common/Constants';
import { CookieUtils } from 'server/expresses/CookieUtils';


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
            exPressRouter.route(path).post(upload.single(UPLOAD_TYPE_FILE));
        }

        exPressRouter.route(path)
            .all((req: Request, res: Response, next: NextFunction) => {
                (async () => {
                    if (handlers.all) {
                        handlers.all.call(this, req, res, next);
                    } else {
                        this.all(req, res, next);
                    }
                })().catch((error) => {
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
                })().catch((error) => {
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
                })().catch((error) => {
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
                })().catch((error) => {
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
                })().catch((error) => {
                    this.handleError(req, res, error);
                });
            });
    }

    protected async all(req: Request, res: Response, next: NextFunction) {
        if (!this.isLogin(req)) {
            res.json({ code: ApiResultCode.Unauthorized }).end();
        } else {
            next();
        }
    }


    protected isLogin(req: Request): boolean {
        // igore login request
        if (req.method === 'POST' && req.path === '/api/session') {
            return true;
        }
        // ignore user(admin or publisher or executor) register
        if (req.method === 'POST' && req.path === '/api/user') {
            return true;
        }

        return CookieUtils.getUserFromCookie(req) != null;
    }

    protected handleError(req: Request, res: Response, error: any, statusCode = 200) {
        // res.status(statusCode).json(error).end();
        res.json(ApiError.fromError(error)).end();
    }
}
