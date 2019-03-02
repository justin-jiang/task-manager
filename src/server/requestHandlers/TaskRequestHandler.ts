import { CheckState } from 'common/CheckState';
import { keysOfTaskBasicCommon } from 'common/commonDataObjects/TaskBasicCommon';
import { CommonUtils } from 'common/CommonUtils';
import { IQueryConditions } from 'common/IQueryConditions';
import { NotificationType } from 'common/NotificationType';
import { FileRemoveParam } from 'common/requestParams/FileRemoveParam';
import { TaskApplyCheckParam } from 'common/requestParams/TaskApplyCheckParam';
import { TaskApplyParam } from 'common/requestParams/TaskApplyParam';
import { TaskApplyRemoveParam } from 'common/requestParams/TaskApplyRemoveParam';
import { TaskAuditParam } from 'common/requestParams/TaskAuditParam';
import { TaskBasicInfoEditParam } from 'common/requestParams/TaskBasicInfoEditParam';
import { TaskCreateParam } from 'common/requestParams/TaskCreateParam';
import { TaskHistoryQueryParam } from 'common/requestParams/TaskHistoryQueryParam';
import { TaskPublisherVisitParam } from 'common/requestParams/TaskPublisherVisitParam';
import { TaskRemoveParam } from 'common/requestParams/TaskRemoveParam';
import { TaskSubmitParam } from 'common/requestParams/TaskSubmitParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { keysOfTaskView, TaskView } from 'common/responseResults/TaskView';
import { TaskHistoryItem } from 'common/TaskHistoryItem';
import { TaskState } from 'common/TaskState';
import { ApiError } from 'server/common/ApiError';
import { TaskApplicationModelWrapper } from 'server/dataModels/TaskApplicationModelWrapper';
import { TaskModelWrapper } from 'server/dataModels/TaskModelWrapper';
import { UserModelWrapper } from 'server/dataModels/UserModelWrapper';
import { UserNotificationModelWrapper } from 'server/dataModels/UserNotificationModelWrapper';
import { TaskApplicationObject } from 'server/dataObjects/TaskApplicationObject';
import { TaskObject } from 'server/dataObjects/TaskObject';
import { UserNotificationObject } from 'server/dataObjects/UserNotificationObject';
import { UserObject } from 'server/dataObjects/UserObject';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { FileRequestHandler } from 'server/requestHandlers/FileRequestHandler';
import { NotificationRequestHandler } from './NotificationRequestHandler';
import { RequestUtils } from './RequestUtils';

export class TaskRequestHandler {
    // #region -- create, query and remove
    /**
     * publisher creates task
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$create(reqParam: TaskCreateParam, currentUser: UserObject): Promise<TaskView> {
        // only publisher can public task
        RequestUtils.readyPublisherCheck(currentUser);

        // only pickup params which appear in TaskCreateParam
        let dbObj: TaskObject = RequestUtils.pickUpKeysByModel(reqParam, new TaskCreateParam(true));
        dbObj.uid = CommonUtils.getUUIDForMongoDB();
        dbObj.createTime = Date.now();
        dbObj.publisherUid = currentUser.uid;
        // create the created history item
        dbObj.histories = [];
        dbObj.histories.push({
            uid: CommonUtils.getUUIDForMongoDB(),
            createTime: dbObj.createTime,
            state: TaskState.Created,
            description: '',
        } as TaskHistoryItem);
        dbObj.state = TaskState.Created;
        dbObj = await TaskModelWrapper.$$create(dbObj) as TaskObject;
        return await this.$$convertToDBView(dbObj);
    }

    /**
     * pulisher, executor or admin to query tasks
     * @param currentUser 
     */
    public static async $$query(currentUser: UserObject): Promise<TaskView[]> {
        if (!CommonUtils.isUserReady(currentUser)) {
            throw new ApiError(ApiResultCode.AuthUserNotReady,
                `User:${currentUser.name} state(${currentUser.state}) is not ready`);
        }

        const isExecutor: boolean = CommonUtils.isExecutor(currentUser.roles);
        const isPublisher: boolean = CommonUtils.isPublisher(currentUser.roles);

        const queryCondition: IQueryConditions = {};
        if (isExecutor) {
            // for executor, only can query the task 
            // 1, whose state is ReadyToAppy or 
            // 2, whose applicantUid is current user or
            // 3, whose executorUid is current user
            queryCondition.$or = [];
            queryCondition.$or.push({ state: TaskState.ReadyToApply } as TaskObject);
            queryCondition.$or.push({ applicantUid: currentUser.uid } as TaskObject);
            queryCondition.$or.push({ executorUid: currentUser.uid } as TaskObject);
        } else if (isPublisher) {
            // for publisher, only can query task published by current user
            queryCondition.$or = [];
            queryCondition.$or.push({ publisherUid: currentUser.uid } as TaskObject);
        }

        return await TaskRequestHandler.$$find(queryCondition, currentUser);
    }

    /**
     * query specified task history
     * used by publisher owner or admin or executor
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$queryHistory(
        reqParam: TaskHistoryQueryParam,
        currentUser: UserObject): Promise<TaskHistoryItem[]> {
        if (!CommonUtils.isUserReady(currentUser)) {
            throw new ApiError(ApiResultCode.AuthUserNotReady,
                `User:${currentUser.name} state(${currentUser.state}) is not ready`);
        }
        const dbObj: TaskObject = await TaskModelWrapper.$$findOne({ uid: reqParam.uid } as TaskObject) as TaskObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `task:${reqParam.uid} Not Found`);
        }

        if (CommonUtils.isPublisher(currentUser.roles) && dbObj.publisherUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden,
                `Publisher:${currentUser.name} not owner of task:${dbObj.name}`);
        }
        if (CommonUtils.isExecutor(currentUser.roles) && dbObj.applicantUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden,
                `task:${dbObj.name} Not Assigned to Executor:${currentUser.name}`);
        }
        return dbObj.histories as TaskHistoryItem[];
    }

    /**
     * used by publisher to remove the task
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$remove(reqParam: TaskRemoveParam, currentUser: UserObject): Promise<TaskView> {
        let resultFileUid: string | undefined;
        let publisherUid: string | undefined;
        const dbObj: TaskObject | null = await TaskModelWrapper.$$findOne(
            { uid: reqParam.uid } as TaskObject) as TaskObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `task id:${reqParam.uid}`);
        }
        resultFileUid = dbObj.resultFileUid;
        publisherUid = dbObj.publisherUid;

        // only admin or ownered publisher can remove task
        if (!CommonUtils.isAdmin(currentUser.roles) && currentUser.uid !== publisherUid) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }

        if (resultFileUid != null) {
            const fileDeleteParam: FileRemoveParam = {
                fileId: resultFileUid,
            } as FileRemoveParam;
            LoggerManager.debug(`delete all result files of task:${reqParam.uid}`);
            await FileRequestHandler.$$deleteOne(fileDeleteParam);
        }
        // remove task apply record
        await TaskApplicationModelWrapper.$$deleteOne({ taskUid: reqParam.uid } as TaskApplicationObject);

        // remove task
        await TaskModelWrapper.$$deleteOne({ uid: dbObj.uid } as TaskObject);
        return await this.$$convertToDBView(dbObj);
    }
    // #endregion


    // #region -- edit
    /**
     * publisher to edit the basic info
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$basicInfoEdit(
        reqParam: TaskBasicInfoEditParam, currentUser: UserObject): Promise<TaskView | null> {
        // only ready publisher can apply task
        RequestUtils.readyPublisherCheck(currentUser);
        if (CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'TaskBasicInfoEditParam.uid');
        }

        const updatedProps: TaskObject = RequestUtils.pickUpKeysByModel(reqParam, new TaskBasicInfoEditParam(true));
        if (Object.keys(updatedProps).length === 0) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'TaskBasicInfoEditParam');
        }

        const updatedDBObj: TaskObject | null = await TaskModelWrapper.$$findOneAndUpdate(
            { uid: updatedProps.uid } as TaskObject, updatedProps) as TaskObject | null;

        if (updatedDBObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `TaskUid:${updatedProps.uid}`);
        } else {
            return await this.$$convertToDBView(updatedDBObj);
        }
    }

    /**
     * submit the task to admin for audit
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$submit(reqParam: TaskSubmitParam, currentUser: UserObject): Promise<TaskView> {
        // only ready publisher can apply task
        RequestUtils.readyPublisherCheck(currentUser);

        const dbObj: TaskObject | null = await TaskModelWrapper.$$findOne(
            { uid: reqParam.uid } as TaskObject) as TaskObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `task id:${reqParam.uid}`);
        }
        if (dbObj.state !== TaskState.Created) {
            throw new ApiError(ApiResultCode.AuthForbidden,
                `task:(${dbObj.name}) state:(${dbObj.state}) is not expected:(${TaskState.Created})`);
        }
        const updatedProps: TaskObject = new TaskObject();
        updatedProps.state = TaskState.Submitted;
        updatedProps.histories = dbObj.histories;
        (updatedProps.histories as TaskHistoryItem[]).push({
            createTime: Date.now(),
            description: '',
            state: TaskState.Submitted,
            uid: CommonUtils.getUUIDForMongoDB(),
        } as TaskHistoryItem);

        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, updatedProps);
        // create sumbit history item


        Object.assign(dbObj, updatedProps);
        return await this.$$convertToDBView(dbObj);
    }

    /**
     * used by admin to audit the task info
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$infoAudit(reqParam: TaskAuditParam, currentUser: UserObject): Promise<TaskView> {
        return await this.$$taskAudit(
            reqParam,
            TaskState.Submitted /* expected state */,
            TaskState.InfoPassed /* target approve state */,
            TaskState.InfoAuditDenied /* target deny state */,
            TaskState.Created /* gobackState */);
    }
    /**
     * Executor applies specified task
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$apply(reqParam: TaskApplyParam, currentUser: UserObject): Promise<TaskView> {
        // only ready executor can apply task
        RequestUtils.readyExecutorCheck(currentUser);
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(reqParam.uid as string, TaskState.ReadyToApply);

        // here the TaskApplicationModel likes a locker, only the one who creates it successfully
        // can apply the task
        const taskAppObj: TaskApplicationObject = new TaskApplicationObject();
        taskAppObj.uid = CommonUtils.getUUIDForMongoDB();
        taskAppObj.taskUid = dbObj.uid;
        taskAppObj.applicantUid = currentUser.uid;
        await TaskApplicationModelWrapper.$$create(taskAppObj);

        // update task props
        const dbObjWithUpdatedProps: TaskObject = new TaskObject();
        dbObjWithUpdatedProps.uid = reqParam.uid as string;
        dbObjWithUpdatedProps.templateFileUid = currentUser.uid;
        dbObjWithUpdatedProps.state = TaskState.Applying;
        dbObjWithUpdatedProps.applicantUid = currentUser.uid;

        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, dbObjWithUpdatedProps);

        await TaskModelWrapper.$$addHistoryItem(dbObj.uid as string, TaskState.Applying);
        Object.assign(dbObj, dbObjWithUpdatedProps);
        return await this.$$convertToDBView(dbObj);
    }
    /**
     * used by executor to release the task apply
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$applyRemove(reqParam: TaskApplyRemoveParam, currentUser: UserObject): Promise<TaskView> {
        RequestUtils.readyExecutorCheck(currentUser);
        if (CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'TaskAuditParam.uid');
        }
        const dbObj: TaskObject | null = await TaskModelWrapper.$$findOne(
            { uid: reqParam.uid } as TaskObject) as TaskObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `task id:${reqParam.uid}`);
        }

        if (dbObj.state !== TaskState.Applying) {
            throw new ApiError(ApiResultCode.AuthForbidden,
                `task(${reqParam.uid}) state(${dbObj.state}) is not expected(${TaskState.Applying})`);
        }

        if (dbObj.applicantUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden,
                `executor:${currentUser.uid} is not the task:${dbObj.uid} applicant`);
        }

        // update the task state and executorUid 
        const dbObjWithUpdatedProps: TaskObject = new TaskObject();
        dbObjWithUpdatedProps.state = TaskState.ReadyToApply;
        dbObjWithUpdatedProps.applicantUid = '';
        await TaskModelWrapper.$$updateOne(
            { uid: dbObj.uid } as TaskObject, dbObjWithUpdatedProps);

        // delete the apply record
        await TaskApplicationModelWrapper.$$deleteByTaskId(dbObj.uid as string);

        Object.assign(dbObj, dbObjWithUpdatedProps);
        return await this.$$convertToDBView(dbObj);
    }
    /**
     * used by publisher to approve or deny the task apply
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$applyCheck(reqParam: TaskApplyCheckParam, currentUser: UserObject): Promise<TaskView> {
        if (!CommonUtils.isUserReady(currentUser)) {
            LoggerManager.error(`User(${currentUser.name}) is not ready`);
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        const dbObj: TaskObject | null = await TaskModelWrapper.$$findOne(
            { uid: reqParam.uid } as TaskObject) as TaskObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `task id:${reqParam.uid}`);
        }
        if (currentUser.uid !== dbObj.publisherUid) {
            LoggerManager.error(`User(${currentUser.name}) is not task(${dbObj.publisherUid}) publisher`);
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        if (dbObj.state !== TaskState.ReadyToAuditApply) {
            LoggerManager.error(
                `task(${reqParam.uid}) state(${dbObj.state}) is not expected(${TaskState.ReadyToAuditApply})`);
            throw new ApiError(ApiResultCode.AuthForbidden, 'task state is not expected');
        }

        // update the task state and executorUid 
        const dbObjWithUpdatedProps: TaskObject = new TaskObject();
        if (reqParam.pass === true) {
            dbObjWithUpdatedProps.executorUid = dbObj.applicantUid;
            dbObjWithUpdatedProps.state = TaskState.Assigned;
            // create task-denied notification
            const userNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
                NotificationType.TaskApplyAccepted,
                dbObj.applicantUid as string,
                dbObj.uid as string,
                `发布者接受了你对任务（${dbObj.name}）的申请。`);
            await UserNotificationModelWrapper.$$create(userNotification);
        } else {
            dbObjWithUpdatedProps.state = TaskState.ReadyToApply;
            dbObjWithUpdatedProps.applicantUid = '';
            // create task-denied notification
            const reason: string | undefined = reqParam.note || '无';
            const userNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
                NotificationType.TaskApplyDenied,
                dbObj.applicantUid as string,
                dbObj.uid as string,
                `发布者拒绝了你对任务（${dbObj.name}）的申请。理由：${reason}`);
            await UserNotificationModelWrapper.$$create(userNotification);
        }
        await TaskModelWrapper.$$updateOne(
            { uid: dbObj.uid } as TaskObject, dbObjWithUpdatedProps);

        // delete the apply record
        await TaskApplicationModelWrapper.$$deleteByTaskId(reqParam.uid as string);

        Object.assign(dbObj, dbObjWithUpdatedProps);
        return await this.$$convertToDBView(dbObj);
    }

    /**
     * used by publisher to approve or deny the task apply from executor
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$applyAudit(reqParam: TaskAuditParam, currentUser: UserObject): Promise<TaskView> {
        RequestUtils.adminCheck(currentUser);
        const dbObj = await this.$$taskAudit(
            reqParam,
            TaskState.ReadyToAuditApply /* expected state */,
            TaskState.Assigned /* target approve state */,
            TaskState.ApplyAuditDenied /* target deny state */,
            TaskState.ReadyToApply /* go back state*/,
            {} as TaskObject /* updated props after approve*/,
            { applicantUid: '' } as TaskObject /* updated props after deny*/);
        if (reqParam.auditState === CheckState.Checked) {
            const executorNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
                NotificationType.TaskApplyAuditAccepted,
                dbObj.applicantUid as string,
                dbObj.uid as string,
                `你对任务（${dbObj.name}）的申请已通过`);
            await UserNotificationModelWrapper.$$create(executorNotification);
        } else {
            const reason: string | undefined = reqParam.note || '无';
            const userNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
                NotificationType.TaskApplyAuditDenied,
                dbObj.applicantUid as string,
                dbObj.uid as string,
                `你对任务（${dbObj.name}）的申请，已被管理员拒绝，原因：${reason}`);
            await UserNotificationModelWrapper.$$create(userNotification);
        }

        return dbObj;
    }

    /**
     * used by admin to audit the task deposit
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$depositAudit(reqParam: TaskAuditParam, currentUser: UserObject): Promise<TaskView> {
        RequestUtils.adminCheck(currentUser);
        return await this.$$taskAudit(
            reqParam,
            TaskState.Deposited /* expected state */,
            TaskState.ReadyToApply /* target approve state */,
            TaskState.DepositAuditDenied /* target deny state */,
            TaskState.InfoPassed /* go back state*/);
    }

    /**
     * used by admin to approve or deny the task result from executor
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$resultAudit(reqParam: TaskAuditParam, currentUser: UserObject) {
        RequestUtils.adminCheck(currentUser);
        const dbObj: TaskView = await this.$$taskAudit(
            reqParam,
            TaskState.ResultUploaded /* expected state */,
            TaskState.ResultAudited /* target approve state */,
            TaskState.ResultAuditDenied /* target deny state */,
            TaskState.Assigned /* go back state*/,
            { adminSatisfiedStar: reqParam.satisfiedStar } as TaskObject /* updated props after approve*/,
            {} as TaskObject /* updated props after deny*/);

        if (reqParam.auditState === CheckState.Checked) {
            const userNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
                NotificationType.TaskApplyAuditAccepted,
                dbObj.executorUid as string,
                dbObj.uid as string,
                `你对任务（${dbObj.name}）的执行结果，已被平台审核通过`);
            await UserNotificationModelWrapper.$$create(userNotification);
        } else {
            // create notification to executor
            const reason: string = reqParam.note || '无';
            const userNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
                NotificationType.TaskAuditDenied,
                dbObj.executorUid as string,
                dbObj.uid as string,
                `你对任务（${dbObj.name}）的执行结果，已被平台拒绝，原因：${reason}`);
            await UserNotificationModelWrapper.$$create(userNotification);
        }
        return dbObj;
    }

    /**
     * used by publisher to approve or deny the task result from executor
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$resultCheck(reqParam: TaskAuditParam, currentUser: UserObject) {
        RequestUtils.readyPublisherCheck(currentUser);
        const dbObj: TaskView = await this.$$taskAudit(
            reqParam,
            TaskState.ResultAudited /* expected state */,
            TaskState.ResultChecked /* target approve state */,
            TaskState.ResultCheckDenied /* target deny state */,
            TaskState.Assigned /* go back state*/,
            { publisherResultSatisfactionStar: reqParam.satisfiedStar } as TaskObject /* updated props after approve*/,
            {} as TaskObject /* updated props after deny*/);

        if (reqParam.auditState === CheckState.Checked) {
            const userNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
                NotificationType.TaskResultAccepted,
                dbObj.executorUid as string,
                dbObj.uid as string,
                `你对任务（${dbObj.name}）的执行结果，已被雇主通过`);
            await UserNotificationModelWrapper.$$create(userNotification);
        } else {
            // create notification to executor
            const reason: string = reqParam.note || '无';
            const userNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
                NotificationType.TaskResultDenied,
                dbObj.executorUid as string,
                dbObj.uid as string,
                `你对任务（${dbObj.name}）的执行结果，已被雇主拒绝，原因：${reason}`);
            await UserNotificationModelWrapper.$$create(userNotification);
        }
        return dbObj;
    }

    /**
     * used by admin to record the publisher star and note
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$publisherVisit(reqParam: TaskPublisherVisitParam, currentUser: UserObject) {
        RequestUtils.adminCheck(currentUser);
        const auditParam: TaskAuditParam = {
            auditState: CheckState.Checked,
            uid: reqParam.uid,
        };
        return await this.$$taskAudit(
            auditParam,
            TaskState.ResultChecked /* expected state */,
            TaskState.PublisherVisited /* target approve state */,
            TaskState.None /* target deny state */,
            TaskState.None /* go back state*/,
            RequestUtils.pickUpKeysByModel(
                reqParam, new TaskPublisherVisitParam(true)) /* updated props after approve*/,
            {} as TaskObject /* updated props after deny*/);
    }
    // #endregion



    /**
     * convert from TaskObject to TaskView
     * @param dbObj 
     */
    public static async  $$convertToDBView(dbObj: TaskObject, currentUser?: UserObject): Promise<TaskView> {
        const view: TaskView = new TaskView();
        let returnedKeys: string[] = keysOfTaskView;
        if (currentUser != null &&
            CommonUtils.isExecutor(currentUser.roles) &&
            dbObj.executorUid !== currentUser.uid) {
            // for executor who is not the current task executor, we only return the basic info
            returnedKeys = keysOfTaskBasicCommon;
        }
        returnedKeys.forEach((key: string) => {
            if (key in dbObj) {
                view[key] = dbObj[key];
            }
        });

        // handle computed keys
        let refDBObj: UserObject | null;
        if (!CommonUtils.isNullOrEmpty(view.applicantUid)) {
            refDBObj = await UserModelWrapper.$$getOneFromCache(view.applicantUid as string) as UserObject;
            if (refDBObj != null) {
                view.applicantName = refDBObj.name;
            }
        }
        if (!CommonUtils.isNullOrEmpty(view.executorUid)) {
            refDBObj = await UserModelWrapper.$$getOneFromCache(view.executorUid as string) as UserObject;
            if (refDBObj != null) {
                view.executorName = refDBObj.name;
            }
        }
        if (!CommonUtils.isNullOrEmpty(view.publisherUid)) {
            refDBObj = await UserModelWrapper.$$getOneFromCache(view.publisherUid as string) as UserObject;
            if (refDBObj != null) {
                view.publisherName = refDBObj.name;
            }
        }
        return view;
    }

    // #region -- internal props and methods
    private static async $$find(conditions: IQueryConditions, currentUser: UserObject): Promise<TaskView[]> {
        const dbObjs: TaskObject[] = await TaskModelWrapper.$$find(conditions, '-histories') as TaskObject[];
        const views: TaskView[] = [];
        if (dbObjs != null && dbObjs.length > 0) {
            for (const obj of dbObjs) {
                views.push(await this.$$convertToDBView(obj));
            }
        }
        return views;
    }

    private static async $$taskAudit(
        reqParam: TaskAuditParam,
        expectedState: TaskState,
        targetApproveState: TaskState,
        targetDenyState: TaskState,
        goBackState: TaskState,
        updatedPropsAfterApprove?: TaskObject,
        updatedPropsAfterDeny?: TaskObject): Promise<TaskView> {
        if (CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'TaskAuditParam.uid');
        }
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(
            reqParam.uid as string, expectedState);

        // update the task state
        const dbObjWithUpdatedProps: TaskObject = new TaskObject();
        if (reqParam.auditState === CheckState.Checked) {
            // approve
            Object.assign(dbObjWithUpdatedProps, updatedPropsAfterApprove);
            dbObjWithUpdatedProps.state = targetApproveState;
            await TaskModelWrapper.$$addHistoryItem(dbObj.uid as string, targetApproveState);

            // the followings are some logic for some special state
            switch (targetApproveState) {
                case TaskState.ReadyToApply:
                    dbObjWithUpdatedProps.publishTime = Date.now();
                    break;
                case TaskState.Assigned:
                    dbObjWithUpdatedProps.executorUid = dbObj.applicantUid;
                    break;
            }
        } else {
            // deny and return back to goBackState
            Object.assign(dbObjWithUpdatedProps, updatedPropsAfterDeny);
            dbObjWithUpdatedProps.state = goBackState;
            await TaskModelWrapper.$$addHistoryItem(
                dbObj.uid as string,
                targetDenyState,
                reqParam.note);
        }

        await TaskModelWrapper.$$updateOne(
            { uid: dbObj.uid } as TaskObject, dbObjWithUpdatedProps);

        Object.assign(dbObj, dbObjWithUpdatedProps);
        return await this.$$convertToDBView(dbObj);
    }
    // #endregion
}
