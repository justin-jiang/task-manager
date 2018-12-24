import { Document } from 'mongoose';
import * as Constants from 'common/Config';
export const BaseSchemaDef = {
    uid: { type: String, required: true, index: { unique: true } },
    dataV: { type: String, default: Constants.ProductVersion },
    createTime: { type: Number, default: Date.now() },
};
export interface IModel extends Document {
    // TODO: define methods
    [key: string]: any;

}
