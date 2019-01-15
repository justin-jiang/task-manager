import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { TaskState } from 'common/TaskState';
import { DBObjectView } from './DBObjectView';

export class TaskView extends DBObjectView {
    public name?: string;
    public reward?: string;
    public templateFileUid?: string;
    public publisherUid?: string;
    public publisherName?: string;
    public applicantUid?: string;
    public applicantName?: string;
    public executorUid?: string;
    public executorName?: string;
    public resultFileUid?: string;
    public resultFileversion?: number;
    public note?: string;
    public state?: TaskState;

    public createTime?: number;
    public province?: string;
    public city?: string;
    public district?: string;
    public address?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.address = '';
            this.applicantUid = '';
            this.applicantName = '';
            this.city = '';
            this.createTime = 0;
            this.district = '';
            this.executorUid = '';
            this.executorName = '';
            this.name = '';
            this.note = '';
            this.province = '';
            this.publisherUid = '';
            this.publisherName = '';
            this.resultFileUid = '';
            this.resultFileversion = -1;
            this.reward = '';
            this.state = TaskState.None;
            this.templateFileUid = '';
        }
    }
}


export const keysOfITaskView: string[] = getPropKeys(new TaskView(true));
