import { CheckState } from 'common/CheckState';
import { keysOfTaskBasicCommon } from 'common/commonDataObjects/TaskBasicCommon';
import { CommonUtils } from 'common/CommonUtils';
import { IQueryConditions } from 'common/IQueryConditions';
import { NotificationType } from 'common/NotificationType';
import { ReceiptState } from 'common/ReceiptState';
import { TaskApplyParam } from 'common/requestParams/TaskApplyParam';
import { TaskApplyRemoveParam } from 'common/requestParams/TaskApplyRemoveParam';
import { TaskAuditParam } from 'common/requestParams/TaskAuditParam';
import { TaskBasicInfoEditParam } from 'common/requestParams/TaskBasicInfoEditParam';
import { TaskCreateParam } from 'common/requestParams/TaskCreateParam';
import { TaskExecutorReceiptNotRequiredParam } from 'common/requestParams/TaskExecutorReceiptNotRequiredParam';
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
        let dbObj: TaskObject = RequestUtils.pickUpPropsByModel(
            reqParam, new TaskCreateParam(true), true);
        dbObj.uid = CommonUtils.getUUIDForMongoDB();
        dbObj.createTime = Date.now();
        dbObj.publisherUid = currentUser.uid;
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

        const isExecutor: boolean = CommonUtils.isExecutor(currentUser);
        const isPublisher: boolean = CommonUtils.isPublisher(currentUser);

        const queryCondition: IQueryConditions = {};
        if (isExecutor) {
            // for executor, only can query the task 
            // 1, whose state is ReadyToAppy and qualification-matched + executor-type-matched or 
            // 2, whose applicantUid is current user or
            // 3, whose executorUid is current user
            queryCondition.$or = [
                // new task with qualification condition
                {
                    $and: [
                        { minExecutorStar: { $lte: currentUser.qualificationStar } as any } as TaskObject,
                        { state: TaskState.ReadyToApply } as TaskObject,
                        { executorTypes: { $elemMatch: { $eq: currentUser.type } } as any } as TaskObject,
                    ],
                },
                // permission condition
                { applicantUid: currentUser.uid } as TaskObject,
                { executorUid: currentUser.uid } as TaskObject,

            ];
        } else if (isPublisher) {
            // for publisher, only can query task published by current user
            queryCondition.$or = [];
            queryCondition.$or.push({ publisherUid: currentUser.uid } as TaskObject);
        } else {
            // for admin, don't return the task whose state is Created
            queryCondition.$or = [];
            queryCondition.$or.push({ state: { $ne: TaskState.Created } as any } as TaskObject);
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

        if (CommonUtils.isPublisher(currentUser) && dbObj.publisherUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden,
                `Publisher:${currentUser.name} not owner of task:${dbObj.name}`);
        }
        if (CommonUtils.isExecutor(currentUser) && dbObj.applicantUid !== currentUser.uid) {
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
        let publisherUid: string;
        const dbObj = await RequestUtils.$$taskStateCheck(reqParam.uid as string);

        // task state check: only Created, Submitted state can be deleted
        if (dbObj.state !== TaskState.Created && dbObj.state !== TaskState.Submitted) {
            throw new ApiError(ApiResultCode.Logic_Task_State_Not_Matched);
        }
        publisherUid = dbObj.publisherUid as string;

        // only  ownered publisher can remove task
        if (currentUser.uid !== publisherUid) {
            throw new ApiError(ApiResultCode.Auth_Not_Task_Publisher_Onwer,
                `current user is not owner of taskUid:${dbObj.uid}`);
        }

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

        const updatedProps: TaskObject = RequestUtils.pickUpPropsByModel(
            reqParam, new TaskBasicInfoEditParam(true), true);
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
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(reqParam.uid as string, TaskState.Created);
        const updatedProps: TaskObject = new TaskObject();
        updatedProps.state = TaskState.Submitted;
        updatedProps.histories = dbObj.histories;
        (updatedProps.histories as TaskHistoryItem[]).push({
            createTime: Date.now(),
            description: '',
            state: TaskState.Submitted,
            title: `雇主提交“${dbObj.name}”任务`,
            uid: CommonUtils.getUUIDForMongoDB(),
        } as TaskHistoryItem);

        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, updatedProps);

        Object.assign(dbObj, updatedProps);
        return await this.$$convertToDBView(dbObj);
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
        const allUpdatedProps: TaskObject = new TaskObject();
        allUpdatedProps.uid = reqParam.uid as string;
        allUpdatedProps.state = TaskState.Applying;
        allUpdatedProps.applicantUid = currentUser.uid;
        allUpdatedProps.applyingDatetime = Date.now();
        await TaskModelWrapper.$$addHistoryItem(
            dbObj.uid as string,
            allUpdatedProps.state,
            CommonUtils.getStepTitleByTaskState(allUpdatedProps.state));
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, allUpdatedProps);
        Object.assign(dbObj, allUpdatedProps);
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
            TaskState.DepositUploaded /* expected state */,
            TaskState.ReadyToApply /* target approve state, should be decided in the method */,
            TaskState.InfoAuditDenied /* target deny state */,
            TaskState.Created /* gobackState */,
            { infoAuditState: CheckState.Checked } as TaskObject,
            { infoAuditState: CheckState.FailedToCheck, infoAuditNote: reqParam.note } as TaskObject);
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
            TaskState.DepositUploaded /* expected state */,
            TaskState.ReadyToApply /* target approve state, decided in method */,
            TaskState.DepositAuditDenied /* target deny state */,
            TaskState.Submitted /* go back state*/,
            { depositAuditState: CheckState.Checked } as TaskObject,
            { depositAuditState: CheckState.FailedToCheck, depositAuditNote: reqParam.note } as TaskObject);
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

        // delete the apply record
        await TaskApplicationModelWrapper.$$deleteByTaskId(dbObj.uid as string);

        // update the task state and executorUid 
        const dbObjWithUpdatedProps: TaskObject = new TaskObject();
        dbObjWithUpdatedProps.state = TaskState.ReadyToApply;
        dbObjWithUpdatedProps.applicantUid = '';
        await TaskModelWrapper.$$updateOne(
            { uid: dbObj.uid } as TaskObject, dbObjWithUpdatedProps);

        Object.assign(dbObj, dbObjWithUpdatedProps);
        return await this.$$convertToDBView(dbObj);
    }


    /**
     * used by admin to approve or deny the task executor qualification
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$executorAudit(reqParam: TaskAuditParam, currentUser: UserObject): Promise<TaskView> {
        // param check
        if (reqParam.auditState === CheckState.FailedToCheck &&
            CommonUtils.isNullOrEmpty(reqParam.note)) {
            // if deny, the note should not be null
            throw new ApiError(ApiResultCode.InputInvalidParam, JSON.stringify(reqParam));
        }
        // user check
        RequestUtils.adminCheck(currentUser);

        const dbObj = await this.$$taskAudit(
            reqParam,
            TaskState.MarginUploaded /* expected state */,
            TaskState.Assigned /* target approve state, will be decided in method */,
            TaskState.ExecutorAuditDenied /* target deny state */,
            TaskState.ReadyToApply /* go back state*/,
            { executorAuditState: CheckState.Checked } as TaskObject /* updated props after approve*/,
            {
                applicantUid: '',
                executorAuditState: CheckState.FailedToCheck,
                executorAuditNote: reqParam.note,
            } as TaskObject /* updated props after deny*/);
        return dbObj;
    }

    /**
     * used by admin to audit the margin from executor
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$marginAudit(reqParam: TaskAuditParam, currentUser: UserObject): Promise<TaskView> {
        RequestUtils.adminCheck(currentUser);
        const dbObj = await this.$$taskAudit(
            reqParam,
            TaskState.MarginUploaded /* expected state */,
            TaskState.Assigned /* target approve state, will be decided in method */,
            TaskState.MarginAuditDenied /* target deny state */,
            TaskState.Applying /* go back state*/,
            { marginAditState: CheckState.Checked } as TaskObject /* updated props after approve*/,
            {
                marginAditState: CheckState.FailedToCheck,
                marginAuditNote: reqParam.note,
            } as TaskObject /* updated props after deny*/);
        return dbObj;
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

        // if (reqParam.auditState === CheckState.Checked) {
        //     const userNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
        //         NotificationType.TaskApplyAuditAccepted,
        //         dbObj.executorUid as string,
        //         dbObj.uid as string,
        //         `你对任务（${dbObj.name}）的执行结果，已被平台审核通过`);
        //     await UserNotificationModelWrapper.$$create(userNotification);
        // } else {
        //     // create notification to executor
        //     const reason: string = reqParam.note || '无';
        //     const userNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
        //         NotificationType.TaskAuditDenied,
        //         dbObj.executorUid as string,
        //         dbObj.uid as string,
        //         `你对任务（${dbObj.name}）的执行结果，已被平台拒绝，原因：${reason}`);
        //     await UserNotificationModelWrapper.$$create(userNotification);
        // }
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

        // if (reqParam.auditState === CheckState.Checked) {
        //     const userNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
        //         NotificationType.TaskResultAccepted,
        //         dbObj.executorUid as string,
        //         dbObj.uid as string,
        //         `你对任务（${dbObj.name}）的执行结果，已被雇主通过`);
        //     await UserNotificationModelWrapper.$$create(userNotification);
        // } else {
        //     // create notification to executor
        //     const reason: string = reqParam.note || '无';
        //     const userNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
        //         NotificationType.TaskResultDenied,
        //         dbObj.executorUid as string,
        //         dbObj.uid as string,
        //         `你对任务（${dbObj.name}）的执行结果，已被雇主拒绝，原因：${reason}`);
        //     await UserNotificationModelWrapper.$$create(userNotification);
        // }
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
            RequestUtils.pickUpPropsByModel(
                reqParam, new TaskPublisherVisitParam(true), true) /* updated props after approve*/,
            {} as TaskObject /* updated props after deny*/);
    }

    /**
     * used by admin to give up the receipt from executor
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$executorReceiptNotRequired(
        reqParam: TaskExecutorReceiptNotRequiredParam, currentUser: UserObject) {
        // param check
        if (CommonUtils.isNullOrEmpty(reqParam.executorReceiptNote)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'executorReceiptNote cannot be null');
        }
        // user check
        RequestUtils.adminCheck(currentUser);

        // task check
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(
            reqParam.uid as string, TaskState.PublisherVisited);
        const allUpdatedProps: TaskObject = new TaskObject();
        allUpdatedProps.executorReceiptRequired = ReceiptState.NotRequired;

        // if receipt state has been set in PayToExecutor, we should keep the state consistence
        // here we expect the state should be NotRequired
        if (dbObj.executorReceiptRequired === ReceiptState.Required) {
            throw new ApiError(ApiResultCode.Logic_Receipt_State_Not_Matched);
        }

        allUpdatedProps.executorReceiptNote = reqParam.executorReceiptNote;
        // here only both receipt upload(or NotRequired) and executor payment done, 
        // we can set the TaskState.ExecutorPaid
        if (!CommonUtils.isNullOrEmpty(dbObj.payToExecutorImageUid)) {
            allUpdatedProps.state = TaskState.ExecutorPaid;
        }

        // add history item
        if (allUpdatedProps.state === TaskState.ExecutorPaid) {
            await TaskModelWrapper.$$addHistoryItem(
                dbObj.uid as string,
                TaskState.ExecutorPaid,
                CommonUtils.getStepTitleByTaskState(TaskState.ExecutorPaid));
        }
        await TaskModelWrapper.$$updateOne(
            { uid: dbObj.uid } as TaskObject, allUpdatedProps);
        Object.assign(dbObj, allUpdatedProps);
        return await this.$$convertToDBView(dbObj);
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
            CommonUtils.isExecutor(currentUser) &&
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
    /**
     * Common Logic for task audit
     * @param reqParam 
     * @param expectedState 
     * @param targetApproveState 
     * @param targetDenyState 
     * @param goBackState 
     * @param updatedPropsAfterApprove 
     * @param updatedPropsAfterDeny 
     */
    private static async $$taskAudit(
        reqParam: TaskAuditParam,
        expectedState: TaskState,
        targetApproveState: TaskState,
        targetDenyState: TaskState,
        goBackState: TaskState,
        updatedPropsAfterApprove?: TaskObject,
        updatedPropsAfterDeny?: TaskObject): Promise<TaskView> {
        if (CommonUtils.isNullOrEmpty(reqParam.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, JSON.stringify(reqParam));
        }

        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(
            reqParam.uid as string, expectedState);
        // the followings are special cases

        // update the task state
        const allUpdatedProps: TaskObject = new TaskObject();
        if (reqParam.auditState === CheckState.Checked) {
            // approve
            Object.assign(allUpdatedProps, updatedPropsAfterApprove);
            allUpdatedProps.state = targetApproveState;

            // the followings are some logic for some special state
            switch (targetApproveState) {
                case TaskState.ReadyToApply:
                    // only both infoaudit and depositadit pass, we set the state to be TaskState.ReadyToApply
                    if (allUpdatedProps.infoAuditState == null) {
                        allUpdatedProps.infoAuditState = dbObj.infoAuditState;
                    }
                    if (allUpdatedProps.depositAuditState == null) {
                        allUpdatedProps.depositAuditState = dbObj.depositAuditState;
                    }
                    if (allUpdatedProps.infoAuditState === CheckState.Checked &&
                        allUpdatedProps.depositAuditState === CheckState.Checked) {
                        allUpdatedProps.state = TaskState.ReadyToApply;
                        allUpdatedProps.publishTime = Date.now();
                    } else {
                        // if not, keep the current state
                        allUpdatedProps.state = dbObj.state;
                    }
                    break;
                case TaskState.Assigned:
                    // only both executoraudit and marginadit pass, we set the state to be TaskState.Assigned
                    if (allUpdatedProps.executorAuditState == null) {
                        allUpdatedProps.executorAuditState = dbObj.executorAuditState;
                    }
                    if (allUpdatedProps.marginAditState == null) {
                        allUpdatedProps.marginAditState = dbObj.marginAditState;
                    }
                    if (allUpdatedProps.executorAuditState === CheckState.Checked &&
                        allUpdatedProps.marginAditState === CheckState.Checked) {
                        allUpdatedProps.state = TaskState.Assigned;
                        allUpdatedProps.executorUid = dbObj.applicantUid;
                    } else {
                        // if not, keep the current state
                        allUpdatedProps.state = dbObj.state;
                    }
                    break;
                case TaskState.ExecutorPaid:

                    if (allUpdatedProps.executorReceiptRequired == null) {
                        allUpdatedProps.executorReceiptRequired = dbObj.executorReceiptRequired;
                    }
                    if (allUpdatedProps.executorReceiptNote == null) {
                        allUpdatedProps.executorReceiptNote = dbObj.executorReceiptNote;
                    }
                    if (allUpdatedProps.executorReceiptImageUid == null) {
                        allUpdatedProps.executorReceiptImageUid = dbObj.executorReceiptImageUid;
                    }
                    if (allUpdatedProps.payToExecutorImageUid == null) {
                        allUpdatedProps.payToExecutorImageUid = dbObj.payToExecutorImageUid;
                    }
                    // only both executor receipt and payment done, we can set the state to be TaskState.ExecutorPaid
                    if (
                        ((allUpdatedProps.executorReceiptRequired === ReceiptState.NotRequired &&
                            !CommonUtils.isNullOrEmpty(allUpdatedProps.executorReceiptNote)) ||
                            (allUpdatedProps.executorReceiptRequired === ReceiptState.Required &&
                                !CommonUtils.isNullOrEmpty(allUpdatedProps.executorReceiptImageUid))) &&
                        CommonUtils.isNullOrEmpty(allUpdatedProps.payToExecutorImageUid)) {
                        allUpdatedProps.state = TaskState.ExecutorPaid;
                    } else {
                        allUpdatedProps.state = dbObj.state;
                    }
                    break;
                default:
            }
            if (allUpdatedProps.state === TaskState.ExecutorPaid) {
                await TaskModelWrapper.$$addHistoryItem(
                    dbObj.uid as string,
                    targetApproveState,
                    CommonUtils.getStepTitleByTaskState(targetApproveState, targetApproveState));
            }
        } else {
            // deny and return back to goBackState
            Object.assign(allUpdatedProps, updatedPropsAfterDeny);
            allUpdatedProps.state = goBackState;
            await TaskModelWrapper.$$addHistoryItem(
                dbObj.uid as string,
                targetDenyState,
                CommonUtils.getStepTitleByTaskState(targetApproveState, targetDenyState),
                reqParam.note);
            // the followings are some logic for some special state
            switch (targetApproveState) {
                case TaskState.ReadyToApply:
                    if (allUpdatedProps.infoAuditState === CheckState.FailedToCheck) {
                        const userNotification: UserNotificationObject =
                            NotificationRequestHandler.createNotificationObject(
                                NotificationType.TaskApplyDenied,
                                dbObj.publisherUid as string,
                                dbObj.uid as string,
                                reqParam.note);
                        await UserNotificationModelWrapper.$$create(userNotification);
                    }
                    break;
            }
        }

        await TaskModelWrapper.$$updateOne(
            { uid: dbObj.uid } as TaskObject, allUpdatedProps);
        Object.assign(dbObj, allUpdatedProps);
        return await this.$$convertToDBView(dbObj);
    }
    // #endregion
}
