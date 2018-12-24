import { Schema, SchemaOptions } from 'mongoose';
import { BaseSchemaDef, IModel } from 'server/dataModels/mongoDB/IModel';

const schemaOptions: SchemaOptions = {
};
const schemaDef = Object.assign({
    name: { type: String, required: true, index: true, unique: true },
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
export const schemaName: string = 'Template';
export const keysOfSchema: string[] = Object.keys(schemaDef);

// TODO: do the prop check that all props in IXXXObject must be in keysOfSchema
