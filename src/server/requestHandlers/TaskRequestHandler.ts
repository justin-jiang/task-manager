import { CommonUtils } from 'common/CommonUtils';
import { IQueryConditions } from 'common/IQueryConditions';
import { FileRemoveParam } from 'common/requestParams/FileRemoveParam';
import { TaskApplyCheckParam } from 'common/requestParams/TaskApplyCheckParam';
import { TaskApplyParam } from 'common/requestParams/TaskApplyParam';
import { TaskBasicInfoEditParam } from 'common/requestParams/TaskBasicInfoEditParam';
import { TaskCreateParam } from 'common/requestParams/TaskCreateParam';
import { TaskRemoveParam } from 'common/requestParams/TaskRemoveParam';
import { TaskResultCheckParam } from 'common/requestParams/TaskResultCheckParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { keysOfITaskView, TaskView } from 'common/responseResults/TaskView';
import { TaskState } from 'common/TaskState';
import { ApiError } from 'server/common/ApiError';
import { TaskApplicationModelWrapper } from 'server/dataModels/TaskApplicationModelWrapper';
import { TaskModelWrapper } from 'server/dataModels/TaskModelWrapper';
import { UserModelWrapper } from 'server/dataModels/UserModelWrapper';
import { TaskApplicationObject } from 'server/dataObjects/TaskApplicationObject';
import { TaskObject } from 'server/dataObjects/TaskObject';
import { UserObject } from 'server/dataObjects/UserObject';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { FileRequestHandler } from 'server/requestHandlers/FileRequestHandler';
import { UserNotificationObject } from 'server/dataObjects/UserNotificationObject';
import { NotificationType } from 'common/NotificationType';
import { UserNotificationModelWrapper } from 'server/dataModels/UserNotificationModelWrapper';
import { NotificationRequestHandler } from './NotificationRequestHandler';

export class TaskRequestHandler {

    /**
     * publisher creates task
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$create(reqParam: TaskCreateParam, currentUser: UserObject): Promise<TaskView> {
        // only publisher can public task
        if (!CommonUtils.isPublisher(currentUser.roles)) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }

        let dbObj: TaskObject = new TaskObject();
        dbObj.uid = CommonUtils.getUUIDForMongoDB();
        if (CommonUtils.isNullOrEmpty(reqParam.name)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'task name should not be null');
        }
        dbObj.name = reqParam.name;
        if (CommonUtils.isNullOrEmpty(reqParam.reward)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'task reward should not be null');
        }
        dbObj.reward = reqParam.reward;
        if (CommonUtils.isNullOrEmpty(reqParam.templateFileUid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'task templateFileUid should not be null');
        }
        dbObj.templateFileUid = reqParam.templateFileUid;

        dbObj.note = reqParam.note;
        dbObj.publisherUid = currentUser.uid;
        dbObj.state = TaskState.ReadyToApply;

        dbObj = await TaskModelWrapper.$$create(dbObj) as TaskObject;
        return await this.$$convertToDBView(dbObj);
    }

    public static async $$query(currentUser: UserObject): Promise<TaskView[]> {
        if (!CommonUtils.isUserReady(currentUser)) {
            LoggerManager.error(`User:${currentUser.name} state(${currentUser.state}) is not ready`);
            throw new ApiError(ApiResultCode.AuthUserNotReady);
        }
        const isExecutor: boolean = CommonUtils.isExecutor(currentUser.roles);
        const isPublisher: boolean = CommonUtils.isPublisher(currentUser.roles);

        const queryCondition: IQueryConditions = {};
        queryCondition.$or = [];
        if (isExecutor) {
            // for executor, only can query the task 
            // 1, whose state is ReadyToAppy or 
            // 2, whose applicantUid is current user
            // 3, whose executorUid is current user
            queryCondition.$or.push({ state: TaskState.ReadyToApply } as TaskObject);
            queryCondition.$or.push({ applicantUid: currentUser.uid } as TaskObject);
            queryCondition.$or.push({ executorUid: currentUser.uid } as TaskObject);
        }
        if (isPublisher) {
            // for publisher, only can query task published by current user
            queryCondition.$or.push({ publisherUid: currentUser.uid } as TaskObject);
        }
        return await TaskRequestHandler.$$find(queryCondition);
    }

    public static async $$edit(reqParam: TaskBasicInfoEditParam, currentUser: UserObject): Promise<TaskView | null> {
        // only publisher can public task
        if (!CommonUtils.isPublisher(currentUser.roles)) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }

        const dbObj: TaskObject = new TaskObject();
        dbObj.uid = reqParam.uid as string;
        if (!CommonUtils.isNullOrEmpty(reqParam.name)) {
            dbObj.name = reqParam.name;
        }
        if (CommonUtils.isNullOrEmpty(dbObj.reward)) {
            dbObj.reward = reqParam.reward;
        }
        if (reqParam.note !== undefined) {
            dbObj.note = reqParam.note;
        }
        dbObj.publisherUid = currentUser.uid;
        dbObj.state = TaskState.ReadyToApply;

        const updatedDBObj: TaskObject | null = await TaskModelWrapper.$$findOneAndUpdate(
            { uid: dbObj.uid } as TaskObject, dbObj) as TaskObject | null;

        if (updatedDBObj == null) {
            return null;
        } else {
            return await this.$$convertToDBView(updatedDBObj);
        }
    }
    /**
     * Executor applies specified task
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$apply(reqParam: TaskApplyParam, currentUser: UserObject): Promise<TaskView> {
        // only ready executor can apply task
        if (!CommonUtils.isExecutor(currentUser.roles) || !CommonUtils.isUserReady(currentUser)) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        const dbObj: TaskObject | null = await TaskModelWrapper.$$findOne(
            { uid: reqParam.uid } as TaskObject) as TaskObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `task id:${reqParam.uid}`);
        }
        if (dbObj.state !== TaskState.ReadyToApply) {
            LoggerManager.error(
                `task(${reqParam.uid}) state(${dbObj.state}) is not expected(${TaskState.ReadyToApply})`);
            throw new ApiError(ApiResultCode.AuthForbidden, 'task state is not expected');
        }

        // here the TaskApplicationModel likes a locker, only the one who creates it successfully
        // can apply the task
        const taskAppObj: TaskApplicationObject = new TaskApplicationObject();
        taskAppObj.uid = CommonUtils.getUUIDForMongoDB();
        taskAppObj.taskUid = dbObj.uid;
        taskAppObj.applicantUid = currentUser.uid;
        await TaskApplicationModelWrapper.$$create(taskAppObj);

        const dbObjWithUpdatedProps: TaskObject = new TaskObject();
        dbObjWithUpdatedProps.uid = reqParam.uid as string;
        dbObjWithUpdatedProps.templateFileUid = currentUser.uid;
        dbObjWithUpdatedProps.state = TaskState.Applying;
        dbObjWithUpdatedProps.applicantUid = currentUser.uid;

        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, dbObjWithUpdatedProps);

        // create notification
        const userNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
            NotificationType.TaskApply,
            dbObj.publisherUid as string,
            dbObj.uid as string,
            `用户：（${currentUser.name}）对任务：（${dbObj.name}）发起申请`);

        await UserNotificationModelWrapper.$$create(userNotification);

        Object.assign(dbObj, dbObjWithUpdatedProps);
        return await this.$$convertToDBView(dbObj);
    }

    public static async $$applyCheck(reqParam: TaskApplyCheckParam, currentUser: UserObject): Promise<TaskView> {
        if (!CommonUtils.isUserReady(currentUser)) {
            LoggerManager.error(`User(${currentUser.name}) is not ready or not publisher`);
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
        if (dbObj.state !== TaskState.Applying) {
            LoggerManager.error(
                `task(${reqParam.uid}) state(${dbObj.state}) is not expected(${TaskState.Applying})`);
            throw new ApiError(ApiResultCode.AuthForbidden, 'task state is not expected');
        }

        // update the task state and executorUid 
        const dbObjWithUpdatedProps: TaskObject = new TaskObject();
        if (reqParam.pass === true) {
            dbObjWithUpdatedProps.executorUid = dbObj.applicantUid;
            dbObjWithUpdatedProps.state = TaskState.Assigned;
        } else {
            dbObjWithUpdatedProps.state = TaskState.ReadyToApply;
            dbObjWithUpdatedProps.applicantUid = '';
        }
        await TaskModelWrapper.$$updateOne(
            { uid: dbObj.uid } as TaskObject, dbObjWithUpdatedProps);

        // delete the apply record
        await TaskApplicationModelWrapper.$$deleteByTaskId(reqParam.uid as string);

        // create task-denied notification
        const reason: string | undefined = reqParam.note || '无';
        const userNotification: UserNotificationObject = NotificationRequestHandler.createNotificationObject(
            NotificationType.TaskApplyDenied,
            dbObj.applicantUid as string,
            dbObj.uid as string,
            `发布者拒绝了你对任务（${dbObj.name}）的申请。理由：${reason}`);
        await UserNotificationModelWrapper.$$create(userNotification);

        Object.assign(dbObj, dbObjWithUpdatedProps);
        return await this.$$convertToDBView(dbObj);
    }

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

    public static async $$resultCheck(reqParam: TaskResultCheckParam, currentUser: UserObject) {
        if (!CommonUtils.isUserReady(currentUser)) {
            LoggerManager.error(`User(${currentUser.name}) is not ready or not publisher`);
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
        if (dbObj.state !== TaskState.TaskResultUploaded) {
            LoggerManager.error(
                `task(${reqParam.uid}) state(${dbObj.state}) is not expected(${TaskState.TaskResultUploaded})`);
            throw new ApiError(ApiResultCode.AuthForbidden, 'task state is not expected');
        }

        // update the task state
        const dbObjWithUpdatedProps: TaskObject = new TaskObject();

        if (reqParam.pass === true) {
            dbObjWithUpdatedProps.state = TaskState.Completed;
        } else {
            dbObjWithUpdatedProps.state = TaskState.TaskResultDenied;
        }
        await TaskModelWrapper.$$updateOne(
            { uid: reqParam.uid } as TaskObject, dbObjWithUpdatedProps);
        return Object.assign(dbObj, dbObjWithUpdatedProps);
    }
    public static async  $$convertToDBView(dbObj: TaskObject): Promise<TaskView> {
        const view: TaskView = new TaskView();
        keysOfITaskView.forEach((key: string) => {
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
    private static async $$find(conditions: IQueryConditions): Promise<TaskView[]> {
        const dbObjs: TaskObject[] = await TaskModelWrapper.$$find(conditions) as TaskObject[];
        const views: TaskView[] = [];
        if (dbObjs != null && dbObjs.length > 0) {
            for (const obj of dbObjs) {
                views.push(await this.$$convertToDBView(obj));
            }
        }
        return views;
    }
    // #endregion
}
