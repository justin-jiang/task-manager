import { CommonUtils } from 'common/CommonUtils';
import { UserRole } from 'common/UserRole';
import { Model } from 'mongoose';
import { GlobalCache } from 'server/common/GlobalCache';
import { UserObject } from 'server/dataObjects/UserObject';
import { AppStatus } from '../common/AppStatus';
import { MongoDBModelManager } from '../dbDrivers/mongoDB/MongoDBModelManager';
import { BaseModelWrapper } from './BaseModelWrapper';
import { IUserModel, keysOfSchema } from './mongoDB/IUserModel';


export class UserModelWrapper extends BaseModelWrapper {
    // system can only has one admin with the following UID
    public static readonly adminUID: string = '68727e717a3c40b351b567ba0ae2c48f';
    public static async $$warmUp(): Promise<void> {
        AppStatus.isSystemInitialized = false;
        const model: Model<IUserModel> = await MongoDBModelManager.$$getUserModel();
        await model.createIndexes();
        await model.collection.createIndex({ name: 1 },
            { unique: true, collation: this.caseInsensitiveCollation, name: 'name_1_collation' } as any);
        await model.collection.createIndex({ email: 1 },
            { unique: true, collation: this.caseInsensitiveCollation, name: 'email_1_collation' } as any);
        await this.$$adminCheck();
    }

    public static async $$adminCheck(): Promise<void> {
        const model: Model<IUserModel> = await MongoDBModelManager.$$getUserModel();
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
        const dbObj: UserObject = new UserObject();
        keysOfSchema.forEach((item: string) => {
            if (modelData[item] != null) {
                dbObj[item] = modelData[item];
            }
        });
        if (!CommonUtils.isNullOrEmpty(dbObj.uid)) {
            GlobalCache.set(dbObj.uid as string, dbObj, 60);
        }
        return dbObj;
    }
}
