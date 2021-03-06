import { CommonUtils } from 'common/CommonUtils';
import { Model } from 'mongoose';
import { GlobalCache } from 'server/common/GlobalCache';
import { BaseModelWrapper } from 'server/dataModels/BaseModelWrapper';
import { ITaskApplicationModel, keysOfSchema } from 'server/dataModels/mongoDB/ITaskApplicationModel';
import { TaskApplicationObject } from 'server/dataObjects/TaskApplicationObject';
import { MongoDBModelManager } from 'server/dbDrivers/mongoDB/MongoDBModelManager';

export class TaskApplicationModelWrapper extends BaseModelWrapper {

    public static async $$warmUp(): Promise<void> {
        const model: Model<ITaskApplicationModel> = await MongoDBModelManager.$$getTaskApplicationModel();
        // create default indexes
        await model.createIndexes();
    }

    public static async $$deleteByTaskId(taskUid: string): Promise<void> {
        const model: Model<ITaskApplicationModel> = await MongoDBModelManager.$$getTaskApplicationModel();
        await model.deleteOne({ taskUid } as TaskApplicationObject);
    }
    protected static async getDBModel(): Promise<Model<ITaskApplicationModel>> {
        return await MongoDBModelManager.$$getTaskApplicationModel();
    }

    protected static convertModelToDBObject(modelData: ITaskApplicationModel): TaskApplicationObject {
        const dbObj: TaskApplicationObject = new TaskApplicationObject();
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
