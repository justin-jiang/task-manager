
export class TaskExecutorReceiptNotRequiredParam {
    public executorReceiptNote?: string;
    // task uid
    public uid?: string;
    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.executorReceiptNote = '';
            this.uid = '';
        }
    }
}

