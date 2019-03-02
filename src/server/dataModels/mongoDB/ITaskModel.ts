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
    // the case-insentive index will be created in XXXWrapper.$$warmUp
    name: { type: String, required: true } as SchemaTypeOpts<any>,
    reward: { type: Number, required: true },
    templateFileUid: { type: String, required: true },
    publisherUid: { type: String, required: true },
    applicantUid: { type: String },
    executorUid: { type: String },
    resultFileUid: { type: String },
    resultFileversion: { type: Number },
    resultTime: { type: Number },
    note: { type: String },
    state: { type: Number, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    // the target company address
    address: { type: String, required: true },
    companyName: { type: String, required: true },
    companyContact: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    proposedMargin: { type: Number, required: true },
    actualMargin: { type: Number },
    deadline: { type: Number, required: true },
    // whether the task is suspended
    suspended: { type: Number },
    reasonForSuspend: { type: String },
    // conditions for the executor
    minExecutorStar: { type: Number, required: true },
    executorTypes: { type: [Number], required: true },
    receiptRequired: { type: Number },
    histories: { type: [Schema.Types.Mixed] },
    depositImageUid: { type: String },
    depositRefundImageUid: { type: String },
    marginImageUid: { type: String },
    marginRefundImageUid: { type: String },
    adminSatisfiedStar: { type: Number },
    publisherResultSatisfactionStar: { type: Number },
    publisherVisitStar: { type: Number },
    publisherVisitNote: { type: String },
    publishTime: { type: Number },
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
