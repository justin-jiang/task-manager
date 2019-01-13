import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Schema, SchemaOptions, SchemaTypeOpts } from 'mongoose';
import { ApiError } from 'server/common/ApiError';
import { BaseSchemaDef, IModel } from 'server/dataModels/mongoDB/IModel';
import { keysOfITaskObject as KeysOfIDBObject } from 'server/dataObjects/TaskObject';
export const schemaName: string = 'tasks';
const schemaOptions: SchemaOptions = {
    collection: schemaName,
};
const schemaDef = Object.assign({
    // the case-insentive index will be created in TemplateWrapper.$$warmUp
    name: { type: String, required: true } as SchemaTypeOpts<any>,
    reward: { type: String, required: true },
    templateFileUid: { type: String, required: true },
    publisherUid: { type: String, required: true },
    applicantUid: { type: String },
    executorUid: { type: String },
    resultFileUid: { type: String },
    resultFileversion: { type: Number },
    note: { type: String },
    state: { type: Number, required: true },

}, BaseSchemaDef);
/**
 * User Schema
 */
export const schema: Schema = new Schema(schemaDef, schemaOptions);


export interface ITaskModel extends IModel {
    // TODO: define methods

}

export const keysOfSchema: string[] = Object.keys(schemaDef);

// do the prop check that all props in IXXXObject must be in keysOfSchema
KeysOfIDBObject.forEach((item) => {
    if (!keysOfSchema.includes(item)) {
        throw new ApiError(ApiResultCode.DbSchemaPropMissed, `${item} missed in Tasks Schema`);
    }
});
