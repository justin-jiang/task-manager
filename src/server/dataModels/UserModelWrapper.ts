import { UserRole } from 'common/CommonTypes';
import { IQueryConditions } from 'common/requestParams/IQueryConditions';
import { getBlankIUserModel, IUserObject, keysOfIUserObject } from 'server/dataObjects/IUserObject';
import { Model } from 'mongoose';
import { AppStatus } from '../common/AppStatus';
import { MongoDBModelManager } from '../dbDrivers/mongoDB/MongoDBModelManager';
import { LoggersManager } from '../libsWrapper/LoggersManager';
import { BaseModelWrapper } from './BaseModelWrapper';
import { IUserModel, keysOfSchema } from './mongoDB/IUserModel';


export class UserModelWrapper extends BaseModelWrapper implements IUserObject {
    [key: string]: any;
    public static async $$getAll(): Promise<IUserModel[]> {
        LoggersManager.debug('$$getAll');
        const userModel: Model<IUserModel> = await MongoDBModelManager.$$getUserModel();
        return await userModel.find();
    }
    public static async $$warmUp(): Promise<void> {
        const userModel: Model<IUserModel> = await MongoDBModelManager.$$getUserModel();
        await userModel.createIndexes();
        const admin: IUserModel[] = await userModel.find({ roles: UserRole.Admin });

        if (admin == null || admin.length === 0) {
            AppStatus.isAppInitialized = false;
        } else if (admin.length === 1) {
            AppStatus.isAppInitialized = true;
        } else {
            throw new Error(`multiple system admins(${admin.length}) are not allowed`);
        }
    }

    // #region implement of IUserObject
    public name: string;
    public email: string;
    public password: string;
    public logoId: string;
    public type: number;
    public telephone: string;
    public lastLogonTime: number;
    public roles: UserRole[];
    public async $$save(): Promise<void> {
        const userModel: Model<IUserModel> = await MongoDBModelManager.$$getUserModel();
        const user: IUserModel = new userModel();
        this.assembleModel(user, keysOfSchema);
        await user.save();
    }

    public async $$find(conditions: IQueryConditions): Promise<IUserObject[]> {
        const userModel: Model<IUserModel> = await MongoDBModelManager.$$getUserModel();
        const dbUsers: IUserModel[] = await userModel.find(conditions);
        const userObjs: IUserObject[] = [];
        dbUsers.forEach((dbUser: IUserModel) => {
            userObjs.push(this.convertToIUserObject(dbUser));
        });
        return userObjs;
    }
    // #endregion
    constructor() {
        super();
        this.email = '';
        this.lastLogonTime = 0;
        this.logoId = '';
        this.name = '';
        this.password = '';
        this.roles = [];
        this.telephone = '';
        this.type = 0;
    }

    private convertToIUserObject(dbUsers: IUserModel): IUserObject {
        const userObj: IUserObject = getBlankIUserModel();
        keysOfIUserObject.forEach((key: string) => {
            if (key in dbUsers) {
                userObj[key] = dbUsers[key];
            } else {
                LoggersManager.warn('missed key in IUserModel', key);
            }
        });
        return userObj;
    }
}
