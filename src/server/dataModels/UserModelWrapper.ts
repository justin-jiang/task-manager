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
        const model: Model<IUserModel> = await MongoDBModelManager.$$getUserModel();
        await model.createIndexes();
        await model.collection.createIndex({ name: 1 },
            { unique: true, collation: this.caseInsensitiveCollation, name: 'name_1_collation' } as any);
        await model.collection.createIndex({ email: 1 },
            { unique: true, collation: this.caseInsensitiveCollation, name: 'email_1_collation' } as any);
        const admin: IUserModel[] = await model.find({ roles: UserRole.Admin });
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
