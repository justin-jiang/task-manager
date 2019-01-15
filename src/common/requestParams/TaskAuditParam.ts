import { IRequestParam } from 'common/requestParams/IRequestParam';
import { TaskState } from 'common/TaskState';

export class TaskAuditParam implements IRequestParam {
    // task uid
    public uid?: string;
    public state?: TaskState;
    public note?: string;
}
