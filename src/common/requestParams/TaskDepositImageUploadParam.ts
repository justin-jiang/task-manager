import { ReceiptState } from 'common/ReceiptState';

export class TaskDepositImageUploadParam {
    // task uid
    public uid?: string;
    public publisherReceiptRequired?: number;

    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.uid = '';
            this.publisherReceiptRequired = ReceiptState.None;
        }
    }

}
