import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { LIMIT_FILE_SIZE_M, LIMIT_LOGO_SIZE_M } from 'common/Constants';
import { FeeCalculator } from 'common/FeeCalculator';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileType } from 'common/FileType';
import { ReceiptState } from 'common/ReceiptState';
import { RefundScenario } from 'common/RefundScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileRemoveParam } from 'common/requestParams/FileRemoveParam';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskDepositImageUploadParam } from 'common/requestParams/TaskDepositImageUploadParam';
import { TaskExecutorReceiptUploadParam } from 'common/requestParams/TaskExecutorReceiptUploadParam';
import { TaskMarginImageUploadParam } from 'common/requestParams/TaskMarginImageUploadParam';
import { TaskPayToExecutorImageUploadParam } from 'common/requestParams/TaskPayToExecutorImageUploadParam';
import { TaskRefundImageUploadParam } from 'common/requestParams/TaskRefundImageUploadParam';
import { TaskResultFileUploadParam } from 'common/requestParams/TaskResultFileUploadParam';
import { TemplateCreateParam } from 'common/requestParams/TemplateCreateParam';
import { TemplateFileEditParam } from 'common/requestParams/TemplateFileEditParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { TemplateView } from 'common/responseResults/TemplateView';
import { UserView } from 'common/responseResults/UserView';
import { TaskState } from 'common/TaskState';
import { Request, Response } from 'express';
import { ApiError } from 'server/common/ApiError';
import { TaskApplicationModelWrapper } from 'server/dataModels/TaskApplicationModelWrapper';
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
     * upload user Identity related images which will cause user to go into Id ToBoChecked state
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$uploadUserIdImages(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<UserView> {
        RequestUtils.readyUserCheck(currentUser);
        this.checkImageFileSize(fileData);
        let fileIdToCreate: string;
        let fileType: FileType;
        const allUpdatedProps: UserObject = {};
        allUpdatedProps.idState = CheckState.ToBeChecked;
        switch (reqParam.scenario) {
            case FileAPIScenario.UploadUserLogo:
                if (CommonUtils.isNullOrEmpty(currentUser.logoUid)) {
                    fileIdToCreate = CommonUtils.getUUIDForMongoDB();
                    allUpdatedProps.logoUid = fileIdToCreate;
                } else {
                    fileIdToCreate = currentUser.logoUid as string;
                    // remove existing one
                    await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                }
                fileType = FileType.UserLogo;
                allUpdatedProps.logoState = CheckState.ToBeChecked;
                break;
            case FileAPIScenario.UploadUserFrontId:
                if (CommonUtils.isNullOrEmpty(currentUser.frontIdUid)) {
                    fileIdToCreate = CommonUtils.getUUIDForMongoDB();
                    allUpdatedProps.frontIdUid = fileIdToCreate;
                } else {
                    fileIdToCreate = currentUser.frontIdUid as string;
                    // remove existing one
                    await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                }
                fileType = FileType.FrontId;
                allUpdatedProps.frontIdState = CheckState.ToBeChecked;
                break;
            case FileAPIScenario.UploadUserBackId:
                if (CommonUtils.isNullOrEmpty(currentUser.backIdUid)) {
                    fileIdToCreate = CommonUtils.getUUIDForMongoDB();
                    allUpdatedProps.backIdUid = fileIdToCreate;
                } else {
                    fileIdToCreate = currentUser.backIdUid as string;
                    // remove existing one
                    await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                }
                fileType = FileType.BackId;
                allUpdatedProps.backIdState = CheckState.ToBeChecked;
                break;
            case FileAPIScenario.UploadLicense:
                if (CommonUtils.isNullOrEmpty(currentUser.licenseUid)) {
                    fileIdToCreate = CommonUtils.getUUIDForMongoDB();
                    allUpdatedProps.licenseUid = fileIdToCreate;
                } else {
                    fileIdToCreate = currentUser.licenseUid as string;
                    // remove existing one
                    await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                }
                fileType = FileType.License;
                allUpdatedProps.licenseState = CheckState.ToBeChecked;
                break;
            case FileAPIScenario.UploadLicenseWithPerson:
                if (CommonUtils.isNullOrEmpty(currentUser.licenseWithPersonUid)) {
                    fileIdToCreate = CommonUtils.getUUIDForMongoDB();
                    allUpdatedProps.licenseWithPersonUid = fileIdToCreate;
                } else {
                    fileIdToCreate = currentUser.licenseWithPersonUid as string;
                    // remove existing one
                    await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                }
                fileType = FileType.LicenseWithPerson;
                allUpdatedProps.licenseWidthPersonState = CheckState.ToBeChecked;
                break;
            case FileAPIScenario.UploadAuthLetter:
                if (CommonUtils.isNullOrEmpty(currentUser.authLetterUid)) {
                    fileIdToCreate = CommonUtils.getUUIDForMongoDB();
                    allUpdatedProps.authLetterUid = fileIdToCreate;
                } else {
                    fileIdToCreate = currentUser.authLetterUid as string;
                    // remove existing one
                    await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                }
                fileType = FileType.AuthLetter;
                allUpdatedProps.authLetterState = CheckState.ToBeChecked;
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
            allUpdatedProps);
        Object.assign(currentUser, allUpdatedProps);

        return UserRequestHandler.$$convertToDBView(currentUser);
    }
    // #endregion

    // #region -- task related methods
    /**
     * upload task deposit image which will cause task to be DepositeUploaded state
     * used by publisher owner
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$uploadTaskDepositImage(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TaskView> {
        // param check
        if (reqParam.optionData == null) {
            reqParam.optionData = '{}';
        }
        const optionData: TaskDepositImageUploadParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(optionData.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, reqParam.optionData as string);
        }
        this.checkImageFileSize(fileData);

        // user check
        RequestUtils.readyPublisherCheck(currentUser);

        // task check
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(optionData.uid as string, TaskState.Submitted);
        if (dbObj.publisherUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.Auth_Not_Task_Publisher_Onwer,
                `User:${currentUser.name} is not owner of task:${dbObj.uid}`);
        }
        const allUpdatedProps: TaskObject = new TaskObject();
        allUpdatedProps.state = TaskState.DepositUploaded;
        // pick up the props in param and assign to updatedProps object
        Object.assign(allUpdatedProps, RequestUtils.pickUpPropsByModel(
            optionData, new TaskDepositImageUploadParam(true)), true);

        if (CommonUtils.isNullOrEmpty(dbObj.depositImageUid)) {
            allUpdatedProps.depositImageUid = CommonUtils.getUUIDForMongoDB();
        } else {
            // remove existing one
            await FileStorage.$$deleteEntry(dbObj.depositImageUid as string, 0);
            allUpdatedProps.depositImageUid = dbObj.depositImageUid;
        }

        await FileStorage.$$saveEntry(
            allUpdatedProps.depositImageUid as string,
            0,
            {
                type: FileType.Deposit,
                checked: true,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        // add history item
        await TaskModelWrapper.$$addHistoryItem(
            dbObj.uid as string,
            TaskState.DepositUploaded,
            CommonUtils.getStepTitleByTaskState(TaskState.DepositUploaded));

        // update object
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, allUpdatedProps);
        Object.assign(dbObj, allUpdatedProps);
        return TaskRequestHandler.$$convertToDBView(dbObj);
    }

    /**
     * update task margin image which will cause task to be ReadyToAuditApply state
     * used by executor owner
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$uploadTaskMarginImage(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TaskView> {
        if (reqParam.optionData == null) {
            reqParam.optionData = '{}';
        }
        RequestUtils.readyExecutorCheck(currentUser);
        this.checkImageFileSize(fileData);
        const optionData: TaskMarginImageUploadParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(optionData.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, reqParam.optionData as string);
        }
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(optionData.uid as string, TaskState.Applying);

        if (dbObj.applicantUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.Auth_Not_Task_Applicant,
                `User:${currentUser.name} is not applicant of task:${dbObj.uid}`);
        }

        const allUpdatedProps: TaskObject = new TaskObject();
        allUpdatedProps.marginAditState = CheckState.ToBeChecked;
        allUpdatedProps.state = TaskState.MarginUploaded;
        if (CommonUtils.isNullOrEmpty(dbObj.marginImageUid)) {
            allUpdatedProps.marginImageUid = CommonUtils.getUUIDForMongoDB();
        } else {
            // remove existing one
            await FileStorage.$$deleteEntry(dbObj.marginImageUid as string, 0);
            allUpdatedProps.marginImageUid = dbObj.marginImageUid;
        }

        await FileStorage.$$saveEntry(
            allUpdatedProps.marginImageUid as string,
            0,
            {
                type: FileType.Margin,
                checked: true,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        await TaskModelWrapper.$$addHistoryItem(
            dbObj.uid as string,
            TaskState.MarginUploaded,
            CommonUtils.getStepTitleByTaskState(TaskState.MarginUploaded));
        await TaskApplicationModelWrapper.$$deleteByTaskId(dbObj.uid as string);

        // update object
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, allUpdatedProps);
        Object.assign(dbObj, allUpdatedProps);
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
        // param check
        if (reqParam.optionData == null) {
            reqParam.optionData = '{}';
        }
        this.checkImageFileSize(fileData);
        const metadata: TaskRefundImageUploadParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(metadata.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, reqParam.optionData as string);
        }

        // use check
        RequestUtils.adminCheck(currentUser);

        let dbObj: TaskObject;
        let fileType: FileType;
        let fileId: string;
        let historyItemState: TaskState;
        const allUpdatedProps: TaskObject = new TaskObject();
        if (metadata.scenario === RefundScenario.DepositRefund) {
            dbObj = await RequestUtils.$$taskStateCheck(metadata.uid as string, TaskState.DepositUploaded);
            if (CommonUtils.isNullOrEmpty(dbObj.depositRefundImageUid)) {
                allUpdatedProps.depositRefundImageUid = CommonUtils.getUUIDForMongoDB();
            } else {
                // remove existing one
                await FileStorage.$$deleteEntry(dbObj.depositRefundImageUid as string, 0);
            }
            allUpdatedProps.state = TaskState.Created;
            fileType = FileType.DepositRefund;
            fileId = allUpdatedProps.depositRefundImageUid as string;
            historyItemState = TaskState.DepositRefund;
        } else {
            dbObj = await RequestUtils.$$taskStateCheck(metadata.uid as string, TaskState.MarginUploaded);
            if (CommonUtils.isNullOrEmpty(dbObj.marginRefundImageUid)) {
                allUpdatedProps.marginRefundImageUid = CommonUtils.getUUIDForMongoDB();
            } else {
                // remove existing one
                await FileStorage.$$deleteEntry(dbObj.marginRefundImageUid as string, 0);
            }
            allUpdatedProps.state = TaskState.ReadyToApply;
            fileType = FileType.MarginRefund;
            fileId = allUpdatedProps.marginRefundImageUid as string;
            historyItemState = TaskState.MarginRefund;
        }


        await FileStorage.$$saveEntry(
            fileId,
            0,
            {
                type: fileType,
                checked: true,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);


        await TaskModelWrapper.$$addHistoryItem(
            dbObj.uid as string, historyItemState, CommonUtils.getStepTitleByTaskState(historyItemState));

        // update object
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, allUpdatedProps);
        Object.assign(dbObj, allUpdatedProps);

        return TaskRequestHandler.$$convertToDBView(dbObj);
    }

    /**
     * upload Task Result file which will cause Task to go into ResultUploaded state
     * used by assigned executor
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$uploadTaskResult(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TaskView> {
        // param check
        if (reqParam.optionData == null) {
            reqParam.optionData = '{}';
        }
        this.checkFileSize(fileData);
        const optionData: TaskResultFileUploadParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(optionData.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, reqParam.optionData as string);
        }
        // user check
        RequestUtils.readyExecutorCheck(currentUser);

        // task check
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(optionData.uid as string, TaskState.Assigned);
        if (dbObj.executorUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.Auth_Not_Task_Assigned_Executor,
                `Task:${dbObj.name} is not assigned to Executor:${currentUser.name}`);
        }

        const allUpdatedProps: TaskObject = new TaskObject();
        allUpdatedProps.state = TaskState.ResultUploaded;
        allUpdatedProps.resultTime = Date.now();
        if (CommonUtils.isNullOrEmpty(dbObj.resultFileUid)) {
            allUpdatedProps.resultFileUid = CommonUtils.getUUIDForMongoDB();
            allUpdatedProps.resultFileversion = 0;
        } else {
            allUpdatedProps.resultFileUid = dbObj.resultFileUid;
            allUpdatedProps.resultFileversion = dbObj.resultFileversion as number + 1;
        }


        await FileStorage.$$saveEntry(
            allUpdatedProps.resultFileUid as string,
            allUpdatedProps.resultFileversion as number,
            {
                type: FileType.TaskResult,
                checked: true,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);


        await TaskModelWrapper.$$addHistoryItem(
            dbObj.uid as string,
            TaskState.ResultUploaded,
            CommonUtils.getStepTitleByTaskState(TaskState.ResultUploaded));

        // update object
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, allUpdatedProps);

        Object.assign(dbObj, allUpdatedProps);
        return TaskRequestHandler.$$convertToDBView(dbObj);
    }


    /**
     * used by admin to upload task pay_to_executor image
     * 
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$uploadTaskExecutorPaymentImage(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TaskView> {
        if (reqParam.optionData == null) {
            reqParam.optionData = '{}';
        }
        const optionData: TaskPayToExecutorImageUploadParam = JSON.parse(reqParam.optionData as string);
        // param check
        if (CommonUtils.isNullOrEmpty(optionData.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, reqParam.optionData as string);
        }
        this.checkImageFileSize(fileData);

        // user check
        RequestUtils.adminCheck(currentUser);

        // task check
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(
            optionData.uid as string, TaskState.PublisherVisited);

        const allUpdatedProps: TaskObject = new TaskObject();
        // pick up the props in param and assign to updatedProps object
        Object.assign(allUpdatedProps, RequestUtils.pickUpPropsByModel(
            optionData, new TaskPayToExecutorImageUploadParam(true)), true);
        // if receipt state has been set in receipt upload or NotRequire set, we should keep the state consistence
        if (dbObj.executorReceiptRequired != null &&
            dbObj.executorReceiptRequired !== ReceiptState.None &&
            allUpdatedProps.executorReceiptRequired !== dbObj.executorReceiptRequired) {
            throw new ApiError(ApiResultCode.Logic_Receipt_State_Not_Matched);
        }

        // only both receipt upload(or NotRequired) and executor payment done, 
        // we can set the TaskState.ExecutorPaid. 
        // so we should check the receipt state here
        if ((!CommonUtils.isNullOrEmpty(dbObj.executorReceiptImageUid) &&
            dbObj.executorReceiptRequired === ReceiptState.Required) ||
            (!CommonUtils.isNullOrEmpty(dbObj.executorReceiptNote &&
                dbObj.executorReceiptRequired === ReceiptState.Required))) {
            allUpdatedProps.state = TaskState.ExecutorPaid;
        }

        if (CommonUtils.isNullOrEmpty(dbObj.payToExecutorImageUid)) {
            allUpdatedProps.payToExecutorImageUid = CommonUtils.getUUIDForMongoDB();
        } else {
            // remove existing one
            await FileStorage.$$deleteEntry(dbObj.payToExecutorImageUid as string, 0);
            allUpdatedProps.payToExecutorImageUid = dbObj.payToExecutorImageUid;
        }
        allUpdatedProps.paymentToExecutor = FeeCalculator.calcPaymentToExecutor(
            dbObj.reward as number,
            dbObj.proposedMargin as number,
            dbObj.executorReceiptRequired as ReceiptState);

        await FileStorage.$$saveEntry(
            allUpdatedProps.payToExecutorImageUid as string,
            0,
            {
                type: FileType.TaskPayToExecutor,
                checked: true,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);
        // add history item
        if (allUpdatedProps.state === TaskState.ExecutorPaid) {
            await TaskModelWrapper.$$addHistoryItem(
                dbObj.uid as string,
                TaskState.ExecutorPaid,
                CommonUtils.getStepTitleByTaskState(TaskState.ExecutorPaid));
        }
        // update object
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, allUpdatedProps);
        Object.assign(dbObj, allUpdatedProps);
        return TaskRequestHandler.$$convertToDBView(dbObj);
    }

    /**
     * used by admin to upload task receipt image from executor
     * 
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$uploadExecutorReceiptImage(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TaskView> {
        // parameter check
        if (reqParam.optionData == null) {
            reqParam.optionData = '{}';
        }
        const optionData: TaskExecutorReceiptUploadParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(optionData.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, reqParam.optionData as string);
        }
        this.checkImageFileSize(fileData);

        // user check
        RequestUtils.adminCheck(currentUser);

        // task check
        const dbObj: TaskObject = await RequestUtils.$$taskStateCheck(
            optionData.uid as string, TaskState.PublisherVisited);
        // here we should make sure the executorReceiptRequired keeps consistent
        if (dbObj.executorReceiptRequired === ReceiptState.NotRequired) {
            throw new ApiError(ApiResultCode.Logic_Receipt_State_Not_Matched);
        }

        const allUpdatedProps: TaskObject = new TaskObject();
        allUpdatedProps.executorReceiptRequired = ReceiptState.Required;
        // pick up the props in param and assign to updatedProps object
        Object.assign(allUpdatedProps, RequestUtils.pickUpPropsByModel(
            optionData, new TaskExecutorReceiptUploadParam(true)), true);

        if (CommonUtils.isNullOrEmpty(dbObj.executorReceiptImageUid)) {
            allUpdatedProps.executorReceiptImageUid = CommonUtils.getUUIDForMongoDB();
        } else {
            // remove existing one
            await FileStorage.$$deleteEntry(dbObj.executorReceiptImageUid as string, 0);
            allUpdatedProps.executorReceiptImageUid = dbObj.executorReceiptImageUid;
        }

        // only update the state when both executor receipt and executor payment done
        if (!CommonUtils.isNullOrEmpty(dbObj.payToExecutorImageUid)) {
            allUpdatedProps.state = TaskState.ExecutorPaid;
        }

        await FileStorage.$$saveEntry(
            allUpdatedProps.executorReceiptImageUid as string,
            0,
            {
                type: FileType.TaskReceipt,
                checked: true,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        if (allUpdatedProps.state === TaskState.ExecutorPaid) {
            // add history
            await TaskModelWrapper.$$addHistoryItem(
                dbObj.uid as string,
                TaskState.ExecutorPaid,
                CommonUtils.getStepTitleByTaskState(TaskState.ExecutorPaid));
        }

        // update object
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, allUpdatedProps);
        Object.assign(dbObj, allUpdatedProps);
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
        const reqParam: FileDownloadParam = RequestUtils.replaceNullWithObject(req.body) as FileDownloadParam;
        if (reqParam.scenario == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam, JSON.stringify(reqParam));
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
                // only admin or owner can download
                currentUser = await RequestUtils.$$getCurrentUser(req);
                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.logoUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadBackId:
                // only admin or owner can download
                currentUser = await RequestUtils.$$getCurrentUser(req);
                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.backIdUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadFrontId:
                // only admin or owner can download
                currentUser = await RequestUtils.$$getCurrentUser(req);
                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.frontIdUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadAuthLetter:
                // only admin or owner can download
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
                // only admin or task publisher owner can download result file
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
                // everyone can download 
                admin = await UserModelWrapper.$$findOne(
                    { uid: UserModelWrapper.adminUID } as UserObject) as UserObject;
                if (CommonUtils.isNullOrEmpty(admin.qualificationUid)) {
                    throw new ApiError(ApiResultCode.Db_Qualification_Template_Missed);
                }
                fileId = admin.qualificationUid as string;
                version = admin.qualificationVersion as number;
                break;
            case FileAPIScenario.DownloadRegisterProtocol:
                // every can download
                admin = await UserModelWrapper.$$findOne(
                    { uid: UserModelWrapper.adminUID } as UserObject) as UserObject;
                if (CommonUtils.isNullOrEmpty(admin.registerProtocolUid)) {
                    throw new ApiError(ApiResultCode.DbNotFound);
                }
                fileId = admin.registerProtocolUid as string;
                version = admin.registerProtocolVersion as number;
                break;
            case FileAPIScenario.DownloadTaskDepositImage:
                // only admin or owner can download
                currentUser = await RequestUtils.$$getCurrentUser(req);
                taskObj = await TaskModelWrapper.$$findOne(
                    { depositImageUid: reqParam.fileId } as TaskObject) as TaskObject;
                if (taskObj == null) {
                    throw new ApiError(ApiResultCode.DbNotFound, `depositImageUid:${reqParam.fileId}`);
                }

                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.uid !== taskObj.publisherUid) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadTaskMarginImage:
                // only admin or task publisher owner can download
                currentUser = await RequestUtils.$$getCurrentUser(req);
                taskObj = await TaskModelWrapper.$$findOne(
                    { marginImageUid: reqParam.fileId } as TaskObject) as TaskObject;
                if (taskObj == null) {
                    throw new ApiError(ApiResultCode.DbNotFound, `marginImageUid:${reqParam.fileId}`);
                }

                if (!CommonUtils.isAdmin(currentUser) &&
                    currentUser.uid !== taskObj.publisherUid) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            default:
                throw new ApiError(ApiResultCode.InputInvalidFileScenario);
        }
        if (CommonUtils.isNullOrEmpty(fileId) || version === -1) {
            throw new ApiError(ApiResultCode.InputInvalidParam, JSON.stringify(reqParam));
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
    /**
     * 
     * @param reqParam 
     * @param currentUser 
     * @param fileData 
     */
    private static async $$createTemplateObject(
        reqParam: TemplateCreateParam,
        currentUser: UserObject,
        fileData: Express.Multer.File): Promise<TemplateView> {
        if (CommonUtils.isNullOrEmpty(reqParam.name)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, JSON.stringify(reqParam));
        }
        let dbObj: TemplateObject = new TemplateObject();
        dbObj.uid = CommonUtils.getUUIDForMongoDB();
        dbObj.name = reqParam.name;
        dbObj.note = reqParam.note || '';
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
        const allUpdatedProps: UserObject = {};
        // user check
        RequestUtils.readyUserCheck(currentUser);

        // param check
        this.checkFileSize(fileData);

        switch (fileType) {
            case FileType.Qualification:
                if (CommonUtils.isNullOrEmpty(currentUser.qualificationUid)) {
                    fileEntryId = CommonUtils.getUUIDForMongoDB();
                    allUpdatedProps.qualificationUid = fileEntryId;
                    allUpdatedProps.qualificationVersion = 0;
                } else {
                    fileEntryId = currentUser.qualificationUid as string;
                    allUpdatedProps.qualificationVersion = currentUser.qualificationVersion as number + 1;
                }
                allUpdatedProps.qualificationState = CheckState.ToBeChecked;
                fileVersion = allUpdatedProps.qualificationVersion;
                break;
            case FileType.RegisterProtocol:
                if (CommonUtils.isNullOrEmpty(currentUser.registerProtocolUid)) {
                    fileEntryId = CommonUtils.getUUIDForMongoDB();
                    allUpdatedProps.registerProtocolUid = fileEntryId;
                    allUpdatedProps.registerProtocolVersion = 0;
                } else {
                    fileEntryId = currentUser.registerProtocolUid as string;
                    allUpdatedProps.registerProtocolVersion = currentUser.registerProtocolVersion as number + 1;
                }
                fileVersion = allUpdatedProps.registerProtocolVersion;
                break;
            default:
                throw new ApiError(ApiResultCode.MethodNotImplemented, `NotSupportedFileType:${fileType}`);
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
            allUpdatedProps);
        Object.assign(currentUser, allUpdatedProps);
        return await UserRequestHandler.$$convertToDBView(currentUser);
    }
    // #endregion
}
