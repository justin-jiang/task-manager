import { CommonUtils } from 'common/CommonUtils';
import { DBObjectView, IDBObjectView } from './DBObjectView';
import { TaskState } from 'common/TaskState';

interface ITaskView extends IDBObjectView {
    name?: string;
    reward?: string;
    templateFileId?: string;
    publisherId?: string;
    applicantId?: string;
    executorId?: string;
    resultFileId?: string;
    resultFileversion?: number;
    note?: string;
    state?: TaskState;
}

export class TaskView extends DBObjectView implements ITaskView {
    public name?: string;
    public reward?: string;
    public templateFileId?: string;
    public publisherId?: string;
    public applicantId?: string;
    public executorId?: string;
    public resultFileId?: string;
    public resultFileversion?: number;
    public note?: string;
    public state?: TaskState;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.applicantId = '';
            this.executorId = '';
            this.name = '';
            this.note = '';
            this.publisherId = '';
            this.resultFileId = '';
            this.resultFileversion = -1;
            this.reward = '';
            this.state = TaskState.None;
            this.templateFileId = '';
        }
    }
    protected getKeysOfDBView(): string[] {
        return keysOfITaskView;
    }
}


export const keysOfITaskView: string[] = CommonUtils.getPropKeys(new TaskView(true));
