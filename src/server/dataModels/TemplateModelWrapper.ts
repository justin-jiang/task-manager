import { Model } from 'mongoose';
import { ITemplateObject } from '../dataObjects/ITemplateObject';
import { MongoDBModelManager } from '../dbDrivers/mongoDB/MongoDBModelManager';
import { LoggersManager } from '../libsWrapper/LoggersManager';
import { BaseModelWrapper } from './BaseModelWrapper';
import { ITemplateModel } from './mongoDB/ITemplateModel';
import { keysOfSchema } from './mongoDB/IUserModel';

export class TemplateModelWrapper extends BaseModelWrapper implements ITemplateObject {
    [key: string]: any;
    public static async $$getAll(): Promise<ITemplateModel[]> {
        LoggersManager.debug('$$getAll');
        const model: Model<ITemplateModel> = await MongoDBModelManager.$$getTemplateModel();
        return await model.find();
    }
    public static async $$warmUp(): Promise<void> {
        const model: Model<ITemplateModel> = await MongoDBModelManager.$$getTemplateModel();
        await model.createIndexes();
    }
    // #region implement of TemplateModelWrapper
    public name?: string;
    public templateFileId?: string;

    public async $$save(): Promise<void> {
        const model: Model<ITemplateModel> = await MongoDBModelManager.$$getTemplateModel();
        const modelInst: ITemplateModel = new model();
        this.assembleModel(modelInst, keysOfSchema);
        await modelInst.save();
    }
    // #endregion
}
