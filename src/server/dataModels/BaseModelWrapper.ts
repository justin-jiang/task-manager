import { IQueryConditions } from 'common/IQueryConditions';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Model } from 'mongoose';
import { ApiError } from 'server/common/ApiError';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { DBObject } from '../dataObjects/DBObject';
import { IModel } from './mongoDB/IModel';
import { CommonUtils } from 'common/CommonUtils';

export class BaseModelWrapper {
    public static async $$create(dbObject: DBObject): Promise<DBObject> {
        const dbModel: Model<IModel> = await this.getDBModel();
        const modelData: IModel = await dbModel.create(dbObject);
        return this.convertModelToDBObject(modelData);
    }
    public static async $$find(conditions: IQueryConditions): Promise<DBObject[]> {
        const dbModel: Model<IModel> = await this.getDBModel();
        const modelData: IModel[] = await dbModel.find(conditions);
        const dbObjs: DBObject[] = [];
        modelData.forEach((dbObj: IModel) => {
            dbObjs.push(this.convertModelToDBObject(dbObj));
        });
        return dbObjs;
    }
    // public static async $$update(conditions: IQueryConditions, dbObject: DBObject): Promise<DBObject[]> {
    //     const userModel: Model<IModel> = await this.getDBModel();
    //     const modelData: IModel[] = await userModel.find(conditions);
    //     userModel.update();
    //     const dbObjs: DBObject[] = [];
    //     modelData.forEach((dbUser: IModel) => {
    //         dbObjs.push(this.convertModelToDBObject(dbUser));
    //     });
    //     return dbObjs;
    // }
    public static async $$updateOne(dbObject: DBObject): Promise<void> {
        if (CommonUtils.isNullOrEmpty(dbObject.uid)) {
            LoggerManager.error('uid should not be null on $$updateOne', dbObject);
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM, 'uid should not be null on $$updateOne');
        }
        const dbModel: Model<IModel> = await this.getDBModel();
        const result = await dbModel.updateOne({ uid: dbObject.uid } as DBObject, dbObject);
        LoggerManager.debug('$$updateOne result:', result);
    }

    public static async $$deleteOne(uid: string): Promise<void> {
        if (CommonUtils.isNullOrEmpty(uid)) {
            LoggerManager.error('uid should not be null on $$deleteOne');
            throw new ApiError(ApiResultCode.INPUT_VALIDATE_INVALID_PARAM, 'uid should not be null on $$deleteOne');
        }
        const dbModel: Model<IModel> = await this.getDBModel();
        const result = await dbModel.deleteOne({ uid } as DBObject);
        LoggerManager.debug('$$deleteOne result:', result);
    }

    protected static async getDBModel(): Promise<Model<IModel>> {
        throw new ApiError(ApiResultCode.MethodNotImplemented);
    }

    protected static convertModelToDBObject(modelData: IModel): DBObject {
        throw new ApiError(ApiResultCode.MethodNotImplemented);
    }
}
