import { CommonUtils } from 'common/CommonUtils';
import { Model } from 'mongoose';
import { GlobalCache } from 'server/common/GlobalCache';
import { BaseModelWrapper } from 'server/dataModels/BaseModelWrapper';
import { TaskCheckRecordObject } from 'server/dataObjects/TaskCheckRecordObject';
import { MongoDBModelManager } from 'server/dbDrivers/mongoDB/MongoDBModelManager';
import { ITaskCheckRecordModel, keysOfSchema } from './mongoDB/ITaskCheckRecordModel';

export class TaskCheckRecordModelWrapper extends BaseModelWrapper {

    public static async $$warmUp(): Promise<void> {
        const model: Model<ITaskCheckRecordModel> = await MongoDBModelManager.$$getTaskCheckRecordModel();
        // create default indexes
        await model.createIndexes();
    }

    protected static async getDBModel(): Promise<Model<ITaskCheckRecordModel>> {
        return await MongoDBModelManager.$$getTaskCheckRecordModel();
    }

    protected static convertModelToDBObject(modelData: ITaskCheckRecordModel): TaskCheckRecordObject {
        const dbObj: TaskCheckRecordObject = new TaskCheckRecordObject();
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
