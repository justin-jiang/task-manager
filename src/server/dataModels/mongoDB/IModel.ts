import { Document } from 'mongoose';
import * as Constants from 'common/Constants';
export const BaseSchemaDef = {
    dataV: { type: String, default: Constants.ProductVersion },
    createTime: { type: Number, default: Date.now() },
};
export interface IModel extends Document {
    // TODO: define methods
    [key: string]: any;
}
