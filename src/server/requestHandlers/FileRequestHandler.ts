import { CommonUtils } from 'common/CommonUtils';
import { LIMIT_LOGO_SIZE_M } from 'common/Config';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileRemoveParam } from 'common/requestParams/FileRemoveParam';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskResultFileUploadParam } from 'common/requestParams/TaskResultFileUploadParam';
import { TemplateCreateParam } from 'common/requestParams/TemplateCreateParam';
import { TemplateFileEditParam } from 'common/requestParams/TemplateFileEditParam';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { TemplateView } from 'common/responseResults/TemplateView';
import { UserView } from 'common/responseResults/UserView';
import { UserState } from 'common/UserState';
import { Response } from 'express';
import { ApiError } from 'server/common/ApiError';
import { AppStatus } from 'server/common/AppStatus';
import { FileType } from 'server/common/FileType';
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
        currentDBUser: UserObject): Promise<TemplateView> {
        // only admin user can create Template
        if (!CommonUtils.isAdmin(currentDBUser.roles)) {
            throw new ApiError(ApiResultCode.Auth_Forbidden);
        }

        const metadata: TemplateCreateParam = JSON.parse(reqParam.metadata as string);
        const templateView: TemplateView = await TemplateRequestHandler.$$create(metadata);

        await FileStorage.$$saveEntry(
            templateView.templateFileId as string,
            0, // for first file
            { type: FileType.Template, checked: true } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);
        return templateView;
    }

    public static async $$updateTemplateFile(
        fileData: Express.Multer.File | NodeJS.ReadableStream,
        reqParam: FileUploadParam,
        currentDBUser: UserObject): Promise<TemplateView> {
        // only admin user can update Template file
        if (!CommonUtils.isAdmin(currentDBUser.roles)) {
            throw new ApiError(ApiResultCode.Auth_Forbidden);
        }
        let fileEntryId: string;
        let version: number = 0;
        const metadata: TemplateFileEditParam = JSON.parse(reqParam.metadata as string);
        if (CommonUtils.isNullOrEmpty(metadata.templateId)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'TemplateFileEditParam.templateId should not be null');
        }
        const dbObj: TemplateObject | null = await TemplateModelWrapper.$$findOne(
            { uid: metadata.templateId } as TemplateObject) as TemplateObject | null;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DB_NOT_FOUND, `TemplateId:${metadata.templateId}`);
        }
        fileEntryId = dbObj.templateId as string;
        version = dbObj.version as number + 1;
        await FileStorage.$$saveEntry(
            fileEntryId,
            version,
            { type: FileType.Template, checked: true } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        // update version
        await TemplateModelWrapper.$$updateOne(
            { uid: dbObj.uid } as TemplateObject,
            { version: dbObj.version } as TemplateObject);
        return TemplateRequestHandler.convertToDBView(dbObj);
    }
    public static async $$updateQualification(
        fileData: Express.Multer.File | NodeJS.ReadableStream,
        reqParam: FileUploadParam,
        currentDBUser: UserObject): Promise<void> {
        let fileEntryId: string;
        let version: number = 0;
        if (CommonUtils.isNullOrEmpty(currentDBUser.qualificationId)) {
            fileEntryId = CommonUtils.getUUIDForMongoDB();
        } else {
            fileEntryId = currentDBUser.qualificationId as string;
            version = currentDBUser.qualificationVersion as number + 1;
        }

        await FileStorage.$$saveEntry(
            fileEntryId,
            version,
            { type: FileType.Qualification, checked: false } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);
        // update the qualificationVersion. 
        // NOTE: for concurrent action, the above file save will be failed because of duplicated id
        UserModelWrapper.$$updateOne(
            { uid: currentDBUser.uid } as UserObject,
            {
                qualificationId: fileEntryId,
                qualificationVersion: version,
                state: UserState.toBeChecked,
            } as UserObject);
    }

    public static async $$createUser(
        fileData: Express.Multer.File,
        reqParam: FileUploadParam): Promise<UserView> {
        if (reqParam == null || reqParam.metadata == null) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'FileUploadParam or FileUploadParam.metadata should not be null in $$createUser');
        }

        const metadata: UserCreateParam = JSON.parse(reqParam.metadata as string);
        if (metadata == null || CommonUtils.isNullOrEmpty(metadata.name)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'FileUploadParam.metadata should not be null in $$createUser');
        }
        const userName: string = metadata.name as string;
        const logoSize: number = (fileData as Express.Multer.File).size;

        if (fileData.size / 1024 / 1024 > LIMIT_LOGO_SIZE_M) {
            LoggerManager.error(`LogoSize:${logoSize} too large for user:${userName}`);
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_LOGO_TOO_LARGE);
        }

        // create user db object
        const view: UserView = await UserRequestHandler.$$create(metadata);
        const fileEntryId: string = view.logoId as string;
        if (CommonUtils.isAdmin(view.roles)) {
            AppStatus.isSystemInitialized = true;
        }
        // save logo file
        await FileStorage.$$saveEntry(
            fileEntryId,
            0, // version
            { type: FileType.UserLogo, checked: false } as IFileMetaData,
            (fileData as Express.Multer.File).buffer);

        // update the logoId and state on user object
        await UserModelWrapper.$$updateOne(
            { uid: view.uid } as UserObject,
            { state: UserState.toBeChecked } as UserObject);
        return view;
    }
    public static async $$updateUserLogo(
        fileData: Express.Multer.File | NodeJS.ReadableStream,
        reqParam: FileUploadParam,
        currentDBUser: UserObject): Promise<void> {
        const logoSize: number = (fileData as Express.Multer.File).size;
        if ((fileData as Express.Multer.File).size / 1024 / 1024 > LIMIT_LOGO_SIZE_M) {
            LoggerManager.error(`LogoSize:${logoSize} too large for user:${currentDBUser.name}`);
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_LOGO_TOO_LARGE);
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
            throw new ApiError(ApiResultCode.Auth_Forbidden);
        }

        const metadata: TaskResultFileUploadParam = JSON.parse(reqParam.metadata as string);
        if (CommonUtils.isNullOrEmpty(metadata.uid)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'TaskResultFileUploadParam.uid should not be null');
        }
        const dbObj: TaskObject | null = await TaskModelWrapper.$$findOne(
            { uid: metadata.uid } as TaskObject) as TaskObject | null;
        if (dbObj == null) {
            throw new ApiError(ApiResultCode.DB_NOT_FOUND, `TaskId:${metadata.uid}`);
        }
        if (dbObj.executorId !== currentDBUser.uid) {
            throw new ApiError(ApiResultCode.Auth_Forbidden);
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
        return TaskRequestHandler.convertToDBView(dbObj);
    }

    public static async $$download(reqParam: FileDownloadParam, currentUser: UserObject, res: Response): Promise<void> {
        if (reqParam == null) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'FileDownloadParam should not be null');
        }
        if (CommonUtils.isNullOrEmpty(reqParam.fileId)) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'FileDownloadParam.fileId should not be null');
        }
        if (reqParam.scenario == null) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
                'FileDownloadParam.scenario should not be null');
        }

        if (reqParam.version == null) {
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM,
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
                    throw new ApiError(ApiResultCode.Auth_Forbidden);
                }
                break;
            case FileAPIScenario.DownloadTemplateFile:
                // everyone can download template file
                break;
            case FileAPIScenario.DownloadUserLogo:
                // only owner can download logo
                if (currentUser.logoId !== reqParam.fileId) {
                    throw new ApiError(ApiResultCode.Auth_Forbidden);
                }
                break;
            default:
                throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_SCENARIO);
        }
        reqParam.version = Number.parseInt(reqParam.version as any, 10);
        const readStream = FileStorage.createReadStream(reqParam.fileId as string, reqParam.version);
        await FileStorage.$$pipeStreamPromise(readStream, res);
    }

    public static async $$deleteOne(reqParam: FileRemoveParam) {
        await FileStorage.$$deleteEntry(reqParam.fileId as string, reqParam.version);
    }
}
