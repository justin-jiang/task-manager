import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { HttpPathItem } from 'common/HttpPathItem';
import { IQueryConditions } from 'common/IQueryConditions';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { NotificationReadParam } from 'common/requestParams/NotificationReadParam';
import { SessionCreateParam } from 'common/requestParams/SessionCreateParam';
import { TaskApplyParam } from 'common/requestParams/TaskApplyParam';
import { TaskApplyRemoveParam } from 'common/requestParams/TaskApplyRemoveParam';
import { TaskAuditParam } from 'common/requestParams/TaskAuditParam';
import { TaskBasicInfoEditParam } from 'common/requestParams/TaskBasicInfoEditParam';
import { TaskCreateParam } from 'common/requestParams/TaskCreateParam';
import { TaskExecutorReceiptUploadParam } from 'common/requestParams/TaskExecutorReceiptUploadParam';
import { TaskHistoryQueryParam } from 'common/requestParams/TaskHistoryQueryParam';
import { TaskPublisherVisitParam } from 'common/requestParams/TaskPublisherVisitParam';
import { TaskRemoveParam } from 'common/requestParams/TaskRemoveParam';
import { TaskResultCheckParam } from 'common/requestParams/TaskResultCheckParam';
import { TemplateEditParam } from 'common/requestParams/TemplateEditParam';
import { TemplateRemoveParam } from 'common/requestParams/TemplateRemoveParam';
import { UserAccountInfoEditParam } from 'common/requestParams/UserAccountInfoEditParam';
import { UserBasicInfoEditParam } from 'common/requestParams/UserBasicInfoEditParam';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { UserDisableParam } from 'common/requestParams/UserDisableParam';
import { UserEnableParam } from 'common/requestParams/UserEnableParam';
import { UserPasswordEditParam } from 'common/requestParams/UserPasswordEditParam';
import { UserPasswordResetParam } from 'common/requestParams/UserPasswordResetParam';
import { UserRemoveParam } from 'common/requestParams/UserRemoveParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { TemplateView } from 'common/responseResults/TemplateView';
import { UserNotificationView } from 'common/responseResults/UserNotificationView';
import { UserView } from 'common/responseResults/UserView';
import { TaskHistoryItem } from 'common/TaskHistoryItem';
import { UserState } from 'common/UserState';
import { NextFunction, Request, Response, Router } from 'express';
import { ApiError } from 'server/common/ApiError';
import { TemplateObject } from 'server/dataObjects/TemplateObject';
import { UserObject } from 'server/dataObjects/UserObject';
import { CookieUtils, ILoginUserInfoInCookie } from 'server/expresses/CookieUtils';
import { NotificationRequestHandler } from 'server/requestHandlers/NotificationRequestHandler';
import { RequestUtils } from 'server/requestHandlers/RequestUtils';
import { SessionRequestHandler } from 'server/requestHandlers/SessionRequestHandler';
import { TaskRequestHandler } from 'server/requestHandlers/TaskRequestHandler';
import { LoggerManager } from '../libsWrapper/LoggerManager';
import { FileRequestHandler } from '../requestHandlers/FileRequestHandler';
import { TemplateRequestHandler } from '../requestHandlers/TemplateRequestHandler';
import { UserRequestHandler } from '../requestHandlers/UserRequestHandler';
import { BaseRouter } from './BaseRouter';
import { ApiBuilder, IApiHandlers, UploadType } from './builders/ApiBuilder';
import { UserPasswordRecoverParam } from 'common/requestParams/UserPasswordRecoverParam';
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
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}`, {
            post: this.$$userCreate.bind(this),
        } as IApiHandlers);
        /**
         * used by admin to query all users
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Query}`, {
            post: this.$$userQuery.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Edit}`, {
            post: this.$$userBasicInfoEdit.bind(this),
        } as IApiHandlers);
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Remove}`, {
            post: this.$$userRemove.bind(this),
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
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Password}/${HttpPathItem.Reset}`, {
                post: this.$$userPasswordReset.bind(this),
            } as IApiHandlers);
        // used by executor or publisher to notify the admin to reset password
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Password}/${HttpPathItem.Recover}`, {
                post: this.$$userPasswordRecover.bind(this),
            } as IApiHandlers);
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.AccoutInfo}/${HttpPathItem.Edit}`, {
                post: this.$$userAccountInfoEdit.bind(this),
            } as IApiHandlers);

        /**
         * used by admin to check the user identity info
         */
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Identity}/${HttpPathItem.Check}`, {
                post: this.$$userCheck.bind(this),
            } as IApiHandlers);
        /**
         * used by admin to check the user qualification
         */
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Qualification}/${HttpPathItem.Check}`, {
                post: this.$$userCheck.bind(this),
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
        // #region [SubRegion] -- -- Apply

        // api for executor to apply a task
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Apply}`, {
            post: this.$$taskApply.bind(this),
        } as IApiHandlers);

        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Apply}/${HttpPathItem.Remove}`, {
                post: this.$$taskApplyRemove.bind(this),
            } as IApiHandlers);

        // api for admin to audit task executor
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Executor}/${HttpPathItem.Audit}`, {
                post: this.$$taskExecutorAudit.bind(this),
            } as IApiHandlers);

        // api for admin to audit margin from executor
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Margin}/${HttpPathItem.Audit}`, {
                post: this.$$taskMarginAudit.bind(this),
            } as IApiHandlers);

        // #endregion

        // #region [SubRegion] -- -- Task
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
        // api for publisher to submit the new task
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Submit}`, {
                post: this.$$taskSubmit.bind(this),
            } as IApiHandlers);
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Visit}`, {
                post: this.$$publisherVisit.bind(this),
            } as IApiHandlers);
        // api for admin to audit the new created task info from publisher
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Audit}`, {
                post: this.$$taskInfoAudit.bind(this),
            } as IApiHandlers);
        // #endregion

        // #region [SubRegion] -- -- Result
        // api for publisher to check the task result from executor
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Result}/${HttpPathItem.Check}`, {
                post: this.$$taskResultCheck.bind(this),
            } as IApiHandlers);
        // api for admin to audit the task result from executor
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Result}/${HttpPathItem.Audit}`, {
                post: this.$$taskResultAudit.bind(this),
            } as IApiHandlers);
        // #endregion

        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.History}/${HttpPathItem.Query}`, {
                post: this.$$taskHistoryQuery.bind(this),
            } as IApiHandlers);

        // api for admin to audit the new created task info from publisher
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Deposit}/${HttpPathItem.Audit}`, {
                post: this.$$taskDepositAudit.bind(this),
            } as IApiHandlers);

        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Receipt}/${HttpPathItem.Deny}`, {
                post: this.$$receiptDeny.bind(this),
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
    private async $$userCreate(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserCreateParam = req.body as UserCreateParam;
        const view: UserView = await UserRequestHandler.$$create(reqParam);
        apiResult.data = view;
        CookieUtils.setUserToCookie(
            res, { uid: view.uid, password: reqParam.password } as ILoginUserInfoInCookie);
        res.json(apiResult).end();
    }
    /**
     * find users by conditions used by admin
     * @param req
     * @param res
     * @param next 
     */
    private async $$userQuery(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const views: UserView[] = await UserRequestHandler.$$query(currentUser);
        apiResult.data = views;
        res.json(apiResult).end();
    }

    /**
     * 
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$userBasicInfoEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserBasicInfoEditParam = req.body as UserBasicInfoEditParam;
        // only admin or self user can update himself
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$basicInfoEdit(reqParam, currentUser);
        res.json(apiResult).end();
    }
    private async $$userAccountInfoEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserAccountInfoEditParam = req.body as UserAccountInfoEditParam;
        // only admin or self user can update himself
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$accountInfoEdit(reqParam, currentUser);
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
    private async $$userPasswordReset(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserPasswordResetParam = req.body as UserPasswordResetParam;
        // only admin or self user can update himself
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        await UserRequestHandler.$$passwordReset(reqParam, currentUser);
        res.json(apiResult).end();
    }
    private async $$userPasswordRecover(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserPasswordRecoverParam = req.body as UserPasswordRecoverParam;
        await UserRequestHandler.$$passwordRecover(reqParam);
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
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$check(req.body, currentUser);
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
     * used by publisher to query all owned template
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$templateQuery(req: Request, res: Response, next: NextFunction) {
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        let views: TemplateView[] = [];
        if (CommonUtils.isAdmin(currentUser)) {
            views = await TemplateRequestHandler.$$find({} as IQueryConditions);
        } else {
            views = await TemplateRequestHandler.$$find(
                { publisherUid: currentUser.uid } as TemplateObject);
        }
        const apiResult: ApiResult = { code: ApiResultCode.Success };
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
            throw new ApiError(ApiResultCode.InputInvalidParam, 'No file prop in Request');
        }
        if (reqParam == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'No FileUploadParam in Request.Body');
        }
        if (reqParam.scenario == null || isNaN(reqParam.scenario)) {
            throw new ApiError(ApiResultCode.InputInvalidFileScenario, JSON.stringify(reqParam));
        }
        reqParam.scenario = Number.parseInt(reqParam.scenario as any, 10);
        let currentDBUser: UserObject | undefined;
        switch (reqParam.scenario) {
            case FileAPIScenario.UploadQualification:
                // don't need to check permission, every user can upload his owned qualification file
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$uploadQualificationFile(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.CreateTemplate:
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$createTaskTemplate(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadRegisterProtocol:
                //  only Admin can create or edit Protocol 
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$uploadRegisterProtocolFile(
                    req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadUserLogo:
            case FileAPIScenario.UploadUserFrontId:
            case FileAPIScenario.UploadUserBackId:
            case FileAPIScenario.UploadAuthLetter:
            case FileAPIScenario.UploadLicense:
            case FileAPIScenario.UploadLicenseWithPerson:
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$updateUserIdImages(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadTaskResult:
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$updateTaskResultFile(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadTaskDeposit:
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$updateTaskDepositImage(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadTaskMargin:
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$updateTaskMarginImage(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadTaskExecutorPay:
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$updateTaskPayToExecutorImage(
                    req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadExecutorTaskReceipt:
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$updateExecutorReceiptImage(
                    req.file, reqParam, currentDBUser);
                break;
                case FileAPIScenario.UploadTaskRefund:
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$uploadRefundImage(
                    req.file, reqParam, currentDBUser);
                break;
            default:
                throw new ApiError(ApiResultCode.InputInvalidFileScenario, JSON.stringify(reqParam));
        }
        res.json(apiResult).end();
    }

    private async $$fileDownload(req: Request, res: Response, next: NextFunction): Promise<void> {
        await FileRequestHandler.$$download(req, res);
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
     * publisher create task
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

    /**
     * publisher owner to query specified task history
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskHistoryQuery(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const reqParam: TaskHistoryQueryParam = req.body as TaskHistoryQueryParam;
        const history: TaskHistoryItem[] = await TaskRequestHandler.$$queryHistory(reqParam, currentUser);
        apiResult.data = history;
        res.json(apiResult).end();
    }

    /**
     * publisher owner edit task basic info
     * @param req 
     * @param res 
     * @param next 
     */
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
     * Executor release the apply
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskApplyRemove(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskApplyRemoveParam = req.body as TaskApplyRemoveParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await TaskRequestHandler.$$applyRemove(reqParam, currentUser);
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
     * used by admin to audit the task result
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskResultAudit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskAuditParam = req.body as TaskAuditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$resultAudit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }

    private async $$taskInfoAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskAuditParam = req.body as TaskAuditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$infoAudit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }
    private async $$taskDepositAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskAuditParam = req.body as TaskAuditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$depositAudit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }

    /**
     * admin to audit the new task apply
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskExecutorAudit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskAuditParam = req.body as TaskAuditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$executorAudit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }

    /**
     * used by admin to audit the margin from executor
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskMarginAudit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskAuditParam = req.body as TaskAuditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$marginAudit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }

    /**
     * publisher submit task
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskSubmit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskAuditParam = req.body as TaskAuditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$submit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }

    private async $$publisherVisit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskPublisherVisitParam = req.body as TaskPublisherVisitParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$publisherVisit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }
    private async $$receiptDeny(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskExecutorReceiptUploadParam = req.body as TaskExecutorReceiptUploadParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$receiptDeny(reqParam, currentUser);
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
        return await RequestUtils.$$getCurrentUser(req);
    }
    // #endregion
}
