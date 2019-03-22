import { ReceiptState } from 'common/ReceiptState';

export class TaskExecutorReceiptUploadParam {
    public executorReceiptNote?: string;
    public executorReceiptDatetime?: number;
    public executorReceiptNumber?: string;
    public executorReceiptRequired?: number;
    // task uid
    public uid?: string;
    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.executorReceiptNote = '';
            this.executorReceiptDatetime = Date.now();
            this.executorReceiptNumber = '';
            this.executorReceiptRequired = ReceiptState.Required;
            this.uid = '';
        }
    }
}

