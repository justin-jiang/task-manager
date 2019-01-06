import { CommonUtils } from 'common/CommonUtils';
import { Model } from 'mongoose';
import { GlobalCache } from 'server/common/GlobalCache';
import { BaseModelWrapper } from 'server/dataModels/BaseModelWrapper';
import { ITaskModel, keysOfSchema } from 'server/dataModels/mongoDB/ITaskModel';
import { TaskObject } from 'server/dataObjects/TaskObject';
import { MongoDBModelManager } from 'server/dbDrivers/mongoDB/MongoDBModelManager';

export class TaskModelWrapper extends BaseModelWrapper {

    public static async $$warmUp(): Promise<void> {
        const model: Model<ITaskModel> = await MongoDBModelManager.$$getTaskModel();
        // create default indexes
        await model.createIndexes();
        // create case-insensitive name index
        await model.collection.createIndex({ name: 1 },
            { unique: true, collation: this.caseInsensitiveCollation, name: 'name_1_collation' } as any);
    }
    protected static async getDBModel(): Promise<Model<ITaskModel>> {
        return await MongoDBModelManager.$$getTaskModel();
    }

    protected static convertModelToDBObject(modelData: ITaskModel): TaskObject {
        const dbObj: TaskObject = new TaskObject();
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
