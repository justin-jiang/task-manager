import { FileAPIScenario } from 'common/FileAPIScenario';
import { HttpPathItem } from 'common/HttpPathItem';
import { IQueryConditions } from 'common/IQueryConditions';
import { FileCreateParam } from 'common/requestParams/FileCreateParam';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileRemoveParam } from 'common/requestParams/FileRemoveParam';
import { SessionCreateParam } from 'common/requestParams/SessionCreateParam';
import { TemplateEditParam } from 'common/requestParams/TemplateEditParam';
import { TemplateRemoveParam } from 'common/requestParams/TemplateRemoveParam';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { UserEditParam } from 'common/requestParams/UserEditParam';
import { UserRemoveParam } from 'common/requestParams/UserRemoveParam';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { ITemplateView } from 'common/responseResults/TemplateView';
import { UserView } from 'common/responseResults/UserView';
import { NextFunction, Request, Response, Router } from 'express';
import { ApiError } from 'server/common/ApiError';
import { UserModelWrapper } from 'server/dataModels/UserModelWrapper';
import { UserObject } from 'server/dataObjects/UserObject';
import { CookieUtils, ILoginUserInfoInCookie } from 'server/expresses/CookieUtils';
import { SessionRequestHandler } from 'server/requestHandlers/SessionRequestHandler';
import { LoggerManager } from '../libsWrapper/LoggerManager';
import { FileRequestHandler } from '../requestHandlers/FileRequestHandler';
import { TemplateRequestHandler } from '../requestHandlers/TemplateRequestHandler';
import { UserRequestHandler } from '../requestHandlers/UserRequestHandler';
import { BaseRouter } from './BaseRouter';
import { ApiBuilder, IApiHandlers, UploadType } from './builders/ApiBuilder';
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
        // #region -- build user API
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.QUERY}`, {
            post: this.$$userQuery.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.EDIT}`, {
            post: this.$$userEdit.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.REMOVE}`, {
            post: this.$$userRemove.bind(this),
        } as IApiHandlers);
        // #endregion

        // #region -- build template API
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.TEMPLATE}`, {
            post: this.$$templateCreate,
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.TEMPLATE}/${HttpPathItem.QUERY}`, {
            post: this.$$templateQuery,
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.TEMPLATE}/${HttpPathItem.REMOVE}`, {
            post: this.$$templateRemove,
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.TEMPLATE}/${HttpPathItem.EDIT}`, {
            post: this.$$templateEdit,
        } as IApiHandlers);
        // #endregion

        // #region -- build file API
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.FILE}`, {
            post: this.$$fileCreate.bind(this),
        } as IApiHandlers,
            UploadType.File);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.FILE}/${HttpPathItem.DOWNLOAD}`, {
            post: this.$$fileDownload.bind(this),
        } as IApiHandlers);
        // #endregion

        // #region -- build session API
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.SESSION}`, {
            post: this.$$sessionCreate.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.SESSION}/${HttpPathItem.QUERY}`, {
            post: this.$$sessionQuery.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.SESSION}/${HttpPathItem.REMOVE}`, {
            post: this.$$sessionRemove.bind(this),
        } as IApiHandlers);
        // #endregion
    }

    // #region -- User relative API entry
    /**
     * find users by conditions
     * @param req
     * @param res
     * @param next 
     */
    private async $$userQuery(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: IQueryConditions = req.body as IQueryConditions;
        const views: UserView[] = await UserRequestHandler.$$find(reqParam);
        apiResult.data = views;
        res.json(apiResult).end();
    }

    private async $$userEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: UserEditParam = req.body as UserEditParam;
        // ToDo: support bulk edit
        await UserRequestHandler.$$updateOne(reqParam);
        res.json(apiResult).end();
    }
    private async $$userRemove(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: UserRemoveParam = req.body as UserRemoveParam;
        // then delete template item
        await UserRequestHandler.$$deleteOne(reqParam.uid);
        res.json(apiResult).end();
    }
    // #endregion

    // #region -- Template relative API entry
    /**
     * create new template
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$templateCreate(req: Request, res: Response, next: NextFunction) {
        throw new ApiError(ApiResultCode.ApiNotImplemented,
            'please use file post api to creat template and upload template file');
    }
    private async $$templateQuery(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: IQueryConditions = req.body as IQueryConditions;
        const views: ITemplateView[] = await TemplateRequestHandler.$$find(reqParam);
        apiResult.data = views;
        res.json(apiResult).end();
    }
    private async $$templateRemove(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: TemplateRemoveParam = req.body as TemplateRemoveParam;
        const fileDeleteParam: FileRemoveParam = {
            fileId: reqParam.templateFileId,
        } as FileRemoveParam;
        // delete all template file
        await FileRequestHandler.$$deleteOne(fileDeleteParam);
        // then delete template item
        await TemplateRequestHandler.$$deleteOne(reqParam.uid);
        res.json(apiResult).end();
    }

    private async $$templateEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: TemplateEditParam = req.body as TemplateEditParam;
        // ToDo: support bulk edit
        await TemplateRequestHandler.$$updateOne(reqParam);
        res.json(apiResult).end();
    }
    // #endregion

    // #region -- File relative API entry
    /**
     * post file(logo image or template file)
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$fileCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: FileCreateParam = req.body as FileCreateParam;
        let currentDBUser: UserObject | undefined;
        switch (reqParam.scenario) {
            case FileAPIScenario.CreateQualification:
            case FileAPIScenario.EditQualificationFile:
                currentDBUser = await this.$$getCurrentUser(req);
                await FileRequestHandler.$$createOrEditQualification(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.CreateTemplate:
            case FileAPIScenario.EditTemplateFile:
                await FileRequestHandler.$$createTemplate(req.file, reqParam);
                break;
            case FileAPIScenario.CreateUser:
                const view: UserView = await FileRequestHandler.$$createUser(req.file, reqParam);
                const metaData: UserCreateParam = JSON.parse(reqParam.metaData as string);
                CookieUtils.setUserToCookie(
                    res, { uid: view.uid, password: metaData.password } as ILoginUserInfoInCookie);
                break;
            case FileAPIScenario.EditUserLogo:
                currentDBUser = await this.$$getCurrentUser(req);
                await FileRequestHandler.$$updateUserLogo(req.file, reqParam, currentDBUser);
                break;
            default:
                LoggerManager.error(`Invalid API Scenario:${reqParam.scenario}`);
                throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_SCENARIO);
        }
        res.json(apiResult).end();
    }

    private async $$fileDownload(req: Request, res: Response, next: NextFunction): Promise<void> {
        const reqParam: FileDownloadParam = req.body as FileDownloadParam;
        // transform request param
        const scenario: FileAPIScenario = Number.parseInt(reqParam.scenario as any, 10);
        reqParam.scenario = scenario;
        reqParam.version = Number.parseInt(reqParam.version as any, 10);
        await FileRequestHandler.$$getOne(reqParam, res);
    }
    // #endregion

    // #region -- session relative API entry
    /**
     * login scenario
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$sessionCreate(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Unauthorized };
        const reqParam: SessionCreateParam = req.body as SessionCreateParam;
        const loginUser: UserView | undefined = await SessionRequestHandler.$$sessionCreate(reqParam, res);
        if (loginUser != null) {
            apiResult.code = ApiResultCode.Success;
            apiResult.data = loginUser;
        }
        res.json(apiResult).end();
    }
    /**
     * get current login user info from cookie
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$sessionQuery(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Unauthorized };
        const userCookie: ILoginUserInfoInCookie | undefined = CookieUtils.getUserFromCookie(req);
        if (userCookie != null) {
            if (userCookie.uid != null) {
                const loginUser: UserView | undefined = await SessionRequestHandler.$$sessionQuery(
                    userCookie.uid as string);
                if (loginUser != null) {
                    apiResult.code = ApiResultCode.Success;
                    apiResult.data = loginUser;
                }
            } else {
                LoggerManager.error('No uid in ILoginUserInfoInCookie');
            }
        }
        res.json(apiResult).end();
    }

    private async $$sessionRemove(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        CookieUtils.setUserToCookie(res);
        res.json(apiResult).end();
    }
    // #endregion

    // #region -- internal props and methods
    private async $$getCurrentUser(req: Request): Promise<UserObject> {
        const loginUserInCookie: ILoginUserInfoInCookie =
            CookieUtils.getUserFromCookie(req) as ILoginUserInfoInCookie;
        const dbUsers: UserObject[] = await UserModelWrapper.$$find(
            { uid: loginUserInCookie.uid } as UserObject) as UserObject[];
        if (dbUsers == null || dbUsers.length === 0) {
            throw new ApiError(ApiResultCode.DB_NOT_FOUND, `UserID:${loginUserInCookie.uid}`);
        }
        return dbUsers[0];
    }
    // #end-region
}
