import { IUserObject } from 'server/dataObjects/IUserObject';
import { Schema, SchemaOptions } from 'mongoose';
import { BaseSchemaDef, IModel } from './IModel';

const schemaOptions: SchemaOptions = {
};
const schemaDef = Object.assign({
    uid: { type: String, required: true, index: { unique: true } },
    name: { type: String, required: true, index: true, unique: true },
    email: { type: String },
    password: { type: String, required: true },
    logo: { type: String },
    accountType: { type: Number },
    telephone: { type: String },
    lastLogonTime: { type: Number },
    roles: { type: [Number] },
}, BaseSchemaDef);
/**
 * User Schema
 */
export const schema: Schema = new Schema(schemaDef, schemaOptions);


export interface IUserModel extends IUserObject, IModel {
    // TODO: define methods

}
export const schemaName: string = 'User';
export const keysOfSchema: string[] = Object.keys(schemaDef);

// TODO: do the prop check that all props in IUserObject must be in keysOfSchema
