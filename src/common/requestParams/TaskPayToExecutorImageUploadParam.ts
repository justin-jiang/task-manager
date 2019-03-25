import { ReceiptState } from 'common/ReceiptState';

export class TaskPayToExecutorImageUploadParam {
    // task uid
    public uid?: string;
    public executorReceiptRequired?: ReceiptState;
    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.uid = '';
            this.executorReceiptRequired = ReceiptState.None;
        }
    }
}
