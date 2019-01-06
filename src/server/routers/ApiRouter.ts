import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { HttpPathItem } from 'common/HttpPathItem';
import { IQueryConditions } from 'common/IQueryConditions';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { SessionCreateParam } from 'common/requestParams/SessionCreateParam';
import { TaskApplyAcceptParam } from 'common/requestParams/TaskApplyAcceptParam';
import { TaskApplyDenyParam } from 'common/requestParams/TaskApplyDenyParam';
import { TaskApplyParam } from 'common/requestParams/TaskApplyParam';
import { TaskCreateParam } from 'common/requestParams/TaskCreateParam';
import { TaskEditParam } from 'common/requestParams/TaskEditParam';
import { TaskRemoveParam } from 'common/requestParams/TaskRemoveParam';
import { TemplateEditParam } from 'common/requestParams/TemplateEditParam';
import { TemplateRemoveParam } from 'common/requestParams/TemplateRemoveParam';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { UserBasicInfoEditParam } from 'common/requestParams/UserBasicInfoEditParam';
import { UserRemoveParam } from 'common/requestParams/UserRemoveParam';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { TemplateView } from 'common/responseResults/TemplateView';
import { UserView } from 'common/responseResults/UserView';
import { UserState } from 'common/UserState';
import { NextFunction, Request, Response, Router } from 'express';
import { ApiError } from 'server/common/ApiError';
import { UserModelWrapper } from 'server/dataModels/UserModelWrapper';
import { UserObject } from 'server/dataObjects/UserObject';
import { CookieUtils, ILoginUserInfoInCookie } from 'server/expresses/CookieUtils';
import { SessionRequestHandler } from 'server/requestHandlers/SessionRequestHandler';
import { TaskRequestHandler } from 'server/requestHandlers/TaskRequestHandler';
import { LoggerManager } from '../libsWrapper/LoggerManager';
import { FileRequestHandler } from '../requestHandlers/FileRequestHandler';
import { TemplateRequestHandler } from '../requestHandlers/TemplateRequestHandler';
import { UserRequestHandler } from '../requestHandlers/UserRequestHandler';
import { BaseRouter } from './BaseRouter';
import { ApiBuilder, IApiHandlers, UploadType } from './builders/ApiBuilder';
import { UserCheckParam } from 'common/requestParams/UserCheckParam';
import { UserEnableParam } from 'common/requestParams/UserEnableParam';
import { UserDisableParam } from 'common/requestParams/UserDisableParam';
import { UserPasswordEditParam } from 'common/requestParams/UserPasswordEditParam';
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
            post: this.$$userBasicInfoEdit.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.REMOVE}`, {
            post: this.$$userRemove.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.CHECK}`, {
            post: this.$$userCheck.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.ENABLE}`, {
            post: this.$$userEnable.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.DISABLE}`, {
            post: this.$$userDisable.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.API}/${HttpPathItem.USER}/${HttpPathItem.PASSWORD}/${HttpPathItem.EDIT}`, {
                post: this.$$userPasswordEdit.bind(this),
            } as IApiHandlers);
        // #endregion

        // #region -- build template API
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.TEMPLATE}/${HttpPathItem.QUERY}`, {
            post: this.$$templateQuery.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.TEMPLATE}/${HttpPathItem.REMOVE}`, {
            post: this.$$templateRemove.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.TEMPLATE}/${HttpPathItem.EDIT}`, {
            post: this.$$templateBasicInfoEdit.bind(this),
        } as IApiHandlers);
        // #endregion

        // #region -- build file API
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.FILE}`, {
            post: this.$$fileUpload.bind(this),
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

        // #region -- build Task Api
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.TASK}`, {
            post: this.$$taskCreate.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.TASK}/${HttpPathItem.QUERY}`, {
            post: this.$$taskQuery.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.TASK}/${HttpPathItem.EDIT}`, {
            post: this.$$taskEdit.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.TASK}/${HttpPathItem.REMOVE}`, {
            post: this.$$taskRemove.bind(this),
        } as IApiHandlers);
        // api for executor to apply a task
        apiBuilder.buildApiForPath(`/${HttpPathItem.API}/${HttpPathItem.TASK}/${HttpPathItem.APPLY}`, {
            post: this.$$taskApply.bind(this),
        } as IApiHandlers);
        // api for publisher to accept a task
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.API}/${HttpPathItem.TASK}/${HttpPathItem.APPLY}/${HttpPathItem.ACCEPT}`, {
                post: this.$$taskApplyAccept.bind(this),
            } as IApiHandlers);
        // api for publisher to deny a task
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.API}/${HttpPathItem.TASK}/${HttpPathItem.APPLY}/${HttpPathItem.DENY}`, {
                post: this.$$taskApplyDeny.bind(this),
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
        // only admin can do the user list query
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        if (!CommonUtils.isAdmin(currentUser.roles)) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        const views: UserView[] = await UserRequestHandler.$$find({ uid: { $ne: UserModelWrapper.adminUID } });
        apiResult.data = views;
        res.json(apiResult).end();
    }

    private async $$userBasicInfoEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: UserBasicInfoEditParam = req.body as UserBasicInfoEditParam;
        // only admin or self user can update himself
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$basicInfoEdit(reqParam, currentUser);
        res.json(apiResult).end();
    }
    private async $$userPasswordEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: UserPasswordEditParam = req.body as UserPasswordEditParam;
        // only admin or self user can update himself
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        await UserRequestHandler.$$passwordEdit(reqParam, currentUser);
        res.json(apiResult).end();
    }
    private async $$userRemove(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: UserRemoveParam = req.body as UserRemoveParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const view: UserView | null = await UserRequestHandler.$$remove(reqParam, currentUser);
        if (view != null) {
            apiResult.data = view;
        } else {
            apiResult.code = ApiResultCode.DbNotFound;
        }
        res.json(apiResult).end();
    }
    private async $$userCheck(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: UserCheckParam = req.body as UserCheckParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$check(reqParam, currentUser);
        res.json(apiResult).end();
    }
    private async $$userEnable(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: UserEnableParam = req.body as UserEnableParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$enableOrDisable(reqParam.uid, UserState.Enabled, currentUser);
        res.json(apiResult).end();
    }
    private async $$userDisable(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: UserDisableParam = req.body as UserDisableParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$enableOrDisable(reqParam.uid, UserState.Disabled, currentUser);
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
    private async $$templateQuery(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: IQueryConditions = req.body as IQueryConditions;
        // every one can query the template
        const views: TemplateView[] = await TemplateRequestHandler.$$find(reqParam);
        apiResult.data = views;
        res.json(apiResult).end();
    }
    private async $$templateRemove(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: TemplateRemoveParam = req.body as TemplateRemoveParam;
        // only admin can remove template
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const dbView: TemplateView | null = await TemplateRequestHandler.$$remove(reqParam, currentUser);
        if (dbView != null) {
            apiResult.data = dbView;
        } else {
            apiResult.code = ApiResultCode.DbNotFound;
        }
        res.json(apiResult).end();
    }

    private async $$templateBasicInfoEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: TemplateEditParam = req.body as TemplateEditParam;
        // only admin can edit template
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await TemplateRequestHandler.$$basicInfoEdit(reqParam, currentUser);
        res.json(apiResult).end();
    }
    // #endregion

    // #region -- File relative API entry
    /**
     * upload file with or without DBObject, e.g. 
     * 1, logo image with a new user to register a new user
     * 2, template file with a new template to create a new template
     * 3, log image without user object to update the crrent user log
     * 4, template file without template object to update the template file
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$fileUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: FileUploadParam = req.body as FileUploadParam;
        if (req.file == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'req.file should not be null');
        }
        let currentDBUser: UserObject | undefined;
        switch (reqParam.scenario) {
            case FileAPIScenario.UpdateQualificationFile:
                // don't need to check permission, every user can upload his owned qualification file
                currentDBUser = await this.$$getCurrentUser(req);
                await FileRequestHandler.$$updateQualification(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadTemplate:
                //  only Admin can create or edit Template File
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$createTemplate(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UpdateTemplateFile:
                //  only Admin can create or edit Template File
                currentDBUser = await this.$$getCurrentUser(req);
                await FileRequestHandler.$$updateTemplateFile(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadUser:
                //  everyone can do the user(executor or publisher) register
                const view: UserView = await FileRequestHandler.$$createUser(req.file, reqParam);
                const metadata: UserCreateParam = JSON.parse(reqParam.metadata as string);
                CookieUtils.setUserToCookie(
                    res, { uid: view.uid, password: metadata.password } as ILoginUserInfoInCookie);
                apiResult.data = view;
                break;
            case FileAPIScenario.UpdateUserLogo:
                currentDBUser = await this.$$getCurrentUser(req);
                await FileRequestHandler.$$updateUserLogo(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UpdateTaskResultFile:
                currentDBUser = await this.$$getCurrentUser(req);
                await FileRequestHandler.$$updateTaskResultFile(req.file, reqParam, currentDBUser);
                break;
            default:
                LoggerManager.error(`Invalid API Scenario:${reqParam.scenario}`);
                throw new ApiError(ApiResultCode.InputInvalidScenario);
        }
        res.json(apiResult).end();
    }

    private async $$fileDownload(req: Request, res: Response, next: NextFunction): Promise<void> {
        const reqParam: FileDownloadParam = req.body as FileDownloadParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        await FileRequestHandler.$$download(reqParam, currentUser, res);
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
        const apiResult: APIResult = { code: ApiResultCode.AuthUnauthorized };
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
        const apiResult: APIResult = { code: ApiResultCode.AuthUnauthorized };
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

    // #region -- task relative API
    /**
     * publisher publishes task
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskCreate(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: TaskCreateParam = req.body as TaskCreateParam;
        const currentUser = await this.$$getCurrentUser(req);
        const view: TaskView = await TaskRequestHandler.$$create(reqParam, currentUser);
        apiResult.data = view;
        res.json(apiResult).end();
    }
    /**
     * Executor or Publisher to query available task
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskQuery(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        if (!CommonUtils.isUserReady(currentUser)) {
            LoggerManager.error(`User:${currentUser.name} state(${currentUser.state}) is not ready`);
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        const views: TaskView[] = await TaskRequestHandler.$$query(currentUser);
        apiResult.data = views;
        res.json(apiResult).end();
    }

    private async $$taskEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: TaskEditParam = req.body as TaskEditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const view: TaskView | null = await TaskRequestHandler.$$edit(reqParam, currentUser);
        apiResult.data = view;
        res.json(apiResult).end();
    }

    /**
     * Publisher or Admin remove specified task
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskRemove(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: TaskRemoveParam = req.body as TaskRemoveParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        // then delete task item
        const view: TaskView = await TaskRequestHandler.$$remove(reqParam, currentUser);
        apiResult.data = view;
        res.json(apiResult).end();
    }

    /**
     * Executor to apply the task
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskApply(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: TaskApplyParam = req.body as TaskApplyParam;
        if (CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TaskApplyParam.uid should not be null');
        }
        // only ready executor can apply task
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await TaskRequestHandler.$$apply(reqParam, currentUser);
        res.json(apiResult).end();
    }

    /**
     * publisher to accept a task apply
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskApplyAccept(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: TaskApplyAcceptParam = req.body as TaskApplyAcceptParam;
        if (CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TaskApplyAcceptParam.uid should not be null');
        }
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$applyAccept(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }

    /**
     * publisher to deny a task apply
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskApplyDeny(req: Request, res: Response, next: NextFunction) {
        const apiResult: APIResult = { code: ApiResultCode.Success };
        const reqParam: TaskApplyDenyParam = req.body as TaskApplyDenyParam;
        if (CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TaskApplyDenyParam.uid should not be null');
        }
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$applyDeny(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }
    // #endregion

    // #region -- internal props and methods
    private async $$getCurrentUser(req: Request): Promise<UserObject> {
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
}
