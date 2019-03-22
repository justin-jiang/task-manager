import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { Schema, SchemaOptions, SchemaTypeOpts } from 'mongoose';
import { ApiError } from 'server/common/ApiError';
import { BaseSchemaDef, IModel } from 'server/dataModels/mongoDB/IModel';
import { keysOfTaskObject } from 'server/dataObjects/TaskObject';
import { ArgsParser } from 'server/common/ArgsParser';
export const schemaName: string = 'tasks';
const schemaOptions: SchemaOptions = {
    collection: schemaName,
};
const schemaDef = Object.assign({
    /**
     * NOTE: the case-insentive index will be created in XXXWrapper.$$warmUp
     */
    // the margin from executor
    actualMargin: { type: Number },
    // the target company address
    address: { type: String, required: true },
    adminSatisfiedStar: { type: Number },
    // the applicant(i.e. some executor) id
    applicantUid: { type: String },
    companyName: { type: String, required: true },
    companyContact: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    // target company city
    city: { type: String, required: true },

    deadline: { type: Number, required: true },
    depositAuditState: { type: Number },
    depositAuditNote: { type: String },
    // the deposit image from publisher
    depositImageUid: { type: String },
    // the deposit refund image from admin
    depositRefundImageUid: { type: String },
    // target company district
    district: { type: String, required: true },

    executorAuditState: { type: Number },
    executorAuditNote: { type: String },
    executorReceiptDatetime: { type: Number },
    executorReceiptImageUid: { type: String },
    // the note for no receipt scenario
    executorReceiptNote: { type: String },
    executorReceiptNumber: { type: String },
    executorReceiptRequired: { type: Number },
    // the executor type required by the task
    executorTypes: { type: [Number], required: true },
    // the executor id whom the task is assigned to
    executorUid: { type: String },

    histories: { type: [Schema.Types.Mixed] },

    infoAuditState: { type: Number },
    infoAuditNote: { type: String },

    marginAditState: { type: Number },
    marginAuditNote: { type: String },
    // margin image from executor
    marginImageUid: { type: String },
    // the margin refund image from admin
    marginRefundImageUid: { type: String },
    // the executor start required by the task
    minExecutorStar: { type: Number, required: true },

    name: { type: String, required: true } as SchemaTypeOpts<any>,
    // task description
    note: { type: String },

    paymentToExecutor: { type: Number },
    payToExecutorImageUid: { type: String },
    // the proposed margin from executor
    proposedMargin: { type: Number, required: true },
    // target company province
    province: { type: String, required: true },
    publisherReceiptDatetime: { type: Number },
    publisherReceiptImageUid: { type: String },
    // the note for no receipt scenario
    publisherReceiptNote: { type: String },
    publisherReceiptNumber: { type: String },
    publisherReceiptRequired: { type: Number },
    // task publish time
    publishTime: { type: Number },
    publisherResultSatisfactionStar: { type: Number },
    publisherUid: { type: String, required: true },
    publisherVisitStar: { type: Number },
    publisherVisitNote: { type: String },

    resultFileUid: { type: String },
    resultFileversion: { type: Number },
    resultTime: { type: Number },
    reward: { type: Number, required: true },

    state: { type: Number, required: true },

    templateFileUid: { type: String, required: true },
}, BaseSchemaDef);
/**
 * User Schema
 */
export const schema: Schema = new Schema(schemaDef, schemaOptions);


export interface ITaskModel extends IModel {
    // TODO: define methods

}

export const keysOfSchema: string[] = Object.keys(schemaDef);

// do the prop check that all props in XXXObject must be in keysOfSchema
if (ArgsParser.isDebugMode()) {
    keysOfTaskObject.forEach((item) => {
        if (!keysOfSchema.includes(item)) {
            throw new ApiError(ApiResultCode.DbSchemaPropMissed, `${item} missed in Tasks Schema`);
        }
    });
}

