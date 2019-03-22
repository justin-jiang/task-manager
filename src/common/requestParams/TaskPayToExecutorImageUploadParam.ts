
export class TaskPayToExecutorImageUploadParam {
    // task uid
    public uid?: string;
    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.uid = '';
        }
    }
}
