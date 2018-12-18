import { API_PATH_API, API_PATH_FILE, API_PATH_USER, API_PATH_TEMPLATE } from 'common/Constants';
import { IFilePostParam } from 'common/requestParams/IFilePostParam';
import { IUserPostParam } from 'common/requestParams/IUserPostParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { IAPIResult } from 'common/responseResults/IAPIResult';
import { IUserView } from 'common/responseResults/IUserView';
import { NextFunction, Request, Response, Router } from 'express';
import { LoggersManager } from '../libsWrapper/LoggersManager';
import { FileRequestHandler } from '../requestHandlers/FileRequestHandler';
import { UserRequestHandler } from '../requestHandlers/UserRequestHandler';
import { BaseRouter } from './BaseRouter';
import { ApiBuilder, IApiHandlers, UploadType } from './builders/ApiBuilder';
import { ITemplatePostParam } from 'common/requestParams/ITemplatePostParam';
import { ITemplateView } from 'common/responseResults/ITemplateView';
import { TemplateRequestHandler } from '../requestHandlers/TemplateRequestHandler';
/**
 * API Router for all the /api/* RESTful URI
 *
 * @class ApiRouter
 */
export class ApiRouter extends BaseRouter {

    constructor(expRouter: Router) {
        super(expRouter);
    }
    public mount(): void {
        const apiBuilder: ApiBuilder = new ApiBuilder(this);
        // build user API
        apiBuilder.buildApiForPath(`/${API_PATH_API}/${API_PATH_USER}`, {
            get: this.findUser,
            post: this.createUser,
        } as IApiHandlers);

        // build template API
        apiBuilder.buildApiForPath(`/${API_PATH_API}/${API_PATH_TEMPLATE}`, {
            post: this.createTemplate,
        } as IApiHandlers);

        // build file API
        apiBuilder.buildApiForPath(`/${API_PATH_API}/${API_PATH_FILE}`, {
            post: this.postFile,
        } as IApiHandlers,
            UploadType.File);
    }
    private async findUser(req: Request, res: Response, next: NextFunction) {
        res.json('here').end();
    }
    // #region -- User relative API entry
    private async createUser(req: Request, res: Response, next: NextFunction) {
        const apiResult: IAPIResult = { code: ApiResultCode.Success };
        LoggersManager.debug('createUser', req.body);
        const userPostParam: IUserPostParam = req.body as IUserPostParam;
        const userView: IUserView = await UserRequestHandler.$$createUser(userPostParam);
        apiResult.data = userView;
        res.json(apiResult).end();
    }
    // #endregion

    // #region -- Template relative API entry
    private async createTemplate(req: Request, res: Response, next: NextFunction) {
        const apiResult: IAPIResult = { code: ApiResultCode.Success };
        LoggersManager.debug('createTemplate', req.body);
        const postParam: ITemplatePostParam = req.body as ITemplatePostParam;
        const view: ITemplateView = await TemplateRequestHandler.$$createTemplate(postParam);
        apiResult.data = view;
        res.json(apiResult).end();
    }
    // #endregion

    // #region -- File relative API entry
    private async postFile(req: Request, res: Response, next: NextFunction) {
        const apiResult: IAPIResult = { code: ApiResultCode.Success };
        const filePostParam: IFilePostParam = req.body as IFilePostParam;
        await FileRequestHandler.$$uploadFile(
            filePostParam.entryId, filePostParam.version, req.file.buffer, filePostParam.metaData);
        res.json(apiResult).end();
    }
    // #endregion
}
