import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { LIMIT_LOGO_SIZE_M, LIMIT_FILE_SIZE_M } from 'common/Config';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileType } from 'common/FileType';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileRemoveParam } from 'common/requestParams/FileRemoveParam';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskDepositImageUploadParam } from 'common/requestParams/TaskDepositImageUploadParam';
import { TaskResultFileUploadParam } from 'common/requestParams/TaskResultFileUploadParam';
import { TemplateCreateParam } from 'common/requestParams/TemplateCreateParam';
import { TemplateFileEditParam } from 'common/requestParams/TemplateFileEditParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { TemplateView } from 'common/responseResults/TemplateView';
import { UserView } from 'common/responseResults/UserView';
import { TaskState } from 'common/TaskState';
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
import { TaskRequestHandler } from './TaskRequestHandler';
import { UserState } from 'common/UserState';
import { TaskHistoryItem } from 'common/TaskHistoryItem';
import { RequestUtils } from './RequestUtils';
import { TaskMarginImageUploadParam } from 'common/requestParams/TaskMarginImageUploadParam';
export class FileRequestHandler {
    // #region -- template related methods
    /**
     * create a template object with file upload
     * which is used by publisher to create task template
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$createTemplate(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TemplateView> {
        // only ready publisher user can create Template
        if (!CommonUtils.isReadyPublisher(currentUser)) {
            throw new ApiError(ApiResultCode.AuthForbidden, `Publisher:${currentUser.uid} Not Ready`);
        }
        this.checkFileSize(fileData);
        const optionData: TemplateCreateParam = JSON.parse(reqParam.optionData as string);
        const templateView: TemplateView = await this.$$createTemplateObject(
            optionData, currentUser, fileData as Express.Multer.File);
        return templateView;
    }

    /**
     * update template file by publisher owner
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$updateTemplateFile(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TemplateView> {
        // only ready publisher user can invoke this mthod
        if (!CommonUtils.isReadyPublisher(currentUser)) {
            throw new ApiError(ApiResultCode.AuthForbidden, `Publisher:${currentUser.uid} Not Ready`);
        }
        this.checkFileSize(fileData);

        const metadata: TemplateFileEditParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(metadata.templateUid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TemplateFileEditParam.templateUid should not be null');
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
     * update use qualification file which will cause user to go into qualification ToBeChecked State
     * used by user self
     * @param fileData 
     * @param reqParam 
     * @param currentUser 
     */
    public static async $$updateQualification(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<UserView> {
        let fileEntryId: string;
        const updatedProps: UserObject = {};
        if (currentUser.state === UserState.Disabled) {
            throw new ApiError(ApiResultCode.AuthForbidden, `user:${currentUser.uid} disabled`);
        }
        this.checkFileSize(fileData);
        if (CommonUtils.isNullOrEmpty(currentUser.qualificationUid)) {
            fileEntryId = CommonUtils.getUUIDForMongoDB();
            updatedProps.qualificationUid = fileEntryId;
            updatedProps.qualificationVersion = 0;
        } else {
            fileEntryId = currentUser.qualificationUid as string;
            updatedProps.qualificationVersion = currentUser.qualificationVersion as number + 1;
        }
        updatedProps.qualificationState = CheckState.ToBeChecked;

        await FileStorage.$$saveEntry(
            fileEntryId,
            updatedProps.qualificationVersion,
            {
                type: FileType.Qualification,
                checked: false,
                userUid: currentUser.uid,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);
        // update the qualificationVersion. 
        // NOTE: for concurrent action, the above file save will be failed because of duplicated id
        await UserModelWrapper.$$updateOne(
            { uid: currentUser.uid } as UserObject,
            updatedProps);
        Object.assign(currentUser, updatedProps);
        return await UserRequestHandler.$$convertToDBView(currentUser);
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
            case FileAPIScenario.UpdateUserLogo:
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
            case FileAPIScenario.UpdateUserFrontId:
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
            case FileAPIScenario.UpdateUserBackId:
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
            case FileAPIScenario.UpdateLicense:
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
            case FileAPIScenario.UpdateLicenseWithPersion:
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
            case FileAPIScenario.UpdateAuthLetter:
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
                LoggerManager.error(`Unsupported FileUploadParam.scenario:${reqParam.scenario}`);
                throw new ApiError(ApiResultCode.InputInvalidParam, 'FileUploadParam.scenario');
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

        if (!CommonUtils.isReadyPublisher(currentUser)) {
            throw new ApiError(ApiResultCode.AuthForbidden, `User:${currentUser.name} is not a ready Publisher`);
        }
        this.checkImageFileSize(fileData);
        const metadata: TaskDepositImageUploadParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(metadata.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TaskDepositImageUploadParam.uid should not be null');
        }
        const dbObj: TaskObject | null = await TaskModelWrapper.$$findOne(
            { uid: metadata.uid } as TaskObject) as TaskObject | null;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `TaskId:${metadata.uid}`);
        }
        if (dbObj.publisherUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden,
                `User:${currentUser.name} is not owner of task:${dbObj.uid}`);
        }
        const updatedProps: TaskObject = new TaskObject();
        updatedProps.state = TaskState.Deposited;
        updatedProps.receiptRequired = metadata.receiptRequired;
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
        updatedProps.state = TaskState.ReadyToAuditApply;

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
        return TaskRequestHandler.$$convertToDBView(dbObj);
    }
    // #endregion

    /**
     * every kind of file download
     * @param reqParam 
     * @param currentUser 
     * @param res 
     */
    public static async $$download(reqParam: FileDownloadParam, currentUser: UserObject, res: Response): Promise<void> {
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
                // only admin or owner can download the qualification
                if (!CommonUtils.isAdmin(currentUser.roles) &&
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
                if (!CommonUtils.isAdmin(currentUser.roles) &&
                    currentUser.logoUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadBackId:
                // only admin or owner can download logo
                if (!CommonUtils.isAdmin(currentUser.roles) &&
                    currentUser.backIdUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadFrontId:
                // only admin or owner can download logo
                if (!CommonUtils.isAdmin(currentUser.roles) &&
                    currentUser.frontIdUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadAuthLetter:
                // only admin or owner can download logo
                if (!CommonUtils.isAdmin(currentUser.roles) &&
                    currentUser.authLetterUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadAuthLetter:
                // only admin or owner can download logo
                if (!CommonUtils.isAdmin(currentUser.roles) &&
                    currentUser.authLetterUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadLicense:
                // only admin or owner can download logo
                if (!CommonUtils.isAdmin(currentUser.roles) &&
                    currentUser.licenseUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadLinceWithPerson:
                // only admin or owner can download logo
                if (!CommonUtils.isAdmin(currentUser.roles) &&
                    currentUser.licenseWithPersonUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadTaskResultFile:
                taskObj = await TaskModelWrapper.$$findOne(
                    { resultFileUid: reqParam.fileId } as TaskObject) as TaskObject;
                if (taskObj == null) {
                    throw new ApiError(ApiResultCode.DbNotFound, `Task with resultFileUid:${reqParam.fileId}`);
                }
                if (!CommonUtils.isAdmin(currentUser.roles) && taskObj.publisherUid !== currentUser.uid) {
                    throw new ApiError(ApiResultCode.AuthForbidden,
                        `User:${currentUser.name} No Auth on task:${taskObj.name}`);
                }
                break;
            case FileAPIScenario.DownloadQualificationTemplate:
                const admin: UserObject = await UserModelWrapper.$$findOne(
                    { uid: UserModelWrapper.adminUID } as UserObject) as UserObject;
                if (CommonUtils.isNullOrEmpty(admin.qualificationUid)) {
                    throw new ApiError(ApiResultCode.DbNotFound);
                }
                fileId = admin.qualificationUid as string;
                version = admin.qualificationVersion as number;
                break;
            case FileAPIScenario.DownloadTaskDepositImage:
                taskObj = await TaskModelWrapper.$$findOne(
                    { depositImageUid: reqParam.fileId } as TaskObject) as TaskObject;
                if (taskObj == null) {
                    throw new ApiError(ApiResultCode.DbNotFound, `depositImageUid:${reqParam.fileId}`);
                }
                // only admin or owner can download
                if (!CommonUtils.isAdmin(currentUser.roles) &&
                    currentUser.uid !== taskObj.publisherUid) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadTaskMarginImage:
                taskObj = await TaskModelWrapper.$$findOne(
                    { marginImageUid: reqParam.fileId } as TaskObject) as TaskObject;
                if (taskObj == null) {
                    throw new ApiError(ApiResultCode.DbNotFound, `marginImageUid:${reqParam.fileId}`);
                }
                // only admin or owner can download
                if (!CommonUtils.isAdmin(currentUser.roles) &&
                    currentUser.uid !== taskObj.publisherUid) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            default:
                throw new ApiError(ApiResultCode.InputInvalidScenario);
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
    public static async $$createTemplateObject(
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

    public static checkImageFileSize(fileData: Express.Multer.File): void {
        this.checkFileSize(fileData, LIMIT_LOGO_SIZE_M);
    }

    public static checkFileSize(fileData: Express.Multer.File, limit?: number): void {
        if (limit == null) {
            limit = LIMIT_FILE_SIZE_M;
        }
        const imageSize: number = fileData.size;
        if ((fileData as Express.Multer.File).size / 1024 / 1024 > limit) {
            LoggerManager.error(`ImageSize:${imageSize} too large`);
            throw new ApiError(ApiResultCode.InputImageTooLarge);
        }
    }
    // #region
}
