import { Schema, SchemaOptions } from 'mongoose';
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
    logoUid: { type: String },
    logoState: { type: Number },
    qualificationUid: { type: String },
    qualificationVersion: { type: Number },
    qualificationState: { type: Number },
    frontIdUid: { type: String },
    frontIdState: { type: Number },
    backIdUid: { type: String },
    backIdState: { type: Number },
    roles: { type: [Number] },
    type: { type: Number },
    state: { type: Number },
    lastLogonTime: { type: Number },
    // the individual real name or corp real name
    realName: { type: String },
    // the indivudual sex
    sex: { type: Number },
    description: { type: String },
    identityNumber: { type: String },
    address: { type: String },
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
        console.error(`${item} missed in User Schema`);
    }
});
