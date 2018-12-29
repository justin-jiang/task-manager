import { Schema, SchemaOptions, SchemaTypeOpts } from 'mongoose';
import { BaseSchemaDef, IModel } from 'server/dataModels/mongoDB/IModel';
import { keysOfITemplateObject as KeysOfIDBObject } from 'server/dataObjects/TemplateObject';
import { ApiError } from 'server/common/ApiError';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
export const schemaName: string = 'templates';

const schemaOptions: SchemaOptions = {
    collection: schemaName,
};
const schemaDef = Object.assign({
    // the case-insentive index will be created in TemplateWrapper.$$warmUp
    name: { type: String, required: true } as SchemaTypeOpts<any>,
    version: { type: Number, required: true },
    templateFileId: { type: String, required: true },
    note: { type: String },

}, BaseSchemaDef);
/**
 * User Schema
 */
export const schema: Schema = new Schema(schemaDef, schemaOptions);


export interface ITemplateModel extends IModel {
    // TODO: define methods

}

export const keysOfSchema: string[] = Object.keys(schemaDef);

// do the prop check that all props in IXXXObject must be in keysOfSchema
KeysOfIDBObject.forEach((item) => {
    if (!keysOfSchema.includes(item)) {
        throw new ApiError(ApiResultCode.DB_SCHEMA_PROP_MISSED, `${item} missed in Template Schema`);
    }
});
