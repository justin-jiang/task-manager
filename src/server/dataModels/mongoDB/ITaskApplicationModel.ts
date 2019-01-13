import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Schema, SchemaOptions, SchemaTypeOpts } from 'mongoose';
import { ApiError } from 'server/common/ApiError';
import { BaseSchemaDef, IModel } from 'server/dataModels/mongoDB/IModel';
import { keysOfITaskObject as KeysOfIDBObject } from 'server/dataObjects/TaskApplicationObject';
export const schemaName: string = 'taskApplications';
const schemaOptions: SchemaOptions = {
    collection: schemaName,
};
const schemaDef = Object.assign({

    taskUid: { type: String, required: true, index: true, unique: true } as SchemaTypeOpts<any>,
    applicantUid: { type: String, required: true },
}, BaseSchemaDef);
/**
 * User Schema
 */
export const schema: Schema = new Schema(schemaDef, schemaOptions);


export interface ITaskApplicationModel extends IModel {
    // TODO: define methods

}

export const keysOfSchema: string[] = Object.keys(schemaDef);

// do the prop check that all props in IXXXObject must be in keysOfSchema
KeysOfIDBObject.forEach((item) => {
    if (!keysOfSchema.includes(item)) {
        throw new ApiError(ApiResultCode.DbSchemaPropMissed, `${item} missed in TaskApplications Schema`);
    }
});
