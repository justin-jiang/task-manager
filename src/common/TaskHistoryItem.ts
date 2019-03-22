import { CommonObject } from 'common/commonDataObjects/CommonObject';
import { TaskState } from './TaskState';

export class TaskHistoryItem extends CommonObject {
    public state?: TaskState;
    public title?: string;
    public description?: string;

    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.state = TaskState.None;
            this.title = '';
            this.description = '';
        }
    }
}


