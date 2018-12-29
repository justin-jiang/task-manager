import { CommonUtils } from 'common/CommonUtils';
import { DBObject, IDBObject } from './DBObject';
interface ITaskApplicationObject extends IDBObject {

    taskId?: string;
    applicantId?: string;
}

export class TaskApplicationObject extends DBObject implements ITaskApplicationObject {
    [key: string]: any;
    public taskId?: string;
    public applicantId?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.applicantId = '';
            this.taskId = '';
        }
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfITaskObject;
    }
}
export const keysOfITaskObject: string[] = CommonUtils.getPropKeys(new TaskApplicationObject(true));
