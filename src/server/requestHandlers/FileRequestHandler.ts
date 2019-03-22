import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { LIMIT_FILE_SIZE_M, LIMIT_LOGO_SIZE_M } from 'common/Config';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileType } from 'common/FileType';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileRemoveParam } from 'common/requestParams/FileRemoveParam';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskDepositImageUploadParam } from 'common/requestParams/TaskDepositImageUploadParam';
import { TaskMarginImageUploadParam } from 'common/requestParams/TaskMarginImageUploadParam';
import { TaskPayToExecutorImageUploadParam } from 'common/requestParams/TaskPayToExecutorImageUploadParam';
import { TaskExecutorReceiptUploadParam } from 'common/requestParams/TaskExecutorReceiptUploadParam';
import { TaskResultFileUploadParam } from 'common/requestParams/TaskResultFileUploadParam';
import { TemplateCreateParam } from 'common/requestParams/TemplateCreateParam';
import { TemplateFileEditParam } from 'common/requestParams/TemplateFileEditParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { TemplateView } from 'common/responseResults/TemplateView';
import { UserView } from 'common/responseResults/UserView';
import { TaskHistoryItem } from 'common/TaskHistoryItem';
import { TaskState } from 'common/TaskState';
import { UserState } from 'common/UserState';
import { Response } from 'express';
import { ApiError } from 'server/common/ApiError';
import { TaskModelWrapper } from 'server/dataModels/TaskModelWrapper';
import { TemplateModelWrapper } from 'server/dataModels/TemplateModelWrapper';
import { UserModelWrapper } from 'server/dataModels/UserModelWrapper';
import { TaskObject } from 'server/dataObjects/TaskObject';
import { TemplateObject } from 'server/dataObjects/TemplateObject';
import { UserObject } from 'server/dataObjects/UserObject';
import { FileStorage, IFileMetaData } from 'server/dbDrivers/mongoDB/FileStorage';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { TemplateRequestHandler } from 'server/requestHandlers/TemplateRequestHandler';
import { UserRequestHandler } from 'server/requestHandlers/UserRequestHandler';
import { RequestUtils } from './RequestUtils';
import { TaskRequestHandler } from './TaskRequestHandler';
import { ReceiptState } from 'common/ReceiptState';
import { Request } from 'express';
import { TaskRefundImageUploadParam } from 'common/requestParams/TaskRefundImageUploadParam';
import { RefundScenario } from 'common/RefundScenario';
export class FileRequestHandler {
    // #region -- template related methods
    /**
     * create a task template object with file upload
     * which is used by publisher to create task template
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$createTaskTemplate(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TemplateView> {
        // only ready publisher user can create Template
        RequestUtils.readyPublisherCheck(currentUser);
        this.checkFileSize(fileData);
        const optionData: TemplateCreateParam = JSON.parse(reqParam.optionData as string);
        const templateView: TemplateView = await this.$$createTemplateObject(
            optionData, currentUser, fileData as Express.Multer.File);
        return templateView;
    }

    /**
     * upload new task template file as current one by publisher owner
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$updateTaskTemplateFile(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TemplateView> {
        // only ready publisher user can invoke this mthod
        RequestUtils.adminCheck(currentUser);
        this.checkFileSize(fileData);

        const metadata: TemplateFileEditParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(metadata.templateUid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'templateUid should not be null');
        }
        const dbObj: TemplateObject | null = await TemplateModelWrapper.$$findOne(
            { templateFileUid: metadata.templateUid } as TemplateObject) as TemplateObject | null;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `TemplateId:${metadata.templateUid}`);
        }

        // only owner user can update Template file
        if (dbObj.publisherUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden,
                `publisher:${currentUser.uid} not owner of template:${dbObj.publisherUid}`);
        }

        const fileEntryId: string = dbObj.templateFileUid as string;
        dbObj.version = dbObj.version as number + 1;
        const fileMetaData: IFileMetaData = {
            type: FileType.Template,
            checked: true,
            originalFileName: fileData.originalname,
        } as IFileMetaData;
        await FileStorage.$$saveEntry(
            fileEntryId,
            dbObj.version,
            fileMetaData,
            (fileData as Express.Multer.File).buffer);

        // update version
        await TemplateModelWrapper.$$updateOne(
            { uid: dbObj.uid } as TemplateObject,
            { version: dbObj.version } as TemplateObject);
        return TemplateRequestHandler.$$convertToDBView(dbObj);
    }
    // #endregion

    // #region -- user related methods
    /**
     * used by admin, executor or publishser to upload qualification file
     * 1, for admin, the file is used as qualification template
     * 2, for executor and publisher,  it will cause user to go into qualification ToBeChecked State
     * used by user self
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$uploadQualificationFile(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<UserView> {
        return await this.$$uploadUserFile(fileData, reqParam, currentUser, FileType.Qualification);
    }

    /**
     * used by admin to upload the regiester protocol 
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$uploadRegisterProtocolFile(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<UserView> {
        RequestUtils.adminCheck(currentUser);
        return await this.$$uploadUserFile(fileData, reqParam, currentUser, FileType.RegisterProtocol);
    }

    /**
     * Update user Identity related images which will cause user to go into Id ToBoChecked state
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$updateUserIdImages(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<UserView> {
        if (currentUser.state === UserState.Disabled) {
            throw new ApiError(ApiResultCode.AuthForbidden, `user:${currentUser.uid} disabled`);
        }
        this.checkImageFileSize(fileData);
        let fileIdToCreate: string;
        let fileType: FileType;
        const updatedProps: UserObject = {};
        updatedProps.idState = CheckState.ToBeChecked;

        switch (reqParam.scenario) {
            case FileAPIScenario.UploadUserLogo:
                if (CommonUtils.isNullOrEmpty(currentUser.logoUid)) {
                    fileIdToCreate = CommonUtils.getUUIDForMongoDB();
                    updatedProps.logoUid = fileIdToCreate;
                } else {
                    fileIdToCreate = currentUser.logoUid as string;
                    // remove existing one
                    await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                }
                fileType = FileType.UserLogo;
                updatedProps.logoState = CheckState.ToBeChecked;
                break;
            case FileAPIScenario.UploadUserFrontId:
                if (CommonUtils.isNullOrEmpty(currentUser.frontIdUid)) {
                    fileIdToCreate = CommonUtils.getUUIDForMongoDB();
                    updatedProps.frontIdUid = fileIdToCreate;
                } else {
                    fileIdToCreate = currentUser.frontIdUid as string;
                    // remove existing one
                    await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                }
                fileType = FileType.FrontId;
                updatedProps.frontIdState = CheckState.ToBeChecked;
                break;
            case FileAPIScenario.UploadUserBackId:
                if (CommonUtils.isNullOrEmpty(currentUser.backIdUid)) {
                    fileIdToCreate = CommonUtils.getUUIDForMongoDB();
                    updatedProps.backIdUid = fileIdToCreate;
                } else {
                    fileIdToCreate = currentUser.backIdUid as string;
                    // remove existing one
                    await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                }
                fileType = FileType.BackId;
                updatedProps.backIdState = CheckState.ToBeChecked;
                break;
            case FileAPIScenario.UploadLicense:
                if (CommonUtils.isNullOrEmpty(currentUser.licenseUid)) {
                    fileIdToCreate = CommonUtils.getUUIDForMongoDB();
                    updatedProps.licenseUid = fileIdToCreate;
                } else {
                    fileIdToCreate = currentUser.licenseUid as string;
                    // remove existing one
                    await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                }
                fileType = FileType.License;
                updatedProps.licenseState = CheckState.ToBeChecked;
                break;
            case FileAPIScenario.UploadLicenseWithPerson:
                if (CommonUtils.isNullOrEmpty(currentUser.licenseWithPersonUid)) {
                    fileIdToCreate = CommonUtils.getUUIDForMongoDB();
                    updatedProps.licenseWithPersonUid = fileIdToCreate;
                } else {
                    fileIdToCreate = currentUser.licenseWithPersonUid as string;
                    // remove existing one
                    await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                }
                fileType = FileType.LicenseWithPerson;
                updatedProps.licenseWidthPersonState = CheckState.ToBeChecked;
                break;
            case FileAPIScenario.UploadAuthLetter:
                if (CommonUtils.isNullOrEmpty(currentUser.authLetterUid)) {
                    fileIdToCreate = CommonUtils.getUUIDForMongoDB();
                    updatedProps.authLetterUid = fileIdToCreate;
                } else {
                    fileIdToCreate = currentUser.authLetterUid as string;
                    // remove existing one
                    await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                }
                fileType = FileType.AuthLetter;
                updatedProps.authLetterState = CheckState.ToBeChecked;
                break;
            default:
                throw new ApiError(ApiResultCode.InputInvalidFileScenario, JSON.stringify(reqParam));
        }

        await FileStorage.$$saveEntry(
            fileIdToCreate,
            0, // version
            {
                type: fileType,
                checked: false,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        await UserModelWrapper.$$updateOne(
            { uid: currentUser.uid } as UserObject,
            updatedProps);
        Object.assign(currentUser, updatedProps);
        return UserRequestHandler.$$convertToDBView(currentUser);
    }
    // #endregion

    // #region -- task related methods
    /**
     * update task deposit image which will cause task to be Deposited state
     * used by publisher owner
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$updateTaskDepositImage(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TaskView> {
        RequestUtils.readyPublisherCheck(currentUser);
        this.checkImageFileSize(fileData);
        const metadata: TaskDepositImageUploadParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(metadata.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'uid should not be null');
        }
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(metadata.uid as string, TaskState.Submitted);

        if (dbObj.publisherUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden,
                `User:${currentUser.name} is not owner of task:${dbObj.uid}`);
        }
        const updatedProps: TaskObject = new TaskObject();
        updatedProps.state = TaskState.DepositUploaded;
        // pick up the props in param and assign to updatedProps object
        Object.assign(updatedProps, RequestUtils.pickUpKeysByModel(metadata, new TaskDepositImageUploadParam(true)));

        if (CommonUtils.isNullOrEmpty(dbObj.depositImageUid)) {
            updatedProps.depositImageUid = CommonUtils.getUUIDForMongoDB();
        } else {
            // remove existing one
            await FileStorage.$$deleteEntry(dbObj.depositImageUid as string, 0);
        }

        Object.assign(dbObj, updatedProps);
        await FileStorage.$$saveEntry(
            dbObj.depositImageUid as string,
            0,
            {
                type: FileType.Deposit,
                checked: true,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        // update object
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, updatedProps);

        // add history item
        await TaskModelWrapper.$$addHistoryItem(
            dbObj.uid as string,
            TaskState.DepositUploaded,
            CommonUtils.getStepTitleByTaskState(TaskState.DepositUploaded));
        return TaskRequestHandler.$$convertToDBView(dbObj);
    }

    /**
     * update task margin image which will cause task to be ReadyToAuditApply state
     * used by executor owner
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$updateTaskMarginImage(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TaskView> {
        RequestUtils.readyExecutorCheck(currentUser);
        this.checkImageFileSize(fileData);
        const metadata: TaskMarginImageUploadParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(metadata.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TaskMarginImageUploadParam.uid should not be null');
        }
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(metadata.uid as string, TaskState.Applying);

        if (dbObj.applicantUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden,
                `User:${currentUser.name} is not applicant of task:${dbObj.uid}`);
        }

        const updatedProps: TaskObject = new TaskObject();
        updatedProps.marginAditState = CheckState.ToBeChecked;
        updatedProps.state = TaskState.MarginUploaded;
        if (CommonUtils.isNullOrEmpty(dbObj.marginImageUid)) {
            updatedProps.marginImageUid = CommonUtils.getUUIDForMongoDB();
        } else {
            // remove existing one
            await FileStorage.$$deleteEntry(dbObj.marginImageUid as string, 0);
        }

        Object.assign(dbObj, updatedProps);
        await FileStorage.$$saveEntry(
            dbObj.marginImageUid as string,
            0,
            {
                type: FileType.Margin,
                checked: true,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        // update object
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, updatedProps);
        await TaskModelWrapper.$$addHistoryItem(dbObj.uid as string, TaskState.MarginUploaded, '');
        return TaskRequestHandler.$$convertToDBView(dbObj);
    }

    /**
     * used by admin to upload deposit or margin refund
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$uploadRefundImage(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TaskView> {
        RequestUtils.adminCheck(currentUser);
        this.checkImageFileSize(fileData);
        const metadata: TaskRefundImageUploadParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(metadata.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'uid should not be null');
        }
        let dbObj: TaskObject;
        let fileType: FileType;
        let fileId: string;
        let historyItemState: TaskState;
        const updatedProps: TaskObject = new TaskObject();
        if (metadata.scenario === RefundScenario.DepositRefund) {
            dbObj = await RequestUtils.$$taskStateCheck(metadata.uid as string, TaskState.DepositUploaded);
            if (CommonUtils.isNullOrEmpty(dbObj.depositRefundImageUid)) {
                updatedProps.depositRefundImageUid = CommonUtils.getUUIDForMongoDB();
            } else {
                // remove existing one
                await FileStorage.$$deleteEntry(dbObj.depositRefundImageUid as string, 0);
            }
            updatedProps.state = TaskState.Created;
            fileType = FileType.DepositRefund;
            fileId = updatedProps.depositRefundImageUid as string;
            historyItemState = TaskState.DepositRefund;
        } else {
            dbObj = await RequestUtils.$$taskStateCheck(metadata.uid as string, TaskState.MarginUploaded);
            if (CommonUtils.isNullOrEmpty(dbObj.marginRefundImageUid)) {
                updatedProps.marginRefundImageUid = CommonUtils.getUUIDForMongoDB();
            } else {
                // remove existing one
                await FileStorage.$$deleteEntry(dbObj.marginRefundImageUid as string, 0);
            }
            updatedProps.state = TaskState.ReadyToApply;
            fileType = FileType.MarginRefund;
            fileId = updatedProps.marginRefundImageUid as string;
            historyItemState = TaskState.MarginRefund;
        }

        Object.assign(dbObj, updatedProps);
        await FileStorage.$$saveEntry(
            fileId,
            0,
            {
                type: fileType,
                checked: true,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        // update object
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, updatedProps);
        await TaskModelWrapper.$$addHistoryItem(
            dbObj.uid as string, historyItemState, CommonUtils.getStepTitleByTaskState(historyItemState));
        return TaskRequestHandler.$$convertToDBView(dbObj);
    }

    /**
     * update Task Result file which will cause Task to go into ResultUploaded state
     * used by assigned executor
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$updateTaskResultFile(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TaskView> {
        // only task executor can update Result file
        RequestUtils.readyExecutorCheck(currentUser);
        this.checkFileSize(fileData);
        const metadata: TaskResultFileUploadParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(metadata.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TaskResultFileUploadParam.uid should not be null');
        }
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(metadata.uid as string, TaskState.Assigned);
        if (dbObj.executorUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden,
                `Task:${dbObj.name} is not assigned to Executor:${currentUser.name}`);
        }

        const updatedProps: TaskObject = new TaskObject();
        updatedProps.state = TaskState.ResultUploaded;
        updatedProps.resultTime = Date.now();
        if (CommonUtils.isNullOrEmpty(dbObj.resultFileUid)) {
            updatedProps.resultFileUid = CommonUtils.getUUIDForMongoDB();
            updatedProps.resultFileversion = 0;
        } else {
            updatedProps.resultFileversion = dbObj.resultFileversion as number + 1;
        }
        updatedProps.histories = dbObj.histories;
        (updatedProps.histories as TaskHistoryItem[]).push({
            uid: CommonUtils.getUUIDForMongoDB(),
            createTime: Date.now(),
            state: TaskState.ResultUploaded,
            description: '',
        } as TaskHistoryItem);

        Object.assign(dbObj, updatedProps);
        await FileStorage.$$saveEntry(
            dbObj.resultFileUid as string,
            dbObj.resultFileversion as number,
            {
                type: FileType.TaskResult,
                checked: true,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        // update object
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, updatedProps);
        return TaskRequestHandler.$$convertToDBView(dbObj);
    }


    /**
     * used by admin to upload(update) task pay_to_executor image
     * 
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$updateTaskPayToExecutorImage(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TaskView> {
        RequestUtils.adminCheck(currentUser);
        this.checkImageFileSize(fileData);
        const metadata: TaskPayToExecutorImageUploadParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(metadata.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TaskPayToExecutorImageUploadParam.uid should not be null');
        }
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(
            metadata.uid as string, TaskState.PublisherVisited);

        const updatedProps: TaskObject = new TaskObject();
        updatedProps.state = TaskState.ExecutorPaid;

        if (CommonUtils.isNullOrEmpty(dbObj.payToExecutorImageUid)) {
            updatedProps.payToExecutorImageUid = CommonUtils.getUUIDForMongoDB();
        } else {
            // remove existing one
            await FileStorage.$$deleteEntry(dbObj.payToExecutorImageUid as string, 0);
        }

        Object.assign(dbObj, updatedProps);
        await FileStorage.$$saveEntry(
            dbObj.payToExecutorImageUid as string,
            0,
            {
                type: FileType.TaskPayToExecutor,
                checked: true,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        // update object
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, updatedProps);
        // add history item
        await TaskModelWrapper.$$addHistoryItem(dbObj.uid as string, TaskState.ExecutorPaid, '');
        return TaskRequestHandler.$$convertToDBView(dbObj);
    }

    /**
     * used by admin to upload(update) task receipt image from executor
     * 
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$updateExecutorReceiptImage(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TaskView> {
        RequestUtils.adminCheck(currentUser);
        this.checkImageFileSize(fileData);
        const metadata: TaskExecutorReceiptUploadParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(metadata.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, JSON.stringify(metadata));
        }
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(
            metadata.uid as string, TaskState.PublisherVisited);

        const updatedProps: TaskObject = new TaskObject();
        // pick up the props in param and assign to updatedProps object
        Object.assign(updatedProps, RequestUtils.pickUpKeysByModel(metadata, new TaskExecutorReceiptUploadParam(true)));

        if (CommonUtils.isNullOrEmpty(dbObj.executorReceiptImageUid)) {
            updatedProps.executorReceiptImageUid = CommonUtils.getUUIDForMongoDB();
        } else {
            // remove existing one
            await FileStorage.$$deleteEntry(dbObj.executorReceiptImageUid as string, 0);
        }

        Object.assign(dbObj, updatedProps);
        // only update the state when both executor receipt and executor payment done
        if ((dbObj.executorReceiptRequired === ReceiptState.NotRequired ||
            !CommonUtils.isNullOrEmpty(dbObj.executorReceiptNumber)) &&
            !CommonUtils.isNullOrEmpty(dbObj.payToExecutorImageUid)) {
            dbObj.state = TaskState.ExecutorPaid;
            updatedProps.state = TaskState.ExecutorPaid;
        } else {
            updatedProps.state = dbObj.state;
        }
        await FileStorage.$$saveEntry(
            dbObj.executorReceiptImageUid as string,
            0,
            {
                type: FileType.TaskReceipt,
                checked: true,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        if (updatedProps.state === TaskState.ExecutorPaid) {
            // add history
            await TaskModelWrapper.$$addHistoryItem(dbObj.uid as string, TaskState.ExecutorPaid, '');
        }

        // update object
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, updatedProps);
        return TaskRequestHandler.$$convertToDBView(dbObj);
    }
    // #endregion

    /**
     * every kind of file download
     * @param reqParam 
     * @param currentUser 
     * @param res 
     */
    public static async $$download(req: Request, res: Response): Promise<void> {
        const reqParam: FileDownloadParam = req.body as FileDownloadParam;
        if (reqParam == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'FileDownloadParam should not be null');
        }
        if (reqParam.scenario == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'FileDownloadParam.scenario should not be null');
        }

        let fileId: string = '';
        let version: number = -1;
        let admin: UserObject;
        let currentUser: UserObject;
        if (!CommonUtils.isNullOrEmpty(reqParam.fileId)) {
            fileId = reqParam.fileId as string;
        }
        if (reqParam.version != null) {
            version = Number.parseInt(reqParam.version as any, 10);
        }
        // transform request param
        const scenario: FileAPIScenario = Number.parseInt(reqParam.scenario as any, 10);
        reqParam.scenario = scenario;
        let taskObj: TaskObject;
        switch (scenario) {
            case FileAPIScenario.DownloadQualificationFile:
                currentUser = await RequestUtils.$$getCurrentUser(req);
                // only admin or owner can download the qualification
                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.qualificationUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadTemplateFile:
                const template: TemplateObject = await TemplateModelWrapper.$$findOne(
                    { templateFileUid: fileId } as TemplateObject) as TemplateObject;
                if (template == null) {
                    throw new ApiError(ApiResultCode.DbNotFound, `TemplateByFileUid:${fileId}`);
                }
                version = template.version as number;
                // everyone can download template file
                break;
            case FileAPIScenario.DownloadUserLogo:
                // only admin or owner can download logo
                currentUser = await RequestUtils.$$getCurrentUser(req);
                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.logoUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadBackId:
                // only admin or owner can download logo
                currentUser = await RequestUtils.$$getCurrentUser(req);
                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.backIdUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadFrontId:
                // only admin or owner can download logo
                currentUser = await RequestUtils.$$getCurrentUser(req);
                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.frontIdUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadAuthLetter:
                // only admin or owner can download logo
                currentUser = await RequestUtils.$$getCurrentUser(req);
                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.authLetterUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadAuthLetter:
                // only admin or owner can download logo
                currentUser = await RequestUtils.$$getCurrentUser(req);
                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.authLetterUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadLicense:
                // only admin or owner can download logo
                currentUser = await RequestUtils.$$getCurrentUser(req);
                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.licenseUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadLinceWithPerson:
                // only admin or owner can download logo
                currentUser = await RequestUtils.$$getCurrentUser(req);
                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.licenseWithPersonUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadTaskResultFile:
                currentUser = await RequestUtils.$$getCurrentUser(req);
                taskObj = await TaskModelWrapper.$$findOne(
                    { resultFileUid: reqParam.fileId } as TaskObject) as TaskObject;
                if (taskObj == null) {
                    throw new ApiError(ApiResultCode.DbNotFound, `Task with resultFileUid:${reqParam.fileId}`);
                }
                if (!CommonUtils.isAdmin(currentUser) && taskObj.publisherUid !== currentUser.uid) {
                    throw new ApiError(ApiResultCode.AuthForbidden,
                        `User:${currentUser.name} No Auth on task:${taskObj.name}`);
                }
                break;
            case FileAPIScenario.DownloadQualificationTemplate:
                admin = await UserModelWrapper.$$findOne(
                    { uid: UserModelWrapper.adminUID } as UserObject) as UserObject;
                if (CommonUtils.isNullOrEmpty(admin.qualificationUid)) {
                    throw new ApiError(ApiResultCode.DbNotFound);
                }
                fileId = admin.qualificationUid as string;
                version = admin.qualificationVersion as number;
                break;
            case FileAPIScenario.DownloadRegisterProtocol:
                admin = await UserModelWrapper.$$findOne(
                    { uid: UserModelWrapper.adminUID } as UserObject) as UserObject;
                if (CommonUtils.isNullOrEmpty(admin.registerProtocolUid)) {
                    throw new ApiError(ApiResultCode.DbNotFound);
                }
                fileId = admin.registerProtocolUid as string;
                version = admin.registerProtocolVersion as number;
                break;
            case FileAPIScenario.DownloadTaskDepositImage:
                currentUser = await RequestUtils.$$getCurrentUser(req);
                taskObj = await TaskModelWrapper.$$findOne(
                    { depositImageUid: reqParam.fileId } as TaskObject) as TaskObject;
                if (taskObj == null) {
                    throw new ApiError(ApiResultCode.DbNotFound, `depositImageUid:${reqParam.fileId}`);
                }
                // only admin or owner can download
                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.uid !== taskObj.publisherUid) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadTaskMarginImage:
                currentUser = await RequestUtils.$$getCurrentUser(req);
                taskObj = await TaskModelWrapper.$$findOne(
                    { marginImageUid: reqParam.fileId } as TaskObject) as TaskObject;
                if (taskObj == null) {
                    throw new ApiError(ApiResultCode.DbNotFound, `marginImageUid:${reqParam.fileId}`);
                }
                // only admin or owner can download
                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.uid !== taskObj.publisherUid) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            default:
                throw new ApiError(ApiResultCode.InputInvalidFileScenario);
        }
        if (CommonUtils.isNullOrEmpty(fileId) || version === -1) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'fileId and version should not be null');
        }
        const metadata = await FileStorage.$$getEntryMetaData(`${fileId}_${version}`);
        if (metadata != null && metadata.originalFileName != null) {
            res.header('content-disposition', encodeURI(`filename=${metadata.originalFileName}`));
        }
        const readStream = FileStorage.createReadStream(fileId as string, version);
        await FileStorage.$$pipeStreamPromise(readStream, res);
    }

    /**
     * delete file by id
     * @param reqParam 
     */
    public static async $$deleteOne(reqParam: FileRemoveParam) {
        await FileStorage.$$deleteEntry(reqParam.fileId as string, reqParam.version);
    }

    // #region -- inner props and methods
    private static async $$createTemplateObject(
        reqParam: TemplateCreateParam,
        currentUser: UserObject,
        fileData: Express.Multer.File): Promise<TemplateView> {
        if (CommonUtils.isNullOrEmpty(reqParam.name)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TemplateCreateParam.name should not be null');
        }
        let dbObj: TemplateObject = new TemplateObject();
        dbObj.uid = CommonUtils.getUUIDForMongoDB();
        dbObj.name = reqParam.name;
        if (reqParam.note !== undefined) {
            dbObj.note = reqParam.note;
        }
        dbObj.version = 0;
        dbObj.templateFileUid = CommonUtils.getUUIDForMongoDB();
        dbObj.publisherUid = currentUser.uid;
        const fileMetaData: IFileMetaData = {
            type: FileType.Template,
            checked: true,
            originalFileName: fileData.originalname,
        } as IFileMetaData;
        await FileStorage.$$saveEntry(
            dbObj.templateFileUid as string,
            0, // for first file
            fileMetaData,
            fileData.buffer);
        dbObj = await TemplateModelWrapper.$$create(dbObj) as TemplateObject;
        return await TemplateRequestHandler.$$convertToDBView(dbObj);
    }

    private static checkImageFileSize(fileData: Express.Multer.File): void {
        this.checkFileSize(fileData, LIMIT_LOGO_SIZE_M);
    }

    private static checkFileSize(fileData: Express.Multer.File, limit?: number): void {
        if (limit == null) {
            limit = LIMIT_FILE_SIZE_M;
        }
        const imageSize: number = fileData.size;
        if ((fileData as Express.Multer.File).size / 1024 / 1024 > limit) {
            LoggerManager.error(`ImageSize:${imageSize} too large`);
            throw new ApiError(ApiResultCode.InputImageTooLarge);
        }
    }

    /**
     * upload the User file, e.g. qualification, register protocol and so on
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     * @param fileType 
     */
    public static async $$uploadUserFile(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject,
        fileType: FileType): Promise<UserView> {
        let fileEntryId: string = '';
        let fileVersion: number = 0;
        const updatedProps: UserObject = {};
        if (currentUser.state === UserState.Disabled) {
            throw new ApiError(ApiResultCode.AuthForbidden, `user:${currentUser.uid} disabled`);
        }
        this.checkFileSize(fileData);

        switch (fileType) {
            case FileType.Qualification:
                if (CommonUtils.isNullOrEmpty(currentUser.qualificationUid)) {
                    fileEntryId = CommonUtils.getUUIDForMongoDB();
                    updatedProps.qualificationUid = fileEntryId;
                    updatedProps.qualificationVersion = 0;
                } else {
                    fileEntryId = currentUser.qualificationUid as string;
                    updatedProps.qualificationVersion = currentUser.qualificationVersion as number + 1;
                }
                updatedProps.qualificationState = CheckState.ToBeChecked;
                fileVersion = updatedProps.qualificationVersion;
                break;
            case FileType.RegisterProtocol:
                if (CommonUtils.isNullOrEmpty(currentUser.registerProtocolUid)) {
                    fileEntryId = CommonUtils.getUUIDForMongoDB();
                    updatedProps.registerProtocolUid = fileEntryId;
                    updatedProps.registerProtocolVersion = 0;
                } else {
                    fileEntryId = currentUser.registerProtocolUid as string;
                    updatedProps.registerProtocolVersion = currentUser.registerProtocolVersion as number + 1;
                }
                fileVersion = updatedProps.registerProtocolVersion;
                break;
            default:
                throw new ApiError(ApiResultCode.FileFailedUpload, `NotSupportedFileType:${fileType}`);
        }

        await FileStorage.$$saveEntry(
            fileEntryId,
            fileVersion,
            {
                type: FileType.Qualification,
                checked: false,
                userUid: currentUser.uid,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        // NOTE: for concurrent action, the above file save will be failed because of duplicated id
        await UserModelWrapper.$$updateOne(
            { uid: currentUser.uid } as UserObject,
            updatedProps);
        Object.assign(currentUser, updatedProps);
        return await UserRequestHandler.$$convertToDBView(currentUser);
    }
    // #endregion
}
