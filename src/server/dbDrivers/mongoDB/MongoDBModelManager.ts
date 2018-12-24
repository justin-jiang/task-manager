import { IUserModel, schemaName as userSchemaName, schema as userSchema } from 'server/dataModels/mongoDB/IUserModel';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { Connection, Model } from 'mongoose';
import { mongodbName } from 'server/common/Constants';
import { MongoDBDriver } from './MongoDBDriver';
import {
    ITemplateModel, schemaName as templateSchemaName, schema as templateSchema,
} from 'server/dataModels/mongoDB/ITemplateModel';
export class MongoDBModelManager {
    public static async $$getUserModel(): Promise<Model<IUserModel>> {
        if (this.modelCache[this.userModelName] == null) {
            LoggerManager.debug('creating UserModel');
            const conn: Connection = await MongoDBDriver.$$getConnection(mongodbName);
            this.modelCache[this.userModelName] = conn.model(userSchemaName, userSchema);
        }
        return this.modelCache[this.userModelName];
    }

    public static async $$getTemplateModel(): Promise<Model<ITemplateModel>> {
        if (this.modelCache[this.templateModelName] == null) {
            LoggerManager.debug('creating templateModel');
            const conn: Connection = await MongoDBDriver.$$getConnection(mongodbName);
            this.modelCache[this.templateModelName] = conn.model(templateSchemaName, templateSchema);
        }
        return this.modelCache[this.templateModelName];
    }

    private static modelCache: { [key: string]: Model<any> } = {};
    private static readonly userModelName: string = 'userModel';
    private static readonly templateModelName: string = 'templateModel';
}
