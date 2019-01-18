import { CommonUtils } from 'common/CommonUtils';
import { LIMIT_LOGO_SIZE_M } from 'common/Config';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileType } from 'common/FileType';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileRemoveParam } from 'common/requestParams/FileRemoveParam';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskResultFileUploadParam } from 'common/requestParams/TaskResultFileUploadParam';
import { TemplateCreateParam } from 'common/requestParams/TemplateCreateParam';
import { TemplateFileEditParam } from 'common/requestParams/TemplateFileEditParam';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { CheckState } from 'common/CheckState';
import { TaskView } from 'common/responseResults/TaskView';
import { TemplateView } from 'common/responseResults/TemplateView';
import { UserView } from 'common/responseResults/UserView';
import { TaskState } from 'common/TaskState';
import { UserState } from 'common/UserState';
import { Response } from 'express';
import { ApiError } from 'server/common/ApiError';
import { AppStatus } from 'server/common/AppStatus';
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
export class FileRequestHandler {
    public static async $$createTemplate(
        fileData: Express.Multer.File | NodeJS.ReadableStream,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TemplateView> {
        // only publisher user can create Template
        if (!CommonUtils.isPublisher(currentUser.roles)) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        const optionData: TemplateCreateParam = JSON.parse(reqParam.optionData as string);
        const templateView: TemplateView = await this.$$createTemplateObject(
            optionData, currentUser, fileData as Express.Multer.File);
        return templateView;
    }

    public static async $$updateTemplateFile(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TemplateView> {

        const metadata: TemplateFileEditParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(metadata.templateUid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TemplateFileEditParam.templateUid should not be null');
        }
        const dbObj: TemplateObject | null = await TemplateModelWrapper.$$findOne(
            { uid: metadata.templateUid } as TemplateObject) as TemplateObject | null;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `TemplateId:${metadata.templateUid}`);
        }

        // only owner user can update Template file
        if (dbObj.ownerUid !== currentUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden);
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
    public static async $$updateQualification(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<UserView> {
        let fileEntryId: string;
        const updatedProps: UserObject = {};
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

    public static async $$createUser(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam): Promise<UserView> {
        if (reqParam == null || reqParam.optionData == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'FileUploadParam or FileUploadParam.metadata should not be null in $$createUser');
        }

        const optionData: UserCreateParam = JSON.parse(reqParam.optionData as string);
        if (optionData == null || CommonUtils.isNullOrEmpty(optionData.name)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'FileUploadParam.metadata should not be null in $$createUser');
        }
        const userName: string = optionData.name as string;
        if (CommonUtils.isNullOrEmpty(userName)) {
            throw new ApiError(ApiResultCode.InputInvalidParam, 'UserCreateParam.name');
        }
        const logoSize: number = (fileData as Express.Multer.File).size;
        if (fileData.size / 1024 / 1024 > LIMIT_LOGO_SIZE_M) {
            LoggerManager.error(`LogoSize:${logoSize} too large for user:${userName}`);
            throw new ApiError(ApiResultCode.InputImageTooLarge);
        }

        // create user db object
        const view: UserView = await this.$$createUserObject(optionData, fileData);
        if (CommonUtils.isAdmin(view.roles)) {
            AppStatus.isSystemInitialized = true;
        }
        return view;
    }
    public static async $$updateUserFile(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<UserView> {
        const imageSize: number = (fileData as Express.Multer.File).size;
        if ((fileData as Express.Multer.File).size / 1024 / 1024 > LIMIT_LOGO_SIZE_M) {
            LoggerManager.error(`ImageSize:${imageSize} too large for user:${currentUser.name}`);
            throw new ApiError(ApiResultCode.InputImageTooLarge);
        }
        let fileIdToCreate: string;
        let fileType: FileType;
        const updatedProps: UserObject = {};
        switch (reqParam.scenario) {
            case FileAPIScenario.UpdateUserLogo:
                fileIdToCreate = currentUser.logoUid as string;
                fileType = FileType.UserLogo;
                updatedProps.logoState = CheckState.ToBeChecked;
                // remove existing one
                await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                break;
            case FileAPIScenario.UpdateUserFrontId:
                if (CommonUtils.isNullOrEmpty(currentUser.frontIdUid)) {
                    fileIdToCreate = CommonUtils.getUUIDForMongoDB();
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
                } else {
                    fileIdToCreate = currentUser.licenseWithPersonUid as string;
                    // remove existing one
                    await FileStorage.$$deleteEntry(fileIdToCreate, 0);
                }
                fileType = FileType.LicenseWithPerson;
                updatedProps.licenseWidthPersonState = CheckState.ToBeChecked;
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

        return UserRequestHandler.$$convertToDBView(currentUser);
    }

    public static async $$updateTaskResultFile(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam,
        currentDBUser: UserObject): Promise<TaskView> {
        // only task executor can update Result file
        if (!CommonUtils.isExecutor(currentDBUser.roles)) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }

        const metadata: TaskResultFileUploadParam = JSON.parse(reqParam.optionData as string);
        if (CommonUtils.isNullOrEmpty(metadata.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TaskResultFileUploadParam.uid should not be null');
        }
        const dbObj: TaskObject | null = await TaskModelWrapper.$$findOne(
            { uid: metadata.uid } as TaskObject) as TaskObject | null;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `TaskId:${metadata.uid}`);
        }
        if (dbObj.executorUid !== currentDBUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }
        const updatedProps: TaskObject = new TaskObject();
        if (CommonUtils.isNullOrEmpty(dbObj.resultFileUid)) {
            updatedProps.resultFileUid = CommonUtils.getUUIDForMongoDB();
            updatedProps.resultFileversion = 0;
        } else {
            updatedProps.resultFileversion = dbObj.resultFileversion as number + 1;
        }
        updatedProps.state = TaskState.ResultUploaded;
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

        // update version
        await TaskModelWrapper.$$updateOne({ uid: dbObj.uid } as TaskObject, updatedProps);
        return TaskRequestHandler.$$convertToDBView(dbObj);
    }

    public static async $$download(reqParam: FileDownloadParam, currentUser: UserObject, res: Response): Promise<void> {
        if (reqParam == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'FileDownloadParam should not be null');
        }
        if (CommonUtils.isNullOrEmpty(reqParam.fileId)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'FileDownloadParam.fileId should not be null');
        }
        if (reqParam.scenario == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'FileDownloadParam.scenario should not be null');
        }

        if (reqParam.version == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'FileDownloadParam.version should not be null');
        }
        // transform request param
        const scenario: FileAPIScenario = Number.parseInt(reqParam.scenario as any, 10);
        reqParam.scenario = scenario;
        switch (scenario) {
            case FileAPIScenario.DownloadQualificationFile:
                // only admin or owner can download the qualification
                if (!CommonUtils.isAdmin(currentUser.roles) &&
                    currentUser.qualificationUid !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadTemplateFile:
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
            case FileAPIScenario.DownloadTaskResultFile:
                const taskObj: TaskObject = await TaskModelWrapper.$$findOne(
                    { resultFileUid: reqParam.fileId } as TaskObject) as TaskObject;
                if (taskObj == null) {
                    throw new ApiError(ApiResultCode.DbNotFound);
                }
                if (taskObj.publisherUid !== currentUser.uid) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            default:
                throw new ApiError(ApiResultCode.InputInvalidScenario);
        }
        reqParam.version = Number.parseInt(reqParam.version as any, 10);
        const metadata = await FileStorage.$$getEntryMetaData(`${reqParam.fileId}_${reqParam.version}`);
        if (metadata != null && metadata.originalFileName != null) {
            res.header('content-disposition', encodeURI(`filename=${metadata.originalFileName}`));
        }
        const readStream = FileStorage.createReadStream(reqParam.fileId as string, reqParam.version);
        await FileStorage.$$pipeStreamPromise(readStream, res);
    }

    public static async $$deleteOne(reqParam: FileRemoveParam) {
        await FileStorage.$$deleteEntry(reqParam.fileId as string, reqParam.version);
    }

    // #region -- inner props and methods
    public static async $$createUserObject(
        reqParam: UserCreateParam,
        fileData: Express.Multer.File): Promise<UserView> {
        let dbObj: UserObject = new UserObject();
        if (CommonUtils.isNullOrEmpty(reqParam.name)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.name');
        }
        dbObj.name = reqParam.name;

        if (CommonUtils.isNullOrEmpty(reqParam.email)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.email');
        }
        dbObj.email = reqParam.email;

        if (CommonUtils.isNullOrEmpty(reqParam.password)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.password');
        }
        dbObj.password = reqParam.password;

        if (CommonUtils.isNullOrEmpty(reqParam.telephone)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.telephone');
        }
        dbObj.telephone = reqParam.telephone;

        if (reqParam.type == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.type');
        }
        dbObj.type = reqParam.type;

        if (reqParam.roles == null || reqParam.roles.length === 0) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.roles');
        }
        dbObj.roles = reqParam.roles;

        if (CommonUtils.isAdmin(dbObj.roles)) {
            dbObj.uid = UserModelWrapper.adminUID;
        } else {
            dbObj.uid = CommonUtils.getUUIDForMongoDB();
        }
        dbObj.logoUid = CommonUtils.getUUIDForMongoDB();
        dbObj.logoState = CheckState.ToBeChecked;
        dbObj.qualificationState = CheckState.Missed;
        dbObj.frontIdState = CheckState.Missed;
        dbObj.backIdState = CheckState.Missed;
        dbObj.state = UserState.Enabled;

        // save logo file
        await FileStorage.$$saveEntry(
            dbObj.logoUid,
            0, // version
            {
                type: FileType.UserLogo,
                checked: false,
                userUid: dbObj.uid,
                originalFileName: fileData.originalname,
            } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        // if admin has been existing, the following sentence will throw dup error
        dbObj = await UserModelWrapper.$$create(dbObj) as UserObject;

        return await UserRequestHandler.$$convertToDBView(dbObj);
    }

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
        dbObj.ownerUid = currentUser.uid;
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
    // #region
}
