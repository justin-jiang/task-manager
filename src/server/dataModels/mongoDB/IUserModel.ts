import { Schema, SchemaOptions } from 'mongoose';
import { keysOfUserObject as KeysOfIDBObject } from 'server/dataObjects/UserObject';
import { BaseSchemaDef, IModel } from './IModel';
export const schemaName: string = 'users';

const schemaOptions: SchemaOptions = {
    collection: schemaName,
};
const schemaDef = Object.assign({
    /**
     * Basic Info
     */
    address: { type: String },

    city: { type: String },

    description: { type: String },
    // the district of location
    district: { type: String },


    // the email col index will be created in UserModelWrapper.$$warmUp
    email: { type: String },
    // the system user Id(for indivual, it means user himself, for corp, it means the user who use the system)
    identityNumber: { type: String },

    logoUid: { type: String },
    logoState: { type: Number },

    // the name col index will be created in UserModelWrapper.$$warmUp
    name: { type: String, required: true },
    nickName: { type: String },

    password: { type: String, required: true },
    // for corp user, the principal user name who use the system
    principalName: { type: String },
    // for corp user, the principal user Id number
    principalIDNumber: { type: String },
    province: { type: String },

    // the individual real name or the corp name
    realName: { type: String },
    // Executor or Publisher or Admin
    roles: { type: [Number] },

    // the indivudual sex
    sex: { type: Number },

    telephone: { type: String, required: true, index: true, unique: true },
    // Induvidual or type
    type: { type: Number },

    /**
     * qualification info
     */
    authLetterUid: { type: String },
    authLetterState: { type: Number },

    backIdUid: { type: String },
    backIdState: { type: Number },

    frontIdUid: { type: String },
    frontIdState: { type: Number },

    licenseUid: { type: String },
    licenseState: { type: Number },

    licenseWithPersonUid: { type: String },
    licenseWidthPersonState: { type: Number },

    // for admin, it is used as the qualification template
    qualificationUid: { type: String },
    qualificationVersion: { type: Number },



    /**
     * status info
     */

    executedTaskCount: { type: Number, default: 0 },
    idState: { type: Number },
    idCheckNote: { type: String },
    lastLogonTime: { type: Number },
    publishedTaskCount: { type: Number, default: 0 },
    qualificationState: { type: Number },
    qualificationCheckNote: { type: String },
    state: { type: Number },

    /**
     * Rate Info
     */
    // the executor total stars from publisher because of task execution
    executorStar: { type: Number },
    // the publisher total stars from executor becaus of task execution
    publisherStar: { type: Number },
    // qualification start from admin
    qualificationStar: { type: Number },
    // qualification score from admin
    qualificationScore: { type: Number },

    // Bank Info
    bankName: { type: String },
    bankAccountName: { type: String },
    bankAccountNumber: { type: String },
    linkBankAccountNumber: { type: String },

    /**
     * Others
     */
    registerProtocolUid: { type: String },
    registerProtocolVersion: { type: Number },

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
