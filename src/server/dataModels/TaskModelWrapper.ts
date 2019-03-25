import { CommonUtils } from 'common/CommonUtils';
import { Model } from 'mongoose';
import { GlobalCache } from 'server/common/GlobalCache';
import { BaseModelWrapper } from 'server/dataModels/BaseModelWrapper';
import { ITaskModel, keysOfSchema } from 'server/dataModels/mongoDB/ITaskModel';
import { TaskObject } from 'server/dataObjects/TaskObject';
import { MongoDBModelManager } from 'server/dbDrivers/mongoDB/MongoDBModelManager';
import { TaskState } from 'common/TaskState';
import { TaskHistoryItem } from 'common/TaskHistoryItem';
import { ArgsParser } from 'server/common/ArgsParser';
import { TaskApplicationModelWrapper } from './TaskApplicationModelWrapper';
import { TaskApplicationObject } from 'server/dataObjects/TaskApplicationObject';

export class TaskModelWrapper extends BaseModelWrapper {

    public static async $$warmUp(): Promise<void> {
        const model: Model<ITaskModel> = await MongoDBModelManager.$$getTaskModel();
        // create default indexes
        await model.createIndexes();
        // create case-insensitive name index
        await model.collection.createIndex({ name: 1 },
            { unique: true, collation: this.caseInsensitiveCollation, name: 'name_1_collation' } as any);
    }

    public static async $$releaseTasksWithoutMargin(): Promise<void> {
        const deadline: number = Date.now() - ArgsParser.getApplyingDeadline();
        // remove expired items from taskApplication collection
        await TaskApplicationModelWrapper.$$deleteMany(
            { createTime: { $lte: deadline } as any } as TaskApplicationObject);

        // update the expired items to be ReadyToApplyState
        await this.$$updateMany({
            state: TaskState.Applying,
            applyingDatetime: { $lte: deadline } as any,
        } as TaskObject, { applicantUid: '', state: TaskState.ReadyToApply } as TaskObject);
    }
    public static async $$addHistoryItem(
        uid: string, state: TaskState, title: string, description?: string): Promise<void> {
        await TaskModelWrapper.$$updateOne({ uid } as TaskObject, {
            $push: {
                histories: {
                    createTime: Date.now(),
                    description: description || '',
                    state,
                    title,
                    uid: CommonUtils.getUUIDForMongoDB(),
                } as TaskHistoryItem,
            },
        });
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
