import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { TaskState } from 'common/TaskState';
import { DBObject } from './DBObject';
export class TaskObject extends DBObject {
    [key: string]: any;
    public name?: string;
    public reward?: string;
    public templateFileUid?: string;
    public publisherUid?: string;
    public applicantUid?: string;
    public executorUid?: string;
    public resultFileUid?: string;
    public resultFileversion?: number;
    public note?: string;
    public state?: TaskState;
    public province?: string;
    public city?: string;
    public district?: string;
    public address?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.address = '';
            this.applicantUid = '';
            this.city = '';
            this.district = '';
            this.executorUid = '';
            this.name = '';
            this.note = '';
            this.province = '';
            this.publisherUid = '';
            this.resultFileUid = '';
            this.resultFileversion = -1;
            this.reward = '';
            this.state = TaskState.None;
            this.templateFileUid = '';
        }
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfITaskObject;
    }
}

export const keysOfITaskObject: string[] = getPropKeys(new TaskObject(true));
