import { IRequestParam } from 'common/requestParams/IRequestParam';
import { TaskState } from 'common/TaskState';
import { CheckState } from 'common/CheckState';

/**
 * used for both Task(Task Apply, Task Result) audit(for admin) and check(for publisher)
 */
export class TaskAuditParam implements IRequestParam {
    // task uid
    public uid?: string;
    public state?: TaskState;
    public note?: string;
    public auditState?: CheckState;
    public satisfiedStar?: number;
    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.uid = '';
            this.state = TaskState.None;
            this.note = '';
            this.auditState = CheckState.NONE;
            this.satisfiedStar = 0;
        }
    }
}
