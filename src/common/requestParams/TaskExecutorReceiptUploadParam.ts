
export class TaskExecutorReceiptUploadParam {
    public executorReceiptNote?: string;
    public executorReceiptDatetime?: number;
    public executorReceiptNumber?: string;

    // task uid
    public uid?: string;
    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.executorReceiptNote = '';
            this.executorReceiptDatetime = Date.now();
            this.executorReceiptNumber = '';
            this.uid = '';
        }
    }
}

