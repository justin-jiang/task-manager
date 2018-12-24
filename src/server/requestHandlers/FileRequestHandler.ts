import { CommonUtils } from 'common/CommonUtils';
import { LIMIT_LOGO_SIZE_M } from 'common/Config';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileCreateParam } from 'common/requestParams/FileCreateParam';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { FileRemoveParam } from 'common/requestParams/FileRemoveParam';
import { TemplateCreateParam } from 'common/requestParams/TemplateCreateParam';
import { TemplateFileEditParam } from 'common/requestParams/TemplateFileEditParam';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TemplateView } from 'common/responseResults/TemplateView';
import { UserView } from 'common/responseResults/UserView';
import { UserRole } from 'common/UserRole';
import { Response } from 'express';
import { ApiError } from 'server/common/ApiError';
import { AppStatus } from 'server/common/AppStatus';
import { UserModelWrapper } from 'server/dataModels/UserModelWrapper';
import { UserObject } from 'server/dataObjects/UserObject';
import { FileStorage } from 'server/dbDrivers/mongoDB/FileStorage';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { TemplateRequestHandler } from 'server/requestHandlers/TemplateRequestHandler';
import { UserRequestHandler } from 'server/requestHandlers/UserRequestHandler';
import { UserState } from 'common/UserState';

export class FileRequestHandler {
    public static async $$createTemplate(
        fileData: Express.Multer.File | NodeJS.ReadableStream,
        reqParam: FileCreateParam): Promise<void> {
        let fileEntryId: string;
        let version: number = 0;
        if (reqParam.scenario === FileAPIScenario.CreateTemplate) {
            const metaData: TemplateCreateParam = JSON.parse(reqParam.metaData as string);
            const templateView: TemplateView = await TemplateRequestHandler.$$create(metaData);
            fileEntryId = templateView.templateFileId;
        } else {
            const metaData: TemplateFileEditParam = JSON.parse(reqParam.metaData as string);
            fileEntryId = metaData.uid;
            version = metaData.version + 1;
        }
        await FileStorage.$$saveEntry(fileEntryId, version, null, (fileData as Express.Multer.File).buffer);
    }
    public static async $$createOrEditQualification(
        fileData: Express.Multer.File | NodeJS.ReadableStream,
        reqParam: FileCreateParam,
        currentDBUser: UserObject): Promise<void> {
        let fileEntryId: string;
        let version: number = 0;
        if (CommonUtils.isNullOrEmpty(currentDBUser.qualificationId)) {
            fileEntryId = CommonUtils.getUUIDForMongoDB();
        } else {
            fileEntryId = currentDBUser.qualificationId;
            version = currentDBUser.qualificationVersion + 1;
        }

        await FileStorage.$$saveEntry(fileEntryId, version, null, (fileData as Express.Multer.File).buffer);
        // update the qualificationVersion. 
        // NOTE: for concurrent action, the above file save will be failed because of duplicated id
        UserModelWrapper.$$updateOne(
            { uid: currentDBUser.uid, qualificationId: fileEntryId, qualificationVersion: version } as UserObject);
    }

    public static async $$createUser(
        fileData: Express.Multer.File | NodeJS.ReadableStream,
        reqParam: FileCreateParam): Promise<UserView> {
        const logoSize: number = (fileData as Express.Multer.File).size;
        const metaData: UserCreateParam = JSON.parse(reqParam.metaData as string);
        const userName: string = metaData.name;

        if ((fileData as Express.Multer.File).size / 1024 / 1024 > LIMIT_LOGO_SIZE_M) {
            LoggerManager.error(`LogoSize:${logoSize} too large for user:${userName}`);
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_LOGO_TOO_LARGE);
        }

        const view: UserView = await UserRequestHandler.$$create(metaData);
        const fileEntryId: string = view.logoId;
        if (view.roles.includes(UserRole.Admin)) {
            AppStatus.isSystemInitialized = true;
        }
        await FileStorage.$$saveEntry(fileEntryId, 0, null, (fileData as Express.Multer.File).buffer);
        await UserModelWrapper.$$updateOne({ uid: view.uid, state: UserState.toBeChecked } as UserObject);
        return view;
    }
    public static async $$updateUserLogo(
        fileData: Express.Multer.File | NodeJS.ReadableStream,
        reqParam: FileCreateParam,
        currentDBUser: UserObject): Promise<void> {
        const logoSize: number = (fileData as Express.Multer.File).size;
        if ((fileData as Express.Multer.File).size / 1024 / 1024 > LIMIT_LOGO_SIZE_M) {
            LoggerManager.error(`LogoSize:${logoSize} too large for user:${currentDBUser.name}`);
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_LOGO_TOO_LARGE);
        }
        await FileStorage.$$deleteEntry(currentDBUser.logoId, 0);
        await FileStorage.$$saveEntry(currentDBUser.logoId, 0, null, (fileData as Express.Multer.File).buffer);
    }

    public static async $$getOne(reqParam: FileDownloadParam, res: Response) {
        const readStream = FileStorage.createReadStream(reqParam.fileId, reqParam.version);
        await FileStorage.$$pipeStreamPromise(readStream, res);
    }

    public static async $$deleteOne(reqParam: FileRemoveParam) {
        await FileStorage.$$deleteEntry(reqParam.fileId, reqParam.version);
    }
}
