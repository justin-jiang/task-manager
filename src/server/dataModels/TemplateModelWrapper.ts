import { Model } from 'mongoose';
import { TemplateObject } from '../dataObjects/TemplateObject';
import { MongoDBModelManager } from '../dbDrivers/mongoDB/MongoDBModelManager';
import { BaseModelWrapper } from './BaseModelWrapper';
import { ITemplateModel, keysOfSchema } from './mongoDB/ITemplateModel';

export class TemplateModelWrapper extends BaseModelWrapper {

    public static async $$warmUp(): Promise<void> {
        const model: Model<ITemplateModel> = await MongoDBModelManager.$$getTemplateModel();
        await model.createIndexes();
    }
    protected static async getDBModel(): Promise<Model<ITemplateModel>> {
        return await MongoDBModelManager.$$getTemplateModel();
    }

    protected static convertModelToDBObject(modelData: ITemplateModel): TemplateObject {
        const dbObj: TemplateObject = new TemplateObject();
        keysOfSchema.forEach((item: string) => {
            if (modelData[item] != null) {
                dbObj[item] = modelData[item];
            }
        });
        return dbObj;
    }
}
