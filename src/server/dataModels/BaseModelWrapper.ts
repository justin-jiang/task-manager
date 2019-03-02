import { CommonObject } from 'common/commonDataObjects/CommonObject';
import { IQueryConditions } from 'common/IQueryConditions';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Model, ModelFindOneAndUpdateOptions } from 'mongoose';
import { ApiError } from 'server/common/ApiError';
import { GlobalCache } from 'server/common/GlobalCache';
import { IModel } from 'server/dataModels/mongoDB/IModel';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';

export class BaseModelWrapper {
    protected static caseInsensitiveCollation = { locale: 'en', strength: 2 };
    public static async $$create(dbObject: CommonObject): Promise<CommonObject> {
        const dbModel: Model<IModel> = await this.getDBModel();
        const modelData: IModel = await dbModel.create(dbObject);
        return this.convertModelToDBObject(modelData);
    }
    public static async $$find(conditions: IQueryConditions, selectFields?: string): Promise<CommonObject[]> {
        const dbModel: Model<IModel> = await this.getDBModel();
        let queryCmd = dbModel.find(conditions).sort({ createTime: -1 });
        if (selectFields != null) {
            queryCmd = queryCmd.select(selectFields);
        }
        const modelData: IModel[] = await queryCmd;
        const dbObjs: CommonObject[] = [];
        modelData.forEach((dbObj: IModel) => {
            dbObjs.push(this.convertModelToDBObject(dbObj));
        });
        return dbObjs;
    }
    public static async $$findOne(conditions: IQueryConditions): Promise<CommonObject | null> {
        const dbModel: Model<IModel> = await this.getDBModel();
        const modelData: IModel | null = await dbModel.findOne(conditions);
        if (modelData == null) {
            return null;
        }
        return this.convertModelToDBObject(modelData);
    }
    public static async $$getOneFromCache(uid: string): Promise<CommonObject | null> {
        let dbObj: CommonObject | null = GlobalCache.get(uid);
        if (dbObj == null) {
            dbObj = await this.$$findOne({ uid } as CommonObject);
        }
        return dbObj;
    }
    public static async $$updateOne(conditions: IQueryConditions, dbObj: CommonObject): Promise<void> {
        const dbModel: Model<IModel> = await this.getDBModel();
        const result = await dbModel.updateOne(conditions, dbObj);
        LoggerManager.debug('$$updateOne result:', result);
    }
    public static async $$findOneAndUpdate(
        conditions: IQueryConditions, dbObj: CommonObject): Promise<CommonObject | null> {
        const dbModel: Model<IModel> = await this.getDBModel();
        const result = await dbModel.findOneAndUpdate(
            conditions,
            dbObj,
            { new: true } as ModelFindOneAndUpdateOptions);
        LoggerManager.debug('$$updateOne result:', result);
        if (result == null) {
            return null;
        }
        return this.convertModelToDBObject(result as IModel);
    }

    public static async $$findeOneAndDelete(conditions: IQueryConditions): Promise<CommonObject | null> {
        const dbModel: Model<IModel> = await this.getDBModel();
        const result = await dbModel.findOneAndDelete(conditions);
        LoggerManager.debug('$$deleteOne result:', result);
        if (result == null) {
            return null;
        } else {
            return this.convertModelToDBObject(result);
        }
    }

    public static async $$deleteOne(conditions: IQueryConditions): Promise<void> {
        const dbModel: Model<IModel> = await this.getDBModel();
        const result = await dbModel.deleteOne(conditions);
        LoggerManager.debug('$$deleteOne result:', result);
    }

    public static async $$deleteMany(conditions: IQueryConditions): Promise<void> {
        const dbModel: Model<IModel> = await this.getDBModel();
        const result = await dbModel.deleteMany(conditions);
        LoggerManager.debug('$$deleteMany result:', result);
    }

    protected static async getDBModel(): Promise<Model<IModel>> {
        throw new ApiError(ApiResultCode.MethodNotImplemented);
    }

    protected static convertModelToDBObject(modelData: IModel): CommonObject {
        throw new ApiError(ApiResultCode.MethodNotImplemented);
    }
}
