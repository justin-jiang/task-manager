import { CommonUtils } from 'common/CommonUtils';
import { DBObject } from './DBObject';

export class TaskApplicationObject extends DBObject {
    [key: string]: any;
    public taskUid?: string;
    public applicantUid?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.applicantUid = '';
            this.taskUid = '';
        }
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfITaskObject;
    }
}
export const keysOfITaskObject: string[] = CommonUtils.getPropKeys(new TaskApplicationObject(true));
