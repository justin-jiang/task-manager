import { IRequestParam } from 'common/requestParams/IRequestParam';
import { TaskState } from 'common/TaskState';

/**
 * used for both Task audit and task apply audit
 */
export class TaskAuditParam implements IRequestParam {
    // task uid
    public uid?: string;
    public state?: TaskState;
    public note?: string;
}
