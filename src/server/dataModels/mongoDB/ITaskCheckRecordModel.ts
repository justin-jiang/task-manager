import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Schema, SchemaOptions, SchemaTypeOpts } from 'mongoose';
import { ApiError } from 'server/common/ApiError';
import { BaseSchemaDef, IModel } from 'server/dataModels/mongoDB/IModel';
import { keysOfIDBObject } from 'server/dataObjects/TaskCheckRecordObject';
export const schemaName: string = 'taskCheckRecords';
const schemaOptions: SchemaOptions = {
    collection: schemaName,
};
const schemaDef = Object.assign({
    taskUid: { type: String, required: true, index: true, unique: true } as SchemaTypeOpts<any>,
    operatorUid: { type: String, required: true },
    actionType: { type: Number, required: true },
    optionData: { type: Schema.Types.Mixed, required: false },
}, BaseSchemaDef);
/**
 * User Schema
 */
export const schema: Schema = new Schema(schemaDef, schemaOptions);


export interface ITaskCheckRecordModel extends IModel {
    // TODO: define methods

}

export const keysOfSchema: string[] = Object.keys(schemaDef);

// do the prop check that all props in IXXXObject must be in keysOfSchema
keysOfIDBObject.forEach((item) => {
    if (!keysOfSchema.includes(item)) {
        throw new ApiError(ApiResultCode.DbSchemaPropMissed, `${item} missed in taskCheckRecords Schema`);
    }
});
