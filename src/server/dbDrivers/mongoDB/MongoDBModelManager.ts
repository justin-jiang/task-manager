import { Connection, Model } from 'mongoose';
import { mongodbName } from 'server/common/Constants';
// tslint:disable-next-line:max-line-length
import { ITaskApplicationModel, schema as taskApplicationSchema, schemaName as taskApplicationSchemaName } from 'server/dataModels/mongoDB/ITaskApplicationModel';
import { ITaskModel, schema as taskSchema, schemaName as taskSchemaName } from 'server/dataModels/mongoDB/ITaskModel';
// tslint:disable-next-line:max-line-length
import { ITemplateModel, schema as templateSchema, schemaName as templateSchemaName } from 'server/dataModels/mongoDB/ITemplateModel';
import { IUserModel, schema as userSchema, schemaName as userSchemaName } from 'server/dataModels/mongoDB/IUserModel';
import { LoggerManager } from 'server/libsWrapper/LoggerManager';
import { MongoDBDriver } from './MongoDBDriver';
import { ITaskCheckRecordModel, schema as taskCheckRecordSchema, schemaName as taskCheckRecordSchemaName } from 'server/dataModels/mongoDB/ITaskCheckRecordModel';
import { IUserNotificationModel, schema as userNotificationSchema, schemaName as userNotificationSchemaName } from 'server/dataModels/mongoDB/IUserNotificationModel';
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
            LoggerManager.debug('creating TemplateModel');
            const conn: Connection = await MongoDBDriver.$$getConnection(mongodbName);
            this.modelCache[this.templateModelName] = conn.model(templateSchemaName, templateSchema);
        }
        return this.modelCache[this.templateModelName];
    }

    public static async $$getTaskModel(): Promise<Model<ITaskModel>> {
        if (this.modelCache[this.taskModelName] == null) {
            LoggerManager.debug('creating TaskModel');
            const conn: Connection = await MongoDBDriver.$$getConnection(mongodbName);
            this.modelCache[this.taskModelName] = conn.model(taskSchemaName, taskSchema);
        }
        return this.modelCache[this.taskModelName];
    }
    public static async $$getTaskApplicationModel(): Promise<Model<ITaskApplicationModel>> {
        if (this.modelCache[this.taskApplicationModelName] == null) {
            LoggerManager.debug('creating TaskApplicationModel');
            const conn: Connection = await MongoDBDriver.$$getConnection(mongodbName);
            this.modelCache[this.taskApplicationModelName] = conn.model(
                taskApplicationSchemaName, taskApplicationSchema);
        }
        return this.modelCache[this.taskApplicationModelName];
    }
    public static async $$getTaskCheckRecordModel(): Promise<Model<ITaskCheckRecordModel>> {
        if (this.modelCache[this.taskCheckRecordModelName] == null) {
            LoggerManager.debug('creating TaskCheckRecordModel');
            const conn: Connection = await MongoDBDriver.$$getConnection(mongodbName);
            this.modelCache[this.taskCheckRecordModelName] = conn.model(
                taskCheckRecordSchemaName, taskCheckRecordSchema);
        }
        return this.modelCache[this.taskCheckRecordModelName];
    }

    public static async $$getUserNotificationModel(): Promise<Model<IUserNotificationModel>> {
        if (this.modelCache[this.userNotificationModelName] == null) {
            LoggerManager.debug('creating UserNotificationModel');
            const conn: Connection = await MongoDBDriver.$$getConnection(mongodbName);
            this.modelCache[this.userNotificationModelName] = conn.model(
                userNotificationSchemaName, userNotificationSchema);
        }
        return this.modelCache[this.userNotificationModelName];
    }

    private static modelCache: { [key: string]: Model<any> } = {};
    private static readonly userModelName: string = 'userModel';
    private static readonly templateModelName: string = 'templateModel';

    private static readonly taskModelName: string = 'taskModel';

    private static readonly taskApplicationModelName: string = 'taskApplicationModel';
    private static readonly taskCheckRecordModelName: string = 'taskCheckRecordModel';
    private static readonly userNotificationModelName: string = 'userNotificationModel';
}
