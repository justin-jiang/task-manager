import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Schema, SchemaOptions } from 'mongoose';
import { ApiError } from 'server/common/ApiError';
import { keysOfIUserObject } from 'server/dataObjects/UserObject';
import { BaseSchemaDef, IModel } from './IModel';

const schemaOptions: SchemaOptions = {
};
const schemaDef = Object.assign({
    name: { type: String, required: true, index: true, unique: true },
    password: { type: String, required: true },
    telephone: { type: String },
    nickName: { type: String },
    email: { type: String },
    logoId: { type: String },
    qualificationId: { type: String },
    qualificationVersion: { type: Number },
    roles: { type: [Number] },
    type: { type: Number },
    state: { type: Number },
    lastLogonTime: { type: Number },
}, BaseSchemaDef);
/**
 * User Schema
 */
export const schema: Schema = new Schema(schemaDef, schemaOptions);


export interface IUserModel extends IModel {
    // TODO: define methods

}
export const schemaName: string = 'User';
export const keysOfSchema: string[] = Object.keys(schemaDef);

// TODO: do the prop check that all props in IUserObject must be in keysOfSchema
keysOfIUserObject.forEach((item) => {
    if (!keysOfSchema.includes(item)) {
        throw new ApiError(ApiResultCode.DB_SCHEMA_PROP_MISSED, `${item} missed in User Schema`);
    }
});
