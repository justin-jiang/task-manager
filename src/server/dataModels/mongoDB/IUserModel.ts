import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Schema, SchemaOptions } from 'mongoose';
import { ApiError } from 'server/common/ApiError';
import { keysOfIUserObject as KeysOfIDBObject } from 'server/dataObjects/UserObject';
import { BaseSchemaDef, IModel } from './IModel';
export const schemaName: string = 'users';

const schemaOptions: SchemaOptions = {
    collection: schemaName,
};
const schemaDef = Object.assign({
    // the name col index will be created in UserModelWrapper.$$warmUp
    name: { type: String, required: true },
    password: { type: String, required: true },
    telephone: { type: String },
    nickName: { type: String },
    // the email col index will be created in UserModelWrapper.$$warmUp
    email: { type: String },
    logoId: { type: String },
    logoState: { type: Number },
    qualificationId: { type: String },
    qualificationVersion: { type: Number },
    qualificationState: { type: Number },
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

export const keysOfSchema: string[] = Object.keys(schemaDef);

// do the prop check that all props in IXXXObject must be in keysOfSchema
KeysOfIDBObject.forEach((item) => {
    if (!keysOfSchema.includes(item)) {
        throw new ApiError(ApiResultCode.DbSchemaPropMissed, `${item} missed in User Schema`);
    }
});
