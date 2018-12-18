import { Document, Schema, SchemaOptions } from 'mongoose';
import { ITemplateObject } from 'server/dataObjects/ITemplateObject';
import { BaseSchemaDef } from './IModel';

const schemaOptions: SchemaOptions = {
};
const schemaDef = Object.assign({
    uid: { type: String, required: true, index: { unique: true } },
    name: { type: String, required: true, index: true, unique: true },
    templateFileId: { type: String, required: true },
}, BaseSchemaDef);
/**
 * User Schema
 */
export const schema: Schema = new Schema(schemaDef, schemaOptions);


export interface ITemplateModel extends ITemplateObject, Document {
    // TODO: define methods

}
export const schemaName: string = 'Template';
export const keysOfSchema: string[] = Object.keys(schemaDef);

// TODO: do the prop check that all props in IXXXObject must be in keysOfSchema
