import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Schema, SchemaOptions, SchemaTypeOpts } from 'mongoose';
import { ApiError } from 'server/common/ApiError';
import { BaseSchemaDef, IModel } from 'server/dataModels/mongoDB/IModel';
import { keysOfUserNotificationObject } from 'server/dataObjects/UserNotificationObject';
export const schemaName: string = 'userNotifications';
const schemaOptions: SchemaOptions = {
    collection: schemaName,
};
const schemaDef = Object.assign({
    targetUserUid: { type: String, required: true, index: true } as SchemaTypeOpts<any>,
    targetObjectUid: { type: String, required: true } as SchemaTypeOpts<any>,
    type: { type: Number, required: true } as SchemaTypeOpts<any>,
    state: { type: Number, required: true } as SchemaTypeOpts<any>,
    content: { type: String } as SchemaTypeOpts<any>,
    optionData: { type: Schema.Types.Mixed, required: false } as SchemaTypeOpts<any>,
}, BaseSchemaDef);
/**
 * User Schema
 */
export const schema: Schema = new Schema(schemaDef, schemaOptions);


export interface IUserNotificationModel extends IModel {
    // TODO: define methods

}

export const keysOfSchema: string[] = Object.keys(schemaDef);

// do the prop check that all props in IXXXObject must be in keysOfSchema
keysOfUserNotificationObject.forEach((item) => {
    if (!keysOfSchema.includes(item)) {
        throw new ApiError(ApiResultCode.DbSchemaPropMissed, `${item} missed in userNotification Schema`);
    }
});
