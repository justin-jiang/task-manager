import { Schema, SchemaOptions } from 'mongoose';
import { keysOfUserObject as KeysOfIDBObject } from 'server/dataObjects/UserObject';
import { BaseSchemaDef, IModel } from './IModel';
export const schemaName: string = 'users';

const schemaOptions: SchemaOptions = {
    collection: schemaName,
};
const schemaDef = Object.assign({
    // the name col index will be created in UserModelWrapper.$$warmUp
    name: { type: String, required: true },
    password: { type: String, required: true },
    telephone: { type: String, required: true, index: true, unique: true },
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
    licenseUid: { type: String },
    licenseState: { type: Number },
    licenseWithPersonUid: { type: String },
    licenseWidthPersonState: { type: Number },
    authLetterUid: { type: String },
    authLetterState: { type: Number },
    roles: { type: [Number] },
    type: { type: Number },
    state: { type: Number },
    lastLogonTime: { type: Number },
    // the individual real name or corp real name
    realName: { type: String },
    principalName: { type: String },
    principalIDNumber: { type: String },
    // the indivudual sex
    sex: { type: Number },
    description: { type: String },
    identityNumber: { type: String },
    address: { type: String },
    province: { type: String },
    city: { type: String },
    district: { type: String },
    publishedTaskCount: { type: Number, default: 0 },
    executedTaskCount: { type: Number, default: 0 },
    // the executor total stars from publisher because of task execution
    executorStar: { type: Number, default: 0 },
    // the publisher total stars from executor becaus of task execution
    publisherStar: { type: Number, default: 0 },
    idState: { type: Number },
    idCheckNote: { type: String },
    qualificationCheckNote: { type: String },
    // qualification start from admin
    qualificationStar: { type: Number, default: 0 },
    // qualification score from admin
    qualificationScore: { type: Number, default: 0 },
    bankName: { type: String },
    bankAccountName: { type: String },
    bankAccountNumber: { type: String },

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
        // tslint:disable-next-line:no-console
        console.error(`${item} missed in User Schema`);
    }
});
