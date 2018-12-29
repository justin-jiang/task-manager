import { CommonUtils } from 'common/CommonUtils';
import { IQueryConditions } from 'common/IQueryConditions';
import { FileRemoveParam } from 'common/requestParams/FileRemoveParam';
import { TaskApplyAcceptParam } from 'common/requestParams/TaskApplyAcceptParam';
import { TaskApplyDenyParam } from 'common/requestParams/TaskApplyDenyParam';
import { TaskApplyParam } from 'common/requestParams/TaskApplyParam';
import { TaskCreateParam } from 'common/requestParams/TaskCreateParam';
import { TaskEditParam } from 'common/requestParams/TaskEditParam';
import { TaskRemoveParam } from 'common/requestParams/TaskRemoveParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { keysOfITaskView, TaskView } from 'common/responseResults/TaskView';
import { TaskState } from 'common/TaskState';
import { UserState } from 'common/UserState';
import { ApiError } from 'server/common/ApiError';
import { TaskApplicationModelWrapper } from 'server/dataModels/TaskApplicationModelWrapper';
import { TaskModelWrapper } from 'server/dataModels/TaskModelWrapper';
import { TaskApplicationObject } from 'server/dataObjects/TaskApplicationObject';
import { TaskObject } from 'server/dataObjects/TaskObject';
import { UserObject } from 'server/dataObjects/UserObject';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { FileRequestHandler } from 'server/requestHandlers/FileRequestHandler';

enum ApplyResult {
    Accept = 1,
    Deny = 2,
}
export class TaskRequestHandler {

    /**
     * publisher creates task
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$create(reqParam: TaskCreateParam, currentUser: UserObject): Promise<TaskView> {
        // only publisher can public task
        if (!CommonUtils.isPublisher(currentUser.roles)) {
            throw new ApiError(ApiResultCode.Auth_Forbidden);
        }

        let dbObj: TaskObject = new TaskObject();
        dbObj.uid = CommonUtils.getUUIDForMongoDB();
        if (CommonUtils.isNullOrEmpty(reqParam.name)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM, 'task name should not be null');
        }
        dbObj.name = reqParam.name;
        if (CommonUtils.isNullOrEmpty(reqParam.reward)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM, 'task reward should not be null');
        }
        dbObj.reward = reqParam.reward;
        if (CommonUtils.isNullOrEmpty(reqParam.templateFileId)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM, 'task templateFileId should not be null');
        }
        dbObj.templateFileId = reqParam.templateFileId;

        dbObj.note = reqParam.note;
        dbObj.publisherId = currentUser.uid;
        dbObj.state = TaskState.ReadyToApply;

        dbObj = await TaskModelWrapper.$$create(dbObj) as TaskObject;
        const view: TaskView = new TaskView();
        view.assembleFromDBObject(dbObj);
        return view;
    }

    public static async $$query(currentUser: UserObject): Promise<TaskView[]> {
        if (currentUser.state !== UserState.Ready) {
            LoggerManager.error(`User:${currentUser.name} state(${currentUser.state}) is not ready`);
            throw new ApiError(ApiResultCode.Auth_User_Not_Ready);
        }
        const isExecutor: boolean = CommonUtils.isExecutor(currentUser.roles);
        const isPublisher: boolean = CommonUtils.isPublisher(currentUser.roles);

        const queryCondition: IQueryConditions = {};
        queryCondition.$or = [];
        if (isExecutor) {
            // for executor, only can query the task 
            // 1, whose state is ReadyToAppy or 
            // 2, whose applicatId is current user
            // 3, whose executorId is current user
            queryCondition.$or.push({ state: TaskState.ReadyToApply } as TaskObject);
            queryCondition.$or.push({ applicantId: currentUser.uid } as TaskObject);
            queryCondition.$or.push({ executorId: currentUser.uid } as TaskObject);
        }
        if (isPublisher) {
            // for publisher, only can query task published by current user
            queryCondition.$or.push({ publisherId: currentUser.uid } as TaskObject);
        }
        return await TaskRequestHandler.$$find(queryCondition);
    }

    public static async $$edit(reqParam: TaskEditParam, currentUser: UserObject): Promise<TaskView | null> {
        // only publisher can public task
        if (!CommonUtils.isPublisher(currentUser.roles)) {
            throw new ApiError(ApiResultCode.Auth_Forbidden);
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
        dbObj.publisherId = currentUser.uid;
        dbObj.state = TaskState.ReadyToApply;

        const updatedDBObj: TaskObject | null = await TaskModelWrapper.$$findOneAndUpdate(
            { uid: dbObj.uid } as TaskObject, dbObj) as TaskObject | null;

        if (updatedDBObj == null) {
            return null;
        }
        const view: TaskView = new TaskView();
        view.assembleFromDBObject(dbObj);
        return view;
    }
    /**
     * Executor applies specified task
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$apply(reqParam: TaskApplyParam, currentUser: UserObject): Promise<TaskView> {
        // only ready executor can apply task
        if (currentUser.state !== UserState.Ready || !CommonUtils.isExecutor(currentUser.roles)) {
            throw new ApiError(ApiResultCode.Auth_Forbidden);
        }
        const dbObj: TaskObject | null = await TaskModelWrapper.$$findOne(
            { uid: reqParam.uid } as TaskObject) as TaskObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DB_NOT_FOUND, `task id:${reqParam.uid}`);
        }
        if (dbObj.state !== TaskState.ReadyToApply) {
            LoggerManager.error(
                `task(${reqParam.uid}) state(${dbObj.state}) is not expected(${TaskState.ReadyToApply})`);
            throw new ApiError(ApiResultCode.Auth_Forbidden, 'task state is not expected');
        }

        // here the TaskApplicationModel likes a locker, only the one who creates it successfully
        // can apply the task
        const taskAppObj: TaskApplicationObject = new TaskApplicationObject();
        taskAppObj.uid = CommonUtils.getUUIDForMongoDB();
        taskAppObj.taskId = dbObj.uid;
        taskAppObj.applicantId = currentUser.uid;
        await TaskApplicationModelWrapper.$$create(taskAppObj);

        const dbObjWithUpdatedProps: TaskObject = new TaskObject();
        dbObjWithUpdatedProps.uid = reqParam.uid as string;
        dbObjWithUpdatedProps.templateFileId = currentUser.uid;
        dbObjWithUpdatedProps.state = TaskState.Applying;
        dbObjWithUpdatedProps.applicantId = currentUser.uid;

        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, dbObjWithUpdatedProps);
        Object.assign(dbObj, dbObjWithUpdatedProps);
        return this.convertToDBView(dbObj);
    }

    public static async $$applyAccept(reqParam: TaskApplyAcceptParam, currentUser: UserObject): Promise<TaskView> {
        const dbObj: TaskObject = await this.$$taskAppceptOrDeny(
            reqParam.uid as string, currentUser, ApplyResult.Accept);
        return this.convertToDBView(dbObj);
    }

    public static async $$applyDeny(reqParam: TaskApplyDenyParam, currentUser: UserObject): Promise<TaskView> {
        const dbObj: TaskObject = await this.$$taskAppceptOrDeny(reqParam.uid as string, currentUser, ApplyResult.Deny);
        return this.convertToDBView(dbObj);
    }

    public static async $$remove(reqParam: TaskRemoveParam, currentUser: UserObject): Promise<TaskView> {
        let resultFileId: string | undefined;
        let publisherId: string | undefined;
        const dbObj: TaskObject | null = await TaskModelWrapper.$$findOne(
            { uid: reqParam.uid } as TaskObject) as TaskObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DB_NOT_FOUND, `task id:${reqParam.uid}`);
        }
        resultFileId = dbObj.resultFileId;
        publisherId = dbObj.publisherId;

        // only admin or ownered publisher can remove task
        if (!CommonUtils.isAdmin(currentUser.roles) && currentUser.uid !== publisherId) {
            throw new ApiError(ApiResultCode.Auth_Forbidden);
        }

        if (resultFileId != null) {
            const fileDeleteParam: FileRemoveParam = {
                fileId: resultFileId,
            } as FileRemoveParam;
            LoggerManager.debug(`delete all result files of task:${reqParam.uid}`);
            await FileRequestHandler.$$deleteOne(fileDeleteParam);
        }
        // remove task apply record
        await TaskApplicationModelWrapper.$$deleteOne({ taskId: reqParam.uid } as TaskApplicationObject);

        // remove task
        await TaskModelWrapper.$$deleteOne({ uid: dbObj.uid } as TaskObject);
        return this.convertToDBView(dbObj);
    }
    public static convertToDBView(dbObj: TaskObject): TaskView {
        const view: TaskView = new TaskView();
        keysOfITaskView.forEach((key: string) => {
            if (key in dbObj) {
                view[key] = dbObj[key];
            } else {
                LoggerManager.warn('missed Key in TaskObject:', { missedKey: key });
            }

        });
        return view;
    }

    // #region -- internal props and methods
    private static async $$find(conditions: IQueryConditions): Promise<TaskView[]> {
        const dbObjs: TaskObject[] = await TaskModelWrapper.$$find(conditions) as TaskObject[];
        const views: TaskView[] = [];
        dbObjs.forEach((obj: TaskObject) => {
            views.push(this.convertToDBView(obj));
        });
        return views;
    }

    /**
     * 
     * @param taskUid 
     * @param currentUser 
     * @param applyResult
     */
    private static async $$taskAppceptOrDeny(
        taskUid: string, currentUser: UserObject, applyResult: ApplyResult): Promise<TaskObject> {
        if (currentUser.state !== UserState.Ready || !CommonUtils.isPublisher(currentUser.roles)) {
            LoggerManager.error(`User(${currentUser.name}) is not ready or not publisher`);
            throw new ApiError(ApiResultCode.Auth_Forbidden);
        }
        const dbObj: TaskObject | null = await TaskModelWrapper.$$findOne(
            { uid: taskUid } as TaskObject) as TaskObject;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DB_NOT_FOUND, `task id:${taskUid}`);
        }
        if (currentUser.uid !== dbObj.publisherId) {
            LoggerManager.error(`User(${currentUser.name}) is not task(${dbObj.publisherId}) publisher`);
            throw new ApiError(ApiResultCode.Auth_Forbidden);
        }
        if (dbObj.state !== TaskState.Applying) {
            LoggerManager.error(
                `task(${taskUid}) state(${dbObj.state}) is not expected(${TaskState.Applying})`);
            throw new ApiError(ApiResultCode.Auth_Forbidden, 'task state is not expected');
        }

        // update the task state and executorId 
        const dbObjWithUpdatedProps: TaskObject = new TaskObject();
        dbObjWithUpdatedProps.uid = taskUid;
        if (applyResult === ApplyResult.Accept) {
            dbObjWithUpdatedProps.executorId = dbObj.applicantId;
            dbObjWithUpdatedProps.state = TaskState.Assigned;
        } else {
            dbObjWithUpdatedProps.state = TaskState.ReadyToApply;
            dbObjWithUpdatedProps.applicantId = '';
        }
        await TaskModelWrapper.$$updateOne(
            { uid: dbObjWithUpdatedProps.uid } as TaskObject, dbObjWithUpdatedProps);

        // delete the apply record
        await TaskApplicationModelWrapper.$$deleteByTaskId(taskUid);
        return Object.assign(dbObj, dbObjWithUpdatedProps);
    }
    // #endregion
}
