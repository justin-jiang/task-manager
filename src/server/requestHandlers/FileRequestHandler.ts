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
import { LogoState } from 'common/responseResults/LogoState';
import { QualificationState } from 'common/responseResults/QualificationState';
import { TaskView } from 'common/responseResults/TaskView';
import { TemplateView } from 'common/responseResults/TemplateView';
import { UserView } from 'common/responseResults/UserView';
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
        const metadata: TemplateCreateParam = JSON.parse(reqParam.metadata as string);
        const templateView: TemplateView = await this.$$createTemplateObject(
            metadata, currentUser, fileData as Express.Multer.File);
        return templateView;
    }

    public static async $$updateTemplateFile(
        fileData: Express.Multer.File | NodeJS.ReadableStream,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<TemplateView> {

        const metadata: TemplateFileEditParam = JSON.parse(reqParam.metadata as string);
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
        await FileStorage.$$saveEntry(
            fileEntryId,
            dbObj.version,
            { type: FileType.Template, checked: true } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        // update version
        await TemplateModelWrapper.$$updateOne(
            { uid: dbObj.uid } as TemplateObject,
            { version: dbObj.version } as TemplateObject);
        return TemplateRequestHandler.$$convertToDBView(dbObj);
    }
    public static async $$updateQualification(
        fileData: Express.Multer.File | NodeJS.ReadableStream,
        reqParam: FileUploadParam,
        currentUser: UserObject): Promise<void> {
        let fileEntryId: string;
        let version: number = 0;
        if (CommonUtils.isNullOrEmpty(currentUser.qualificationId)) {
            fileEntryId = CommonUtils.getUUIDForMongoDB();
        } else {
            fileEntryId = currentUser.qualificationId as string;
            version = currentUser.qualificationVersion as number + 1;
        }

        await FileStorage.$$saveEntry(
            fileEntryId,
            version,
            { type: FileType.Qualification, checked: false, userUid: currentUser.uid } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);
        // update the qualificationVersion. 
        // NOTE: for concurrent action, the above file save will be failed because of duplicated id
        UserModelWrapper.$$updateOne(
            { uid: currentUser.uid } as UserObject,
            {
                qualificationId: fileEntryId,
                qualificationVersion: version,
                qualificationState: QualificationState.ToBeChecked,
            } as UserObject);
    }

    public static async $$createUser(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam): Promise<UserView> {
        if (reqParam == null || reqParam.metadata == null) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'FileUploadParam or FileUploadParam.metadata should not be null in $$createUser');
        }

        const metadata: UserCreateParam = JSON.parse(reqParam.metadata as string);
        if (metadata == null || CommonUtils.isNullOrEmpty(metadata.name)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'FileUploadParam.metadata should not be null in $$createUser');
        }
        const userName: string = metadata.name as string;
        const logoSize: number = (fileData as Express.Multer.File).size;

        if (fileData.size / 1024 / 1024 > LIMIT_LOGO_SIZE_M) {
            LoggerManager.error(`LogoSize:${logoSize} too large for user:${userName}`);
            throw new ApiError(ApiResultCode.InputLogoTooLarge);
        }

        // create user db object
        const view: UserView = await this.$$createUserObject(metadata, fileData);
        if (CommonUtils.isAdmin(view.roles)) {
            AppStatus.isSystemInitialized = true;
        }
        return view;
    }
    public static async $$updateUserLogo(
        fileData: Express.Multer.File | NodeJS.ReadableStream,
        reqParam: FileUploadParam,
        currentDBUser: UserObject): Promise<void> {
        const logoSize: number = (fileData as Express.Multer.File).size;
        if ((fileData as Express.Multer.File).size / 1024 / 1024 > LIMIT_LOGO_SIZE_M) {
            LoggerManager.error(`LogoSize:${logoSize} too large for user:${currentDBUser.name}`);
            throw new ApiError(ApiResultCode.InputLogoTooLarge);
        }
        // we don't keep logo upload history, so here remove the old one and then add new one
        await FileStorage.$$deleteEntry(currentDBUser.logoId as string, 0);
        await FileStorage.$$saveEntry(
            currentDBUser.logoId as string,
            0, // version
            { type: FileType.UserLogo, checked: false } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);
    }

    public static async $$updateTaskResultFile(
        fileData: Express.Multer.File | NodeJS.ReadableStream,
        reqParam: FileUploadParam,
        currentDBUser: UserObject): Promise<TaskView> {
        // only task executor can update Result file
        if (!CommonUtils.isExecutor(currentDBUser.roles)) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }

        const metadata: TaskResultFileUploadParam = JSON.parse(reqParam.metadata as string);
        if (CommonUtils.isNullOrEmpty(metadata.uid)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'TaskResultFileUploadParam.uid should not be null');
        }
        const dbObj: TaskObject | null = await TaskModelWrapper.$$findOne(
            { uid: metadata.uid } as TaskObject) as TaskObject | null;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DbNotFound, `TaskId:${metadata.uid}`);
        }
        if (dbObj.executorId !== currentDBUser.uid) {
            throw new ApiError(ApiResultCode.AuthForbidden);
        }

        if (CommonUtils.isNullOrEmpty(dbObj.resultFileId)) {
            dbObj.resultFileId = CommonUtils.getUUIDForMongoDB();
            dbObj.resultFileversion = 0;
        } else {
            dbObj.resultFileversion = dbObj.resultFileversion as number + 1;
        }


        await FileStorage.$$saveEntry(
            dbObj.resultFileId as string,
            dbObj.resultFileversion,
            { type: FileType.Template, checked: true } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        // update version
        await TaskModelWrapper.$$updateOne(
            { uid: dbObj.uid } as TaskObject,
            { resultFileId: dbObj.resultFileId, resultFileversion: dbObj.resultFileversion } as TaskObject);
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
                    currentUser.qualificationId !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            case FileAPIScenario.DownloadTemplateFile:
                // everyone can download template file
                break;
            case FileAPIScenario.DownloadUserLogo:
                // only admin or owner can download logo
                if (!CommonUtils.isAdmin(currentUser.roles) &&
                    currentUser.logoId !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.AuthForbidden);
                }
                break;
            default:
                throw new ApiError(ApiResultCode.InputInvalidScenario);
        }
        reqParam.version = Number.parseInt(reqParam.version as any, 10);
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
                'UserCreateParam.name should not be null');
        }
        dbObj.name = reqParam.name;

        if (CommonUtils.isNullOrEmpty(reqParam.email)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.email should not be null');
        }
        dbObj.email = reqParam.email;

        if (CommonUtils.isNullOrEmpty(reqParam.password)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.password should not be null');
        }
        dbObj.password = reqParam.password;

        if (CommonUtils.isNullOrEmpty(reqParam.telephone)) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.telephone should not be null');
        }
        dbObj.telephone = reqParam.telephone;

        if (reqParam.roles == null || reqParam.roles.length === 0) {
            throw new ApiError(ApiResultCode.InputInvalidParam,
                'UserCreateParam.roles should not be null');
        }
        dbObj.roles = reqParam.roles;

        if (CommonUtils.isAdmin(dbObj.roles)) {
            dbObj.uid = UserModelWrapper.adminUID;
        } else {
            dbObj.uid = CommonUtils.getUUIDForMongoDB();
        }
        dbObj.logoId = CommonUtils.getUUIDForMongoDB();
        dbObj.logoState = LogoState.ToBeChecked;
        dbObj.qualificationState = QualificationState.Missed;

        // save logo file
        await FileStorage.$$saveEntry(
            dbObj.logoId,
            0, // version
            { type: FileType.UserLogo, checked: false, userUid: dbObj.uid } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        // if admin has been existing, the following sentence will throw dup error
        dbObj = await UserModelWrapper.$$create(dbObj) as UserObject;

        return await UserRequestHandler.$$convertToDBView(dbObj);
    }

    public static async $$createTemplateObject(
        reqParam: TemplateCreateParam, currentUser: UserObject, fileData: Express.Multer.File): Promise<TemplateView> {
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
        await FileStorage.$$saveEntry(
            dbObj.templateFileUid as string,
            0, // for first file
            { type: FileType.Template, checked: true } as IFileMetaData,
            fileData.buffer);
        dbObj = await TemplateModelWrapper.$$create(dbObj) as TemplateObject;
        return await TemplateRequestHandler.$$convertToDBView(dbObj);

    }
    // #region
}
