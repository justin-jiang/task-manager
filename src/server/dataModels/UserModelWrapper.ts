import { UserRole } from 'common/UserRole';
import { Model } from 'mongoose';
import { UserObject } from 'server/dataObjects/UserObject';
import { AppStatus } from '../common/AppStatus';
import { MongoDBModelManager } from '../dbDrivers/mongoDB/MongoDBModelManager';
import { BaseModelWrapper } from './BaseModelWrapper';
import { IUserModel, keysOfSchema } from './mongoDB/IUserModel';


export class UserModelWrapper extends BaseModelWrapper {
    public static async $$warmUp(): Promise<void> {
        AppStatus.isSystemInitialized = false;
        const userModel: Model<IUserModel> = await MongoDBModelManager.$$getUserModel();
        await userModel.createIndexes();
        const admin: IUserModel[] = await userModel.find({ roles: UserRole.Admin });

        if (admin != null && admin.length > 0) {
            if (admin.length === 1) {
                AppStatus.isSystemInitialized = true;
            } else {
                throw new Error(`multiple system admins(${admin.length}) are not allowed`);
            }
        }
    }


    protected static async getDBModel(): Promise<Model<IUserModel>> {
        return await MongoDBModelManager.$$getUserModel();
    }

    protected static convertModelToDBObject(modelData: IUserModel): UserObject {
        const userObj: UserObject = new UserObject();
        keysOfSchema.forEach((item: string) => {
            if (modelData[item] != null) {
                userObj[item] = modelData[item];
            }
        });
        return userObj;
    }
}
