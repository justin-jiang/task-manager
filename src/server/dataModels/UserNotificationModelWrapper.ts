import { CommonUtils } from 'common/CommonUtils';
import { Model } from 'mongoose';
import { GlobalCache } from 'server/common/GlobalCache';
import { BaseModelWrapper } from 'server/dataModels/BaseModelWrapper';
import { IUserNotificationModel, keysOfSchema } from 'server/dataModels/mongoDB/IUserNotificationModel';
import { UserNotificationObject } from 'server/dataObjects/UserNotificationObject';
import { MongoDBModelManager } from 'server/dbDrivers/mongoDB/MongoDBModelManager';

export class UserNotificationModelWrapper extends BaseModelWrapper {

    public static async $$warmUp(): Promise<void> {
        const model: Model<IUserNotificationModel> = await MongoDBModelManager.$$getUserNotificationModel();
        // create default indexes
        await model.createIndexes();
    }

    protected static async getDBModel(): Promise<Model<IUserNotificationModel>> {
        return await MongoDBModelManager.$$getUserNotificationModel();
    }

    protected static convertModelToDBObject(modelData: IUserNotificationModel): UserNotificationObject {
        const dbObj: UserNotificationObject = new UserNotificationObject();
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
