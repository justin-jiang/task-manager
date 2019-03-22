export class TaskApplyCheckParam {
    // task uid
    public uid?: string;
    public pass?: boolean;
    public note?: string;

    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.uid = '';
            this.pass = true;
            this.note = '';
        }
    }
}
