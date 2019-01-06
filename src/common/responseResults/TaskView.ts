import { CommonUtils } from 'common/CommonUtils';
import { DBObjectView, IDBObjectView } from './DBObjectView';
import { TaskState } from 'common/TaskState';

interface ITaskView extends IDBObjectView {
    name?: string;
    reward?: string;
    templateFileUid?: string;
    publisherId?: string;
    publisherName?: string;
    applicantId?: string;
    applicantName?: string;
    executorId?: string;
    executorName?: string;
    resultFileId?: string;
    resultFileversion?: number;
    note?: string;
    state?: TaskState;
}

export class TaskView extends DBObjectView implements ITaskView {
    public name?: string;
    public reward?: string;
    public templateFileUid?: string;
    public publisherId?: string;
    public publisherName?: string;
    public applicantId?: string;
    public applicantName?: string;
    public executorId?: string;
    public executorName?: string;
    public resultFileId?: string;
    public resultFileversion?: number;
    public note?: string;
    public state?: TaskState;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.applicantId = '';
            this.applicantName = '';
            this.executorId = '';
            this.executorName = '';
            this.name = '';
            this.note = '';
            this.publisherId = '';
            this.publisherName = '';
            this.resultFileId = '';
            this.resultFileversion = -1;
            this.reward = '';
            this.state = TaskState.None;
            this.templateFileUid = '';
        }
    }
}


export const keysOfITaskView: string[] = CommonUtils.getPropKeys(new TaskView(true));
