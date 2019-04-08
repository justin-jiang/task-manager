import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { HttpPathItem } from 'common/HttpPathItem';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { NotificationReadParam } from 'common/requestParams/NotificationReadParam';
import { SessionCreateParam } from 'common/requestParams/SessionCreateParam';
import { TaskApplyParam } from 'common/requestParams/TaskApplyParam';
import { TaskApplyRemoveParam } from 'common/requestParams/TaskApplyRemoveParam';
import { TaskAuditParam } from 'common/requestParams/TaskAuditParam';
import { TaskBasicInfoEditParam } from 'common/requestParams/TaskBasicInfoEditParam';
import { TaskCreateParam } from 'common/requestParams/TaskCreateParam';
import { TaskExecutorReceiptNotRequiredParam } from 'common/requestParams/TaskExecutorReceiptNotRequiredParam';
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
import { UserIdCheckParam } from 'common/requestParams/UserIdCheckParam';
import { UserPasswordEditParam } from 'common/requestParams/UserPasswordEditParam';
import { UserPasswordRecoverParam } from 'common/requestParams/UserPasswordRecoverParam';
import { UserPasswordResetParam } from 'common/requestParams/UserPasswordResetParam';
import { UserQualificationCheckParam } from 'common/requestParams/UserQualificationCheckParam';
import { UserRemoveParam } from 'common/requestParams/UserRemoveParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { UserNotificationView } from 'common/responseResults/UserNotificationView';
import { UserView } from 'common/responseResults/UserView';
import { TaskHistoryItem } from 'common/TaskHistoryItem';
import { UserState } from 'common/UserState';
import { NextFunction, Request, Response, Router } from 'express';
import { ApiError } from 'server/common/ApiError';
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
        /**
         * used to register user(admin, executor and publisher)
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}`, {
            post: this.$$userCreate.bind(this),
        } as IApiHandlers);

        /**
         * used by admin to query all users
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Query}`, {
            post: this.$$userQuery.bind(this),
        } as IApiHandlers);

        /**
         * used by executor and publisher to update their basic info
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Edit}`, {
            post: this.$$userBasicInfoEdit.bind(this),
        } as IApiHandlers);
        /**
         * used by admin to remove executor and publisher
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Remove}`, {
            post: this.$$userRemove.bind(this),
        } as IApiHandlers);
        /**
         * used by admin to enable executor and publisher
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Enable}`, {
            post: this.$$userEnable.bind(this),
        } as IApiHandlers);
        /**
         * used by admin to disable executor and publisher
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Disable}`, {
            post: this.$$userDisable.bind(this),
        } as IApiHandlers);

        /**
         * used by executor and publisher to update password
         */
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Password}/${HttpPathItem.Edit}`, {
                post: this.$$userPasswordEdit.bind(this),
            } as IApiHandlers);

        /**
         * used by admin to reset user password
         */
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Password}/${HttpPathItem.Reset}`, {
                post: this.$$userPasswordReset.bind(this),
            } as IApiHandlers);

        /**
         * used by executor or publisher to notify the admin to reset password
         */
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.User}/${HttpPathItem.Password}/${HttpPathItem.Recover}`, {
                post: this.$$userPasswordRecover.bind(this),
            } as IApiHandlers);

        /**
         * used by executor or publisher to update the account info which will not trigger the audit progress
         */
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
        /**
         * used by publisher to query owned templates
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Template}/${HttpPathItem.Query}`, {
            post: this.$$templateQuery.bind(this),
        } as IApiHandlers);

        /**
         * used by publisher to remove owned template
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Template}/${HttpPathItem.Remove}`, {
            post: this.$$templateRemove.bind(this),
        } as IApiHandlers);

        /**
         * used by publisher owner to update temlate
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Template}/${HttpPathItem.Edit}`, {
            post: this.$$templateBasicInfoEdit.bind(this),
        } as IApiHandlers);
        // #endregion

        // #region -- build file API
        /**
         * used by executor and publisher and admin to upload very kind of files(images)
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.File}`, {
            post: this.$$fileUpload.bind(this),
        } as IApiHandlers,
            UploadType.File);

        /**
         * used by executor and publisher and admin to download very kind of files(images)
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.File}/${HttpPathItem.Download}`, {
            post: this.$$fileDownload.bind(this),
        } as IApiHandlers);
        // #endregion

        // #region -- build session API
        /**
         * used to login
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Session}`, {
            post: this.$$sessionCreate.bind(this),
        } as IApiHandlers);
        /**
         * used to check whether it is in login state
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Session}/${HttpPathItem.Query}`, {
            post: this.$$sessionQuery.bind(this),
        } as IApiHandlers);
        /**
         * used to do logout
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Session}/${HttpPathItem.Remove}`, {
            post: this.$$sessionRemove.bind(this),
        } as IApiHandlers);
        // #endregion

        // #region -- build Task Api
        // #region [SubRegion] -- -- Apply

        /**
         * used by executor to apply a task
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Apply}`, {
            post: this.$$taskApply.bind(this),
        } as IApiHandlers);

        /**
         * used by executor to release apply
         */
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Apply}/${HttpPathItem.Remove}`, {
                post: this.$$taskApplyRemove.bind(this),
            } as IApiHandlers);

        /**
         * used by admin to audit task executor info
         */
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Executor}/${HttpPathItem.Audit}`, {
                post: this.$$taskExecutorAudit.bind(this),
            } as IApiHandlers);

        /**
         * used by admin to audit executor margin 
         */
        apiBuilder.buildApiForPath(
            `/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Margin}/${HttpPathItem.Audit}`, {
                post: this.$$taskMarginAudit.bind(this),
            } as IApiHandlers);

        // #endregion

        // #region [SubRegion] -- -- Task
        /**
         * used by pubisher to create task
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Create}`, {
            post: this.$$taskCreate.bind(this),
        } as IApiHandlers);
        /**
         * used by admin/publisher/executor to query available tasks
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Query}`, {
            post: this.$$taskQuery.bind(this),
        } as IApiHandlers);
        /**
         * used by publisher to edit the task before submit
         */
        apiBuilder.buildApiForPath(`/${HttpPathItem.Api}/${HttpPathItem.Task}/${HttpPathItem.Edit}`, {
            post: this.$$taskBasicInfoEdit.bind(this),
        } as IApiHandlers);
        /**
         * used by publisher owner to remove the task before submit
         */
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
                post: this.$$executorReceiptNotRequired.bind(this),
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
        const reqParam: UserCreateParam = RequestUtils.replaceNullWithObject(req.body) as UserCreateParam;
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
     * user business props which need to be audited
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$userBasicInfoEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserBasicInfoEditParam = RequestUtils.replaceNullWithObject(req.body) as UserBasicInfoEditParam;
        // only admin or self user can update himself
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$basicInfoEdit(reqParam, currentUser);
        res.json(apiResult).end();
    }

    /**
     * user system account props which don't need to be audited
     */
    private async $$userAccountInfoEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserAccountInfoEditParam = RequestUtils.replaceNullWithObject(
            req.body) as UserAccountInfoEditParam;
        // only admin or self user can update himself
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$accountInfoEdit(reqParam, currentUser);
        res.json(apiResult).end();
    }
    /**
     * password change
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$userPasswordEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserPasswordEditParam = RequestUtils.replaceNullWithObject(req.body) as UserPasswordEditParam;
        // only admin or self user can update himself
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        await UserRequestHandler.$$passwordEdit(reqParam, currentUser);
        res.json(apiResult).end();
    }

    /**
     * user password reset by admin
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$userPasswordReset(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserPasswordResetParam = RequestUtils.replaceNullWithObject(req.body) as UserPasswordResetParam;
        // only admin or self user can update himself
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$passwordReset(reqParam, currentUser);
        res.json(apiResult).end();
    }

    /**
     * password reset by userself
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$userPasswordRecover(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserPasswordRecoverParam = RequestUtils.replaceNullWithObject(
            req.body) as UserPasswordRecoverParam;
        await UserRequestHandler.$$passwordRecover(reqParam);
        res.json(apiResult).end();
    }

    /**
     * user removed by admin
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$userRemove(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserRemoveParam = RequestUtils.replaceNullWithObject(req.body) as UserRemoveParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const view: UserView | null = await UserRequestHandler.$$remove(reqParam, currentUser);
        if (view != null) {
            apiResult.data = view;
        } else {
            apiResult.code = ApiResultCode.DbNotFound;
        }
        res.json(apiResult).end();
    }
    /**
     * user info or qualification check
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$userCheck(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const reqParam: UserQualificationCheckParam | UserIdCheckParam =
            RequestUtils.replaceNullWithObject(req.body);
        apiResult.data = await UserRequestHandler.$$check(reqParam, currentUser);
        res.json(apiResult).end();
    }

    /**
     * enable user by admin
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$userEnable(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserEnableParam = RequestUtils.replaceNullWithObject(req.body) as UserEnableParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$enableOrDisable(reqParam.uid, UserState.Enabled, currentUser);
        res.json(apiResult).end();
    }

    /**
     * disable user by admin
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$userDisable(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: UserDisableParam = RequestUtils.replaceNullWithObject(req.body) as UserDisableParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await UserRequestHandler.$$enableOrDisable(reqParam.uid, UserState.Disabled, currentUser);
        res.json(apiResult).end();
    }
    // #endregion

    // #region -- Template relative API entry
    /**
     * used by publisher to query all owned templates
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$templateQuery(req: Request, res: Response, next: NextFunction) {
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        apiResult.data = await TemplateRequestHandler.$$query(currentUser);
        res.json(apiResult).end();
    }
    /**
     * used by template owner to remove template
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$templateRemove(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TemplateRemoveParam = RequestUtils.replaceNullWithObject(req.body) as TemplateRemoveParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await TemplateRequestHandler.$$remove(reqParam, currentUser);
        res.json(apiResult).end();
    }

    /**
     * used by publisher owner to update temlate
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$templateBasicInfoEdit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TemplateEditParam = RequestUtils.replaceNullWithObject(req.body) as TemplateEditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await TemplateRequestHandler.$$basicInfoEdit(reqParam, currentUser);
        res.json(apiResult).end();
    }
    // #endregion

    // #region -- File relative API entry
    /**
     * upload file with or without optional datas(i.e. corresponding DBObjects), e.g. 
     * #, template file with a new template to create a new template
     * #, template file without template object to update the template file
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$fileUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: FileUploadParam = RequestUtils.replaceNullWithObject(req.body) as FileUploadParam;
        if (req.file == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'No file prop in Request');
        }

        if (reqParam.scenario == null || isNaN(reqParam.scenario)) {
            throw new ApiError(ApiResultCode.InputInvalidFileScenario, JSON.stringify(reqParam));
        }
        reqParam.scenario = Number.parseInt(reqParam.scenario as any, 10);
        let currentDBUser: UserObject;
        switch (reqParam.scenario) {
            case FileAPIScenario.UploadQualificationTemplate:
            case FileAPIScenario.UploadQualification:
                // for admin to upload the qualification as template
                // for executor and publisher to upload themself qualification file
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$uploadQualificationFile(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.CreateTaskTemplate:
                //  used by publisher to create template
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
                // user register related image files upload
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$uploadUserIdImages(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadTaskResult:
                // used by executor to upload task result
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$uploadTaskResult(req.file, reqParam, currentDBUser);
                break;
            // used by publisher to upload the task deposit
            case FileAPIScenario.UploadTaskDeposit:
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$uploadTaskDepositImage(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadTaskMargin:
                //  used by executor to upload task margin
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$uploadTaskMarginImage(req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadTaskExecutorPay:
                // used by admin to upload the Executor payment image
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$uploadTaskExecutorPaymentImage(
                    req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadExecutorTaskReceipt:
                //  used by admin to upload the executor receipt
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$uploadExecutorReceiptImage(
                    req.file, reqParam, currentDBUser);
                break;
            case FileAPIScenario.UploadTaskRefund:
                // used by admin to upload the task deposit or margin refund
                currentDBUser = await this.$$getCurrentUser(req);
                apiResult.data = await FileRequestHandler.$$uploadRefundImage(
                    req.file, reqParam, currentDBUser);
                break;
            default:
                throw new ApiError(ApiResultCode.InputInvalidFileScenario, JSON.stringify(reqParam));
        }
        res.json(apiResult).end();
    }

    /**
     * used by user to download every kinds of file(image)
     * @param req 
     * @param res 
     * @param next 
     */
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
        const reqParam: SessionCreateParam = RequestUtils.replaceNullWithObject(req.body) as SessionCreateParam;
        const loginUser: UserView = await SessionRequestHandler.$$sessionCreate(reqParam, res) as UserView;
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
     * used by publisher to create task
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskCreate(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskCreateParam = RequestUtils.replaceNullWithObject(req.body) as TaskCreateParam;
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
        const reqParam: TaskHistoryQueryParam = RequestUtils.replaceNullWithObject(req.body) as TaskHistoryQueryParam;
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
        const reqParam: TaskBasicInfoEditParam = RequestUtils.replaceNullWithObject(req.body) as TaskBasicInfoEditParam;
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
        const reqParam: TaskRemoveParam = RequestUtils.replaceNullWithObject(req.body) as TaskRemoveParam;
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
        const reqParam: TaskApplyParam = RequestUtils.replaceNullWithObject(req.body) as TaskApplyParam;
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
        const reqParam: TaskApplyRemoveParam = RequestUtils.replaceNullWithObject(req.body) as TaskApplyRemoveParam;
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
        const reqParam: TaskResultCheckParam = RequestUtils.replaceNullWithObject(req.body) as TaskResultCheckParam;
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
        const reqParam: TaskAuditParam = RequestUtils.replaceNullWithObject(req.body) as TaskAuditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$resultAudit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }

    private async $$taskInfoAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskAuditParam = RequestUtils.replaceNullWithObject(req.body) as TaskAuditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$infoAudit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }
    private async $$taskDepositAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskAuditParam = RequestUtils.replaceNullWithObject(req.body) as TaskAuditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$depositAudit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }

    /**
     * used by admin to audit the executor info who is applying the task
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$taskExecutorAudit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskAuditParam = RequestUtils.replaceNullWithObject(req.body) as TaskAuditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        apiResult.data = await TaskRequestHandler.$$executorAudit(reqParam, currentUser);
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
        const reqParam: TaskAuditParam = RequestUtils.replaceNullWithObject(req.body) as TaskAuditParam;
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
        const reqParam: TaskAuditParam = RequestUtils.replaceNullWithObject(req.body) as TaskAuditParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$submit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }

    /**
     * used by admin to set publisher visit
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$publisherVisit(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskPublisherVisitParam = RequestUtils.replaceNullWithObject(
            req.body) as TaskPublisherVisitParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$publisherVisit(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }

    /**
     * used by admin to set the executor receipt not required
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$executorReceiptNotRequired(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const reqParam: TaskExecutorReceiptNotRequiredParam = RequestUtils.replaceNullWithObject(
            req.body) as TaskExecutorReceiptNotRequiredParam;
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const taskView: TaskView = await TaskRequestHandler.$$executorReceiptNotRequired(reqParam, currentUser);
        apiResult.data = taskView;
        res.json(apiResult).end();
    }
    // #endregion

    // #region -- notification relative API
    /**
     * query all owned notification
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$notificationQuery(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const views: UserNotificationView[] | undefined = await NotificationRequestHandler.$$query(currentUser);
        apiResult.data = views;
        res.json(apiResult).end();
    }

    /**
     * set notification as read
     * @param req 
     * @param res 
     * @param next 
     */
    private async $$notificationRead(req: Request, res: Response, next: NextFunction) {
        const apiResult: ApiResult = { code: ApiResultCode.Success };
        const currentUser: UserObject = await this.$$getCurrentUser(req);
        const reqParam: NotificationReadParam = RequestUtils.replaceNullWithObject(req.body) as NotificationReadParam;
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
