import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { HttpPathItem } from 'common/HttpPathItem';
import { IQueryConditions } from 'common/IQueryConditions';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { SessionCreateParam } from 'common/requestParams/SessionCreateParam';
import { TaskApplyCheckParam } from 'common/requestParams/TaskApplyCheckParam';
import { TaskApplyParam } from 'common/requestParams/TaskApplyParam';
import { TaskBasicInfoEditParam } from 'common/requestParams/TaskBasicInfoEditParam';
import { TaskCreateParam } from 'common/requestParams/TaskCreateParam';
import { TaskRemoveParam } from 'common/requestParams/TaskRemoveParam';
import { TaskResultCheckParam } from 'common/requestParams/TaskResultCheckParam';
import { TemplateEditParam } from 'common/requestParams/TemplateEditParam';
import { TemplateRemoveParam } from 'common/requestParams/TemplateRemoveParam';
import { UserBasicInfoEditParam } from 'common/requestParams/UserBasicInfoEditParam';
import { UserCheckParam } from 'common/requestParams/UserCheckParam';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { UserDisableParam } from 'common/requestParams/UserDisableParam';
import { UserEnableParam } from 'common/requestParams/UserEnableParam';
import { UserPasswordEditParam } from 'common/requestParams/UserPasswordEditParam';
import { UserRemoveParam } from 'common/requestParams/UserRemoveParam';
import { ApiResult } from 'common/responseResults/APIResult';
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
import { NotificationRequestHandler } from 'server/requestHandlers/NotificationRequestHandler';
import { UserNotificationView } from 'common/responseResults/UserNotificationView';
import { NotificationReadParam } from 'common/requestParams/NotificationReadParam';
import { TaskAuditParam } from 'common/requestParams/TaskAuditParam';
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
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Query}`, {
            post: this.$$userQuery.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Edit}`, {
            post: this.$$userBasicInfoEdit.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Remove}`, {
            post: this.$$userRemove.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Check}`, {
            post: this.$$userCheck.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Enable}`, {
            post: this.$$userEnable.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Disable}`, {
            post: this.$$userDisable.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Password}/${HttpPathItem.Edit}`, {
                post: this.$$userPasswordEdit.bind(this),
            } as IApiHandlers);
        // #endregion

        // #region -- build template API
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Template}/${HttpPathItem.Query}`, {
            post: this.$$templateQuery.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Template}/${HttpPathItem.Remove}`, {
            post: this.$$templateRemove.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Template}/${HttpPathItem.Edit}`, {
            post: this.$$templateBasicInfoEdit.bind(this),
        } as IApiHandlers);
        // #endregion

        // #region -- build file API
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.File}`, {
            post: this.$$fileUpload.bind(this),
        } as IApiHandlers,
            UploadType.File);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.File}/${HttpPathItem.Download}`, {
            post: this.$$fileDownload.bind(this),
        } as IApiHandlers);
        // #endregion

        // #region -- build session API
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Session}`, {
            post: this.$$sessionCreate.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Session}/${HttpPathItem.Query}`, {
            post: this.$$sessionQuery.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Session}/${HttpPathItem.Remove}`, {
            post: this.$$sessionRemove.bind(this),
        } as IApiHandlers);
        // #endregion

        // #region -- build Task Api
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Task}`, {
            post: this.$$taskCreate.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Query}`, {
            post: this.$$taskQuery.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Edit}`, {
            post: this.$$taskBasicInfoEdit.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Remove}`, {
            post: this.$$taskRemove.bind(this),
        } as IApiHandlers);
        // api for executor to apply a task
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Apply}`, {
            post: this.$$taskApply.bind(this),
        } as IApiHandlers);
        // api for publisher to check a task apply: accept or deny
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Apply}/${HttpPathItem.Check}`, {
                post: this.$$taskApplyCheck.bind(this),
            } as IApiHandlers);

        // api for publisher to check the task result from executor
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Result}/${HttpPathItem.Check}`, {
                post: this.$$taskResultCheck.bind(this),
            } as IApiHandlers);

        // api for admin to audit the new created task from publisher
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Audit}`, {
                post: this.$$taskAudit.bind(this),
            } as IApiHandlers);

        // api for admin to audit the new task apply from executor
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Apply}/${HttpPathItem.Audit}`, {
                post: this.$$taskApplyAudit.bind(this),
            } as IApiHandlers);
        // #endregion

        // #region -- build UserNotification Api
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Notification}/${HttpPathItem.Query}`, {
            post: this.$$notificationQuery.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Notification}/${HttpPathItem.Read}`, {
            post: this.$$notificationRead.bind(this),
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
        const apiResult: ApiResult = { code: ApiResultCode.Success };
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
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserBasicInfoEditParam = req.body as UserBasicInfoEditParam;
        // only admin or self user can update himself
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$basicInfoEdit(reqParam, currentUser);
        res.json(apiResult).end();
    }
    private async $$userPasswordEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserPasswordEditParam = req.body as UserPasswordEditParam;
        // only admin or self user can update himself
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        await UserRequestHandler.$$passwordEdit(reqParam, currentUser);
        res.json(apiResult).end();
    }
    private async $$userRemove(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
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
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserCheckParam = req.body as UserCheckParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$check(reqParam, currentUser);
        res.json(apiResult).end();
    }
    private async $$userEnable(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserEnableParam = req.body as UserEnableParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$enableOrDisable(reqParam.uid, UserState.Enabled, currentUser);
        res.json(apiResult).end();
    }
    private async $$userDisable(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
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
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: IQueryConditions = req.body as IQueryConditions;
        // every one can query the template
        const views: TemplateView[] = await TemplateRequestHandler.$$find(reqParam);
        apiResult.data = views;
        res.json(apiResult).end();
    }
    private async $$templateRemove(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
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
        const apiResult: ApiResult = { code: ApiResultCode.Success };
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
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: FileUploadParam = req.body as FileUploadParam;
        if (req.file == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'req.file should not be null');
        }
        let currentDBUser: UserObject | undefined;
        switch (reqParam.scenario) {
            case FileAPIScenario.UpdateQualificationFile:
                // don't need to check permission, every user can upload his owned qualification file
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$updateQualification(req.file, reqParam, currentDBUser);
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
                const metadata: UserCreateParam = JSON.parse(reqParam.optionData as string);
                CookieUtils.setUserToCookie(
                    res, { uid: view.uid, password: metadata.password } as ILoginUserInfoInCookie);
                apiResult.data = view;
                break;
            case FileAPIScenario.UpdateUserLogo:
            case FileAPIScenario.UpdateUserFrontId:
            case FileAPIScenario.UpdateUserBackId:
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$updateUserLogoOrId(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UpdateTaskResultFile:
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$updateTaskResultFile(req.file, reqParam, currentDBUser);
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
        const apiResult: ApiResult = { code: ApiResultCode.AuthUnauthorized };
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
        const apiResult: ApiResult = { code: ApiResultCode.AuthUnauthorized };
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
        const apiResult: ApiResult = { code: ApiResultCode.Success };
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
        const apiResult: ApiResult = { code: ApiResultCode.Success };
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
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        if (!CommonUtils.isUserReady(currentUser)) {
            LoggerManager.error(`User:${currentUser.name} state(${currentUser.state}) is not ready`);
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        const views: TaskView[] = await TaskRequestHandler.$$query(currentUser);
        apiResult.data = views;
        res.json(apiResult).end();
    }
    private async $$taskBasicInfoEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskBasicInfoEditParam = req.body as TaskBasicInfoEditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const view: TaskView | null = await TaskRequestHandler.$$basicInfoEdit(reqParam, currentUser);
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
        const apiResult: ApiResult = { code: ApiResultCode.Success };
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
        const apiResult: ApiResult = { code: ApiResultCode.Success };
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
    private async $$taskApplyCheck(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskApplyCheckParam = req.body as TaskApplyCheckParam;
        if (CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TaskApplyCheckParam.uid should not be null');
        }
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$applyCheck(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }

    /**
     * publisher to deny a task apply
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskResultCheck(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskResultCheckParam = req.body as TaskResultCheckParam;
        if (CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TaskResultCheckParam.uid should not be null');
        }
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$resultCheck(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }

    /**
     * admin to audit the new created task
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskAudit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskAuditParam = req.body as TaskAuditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$audit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }

    /**
     * admin to audit the new task apply
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskApplyAudit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskAuditParam = req.body as TaskAuditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$applyAudit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }
    // #endregion

    // #region -- notification relative API
    private async $$notificationQuery(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const views: UserNotificationView[] | undefined = await NotificationRequestHandler.$$query(currentUser);
        apiResult.data = views;
        res.json(apiResult).end();
    }
    private async $$notificationRead(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const reqParam: NotificationReadParam = req.body as NotificationReadParam;
        const view: UserNotificationView | null = await NotificationRequestHandler.$$read(reqParam, currentUser);
        apiResult.data = view;
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
