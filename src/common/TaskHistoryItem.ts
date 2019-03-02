import { CommonObject } from 'common/commonDataObjects/CommonObject';
import { TaskActionType } from './TaskActionType';
import { TaskState } from './TaskState';

export class TaskHistoryItem extends CommonObject {
    public state?: TaskState;
    public description?: string;

    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.state = TaskState.None;
            this.description = '';
        }
    }
}


