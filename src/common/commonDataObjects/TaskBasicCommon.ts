import { CommonObject, getPropKeys } from 'common/commonDataObjects/CommonObject';
import { TaskState } from 'common/TaskState';
import { UserType } from 'common/UserTypes';
export class TaskBasicCommon extends CommonObject {
    public city?: string;
    public district?: string;
    public deadline?: number;
    public executorTypes?: UserType[];
    public minExecutorStar?: number;
    public name?: string;
    public note?: string;
    public province?: string;
    public proposedMargin?: number;
    public publishTime?: number;
    public reward?: number;
    public state?: TaskState;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.city = '';
            this.deadline = Date.now() + 7 * 24 * 3600 * 1000;
            this.district = '';
            this.executorTypes = [];
            this.minExecutorStar = 0;
            this.name = '';
            this.note = '';
            this.proposedMargin = 0;
            this.province = '';
            this.publishTime = 0;
            this.reward = 0;
            this.state = TaskState.None;
        }
    }
}

export const keysOfTaskBasicCommon: string[] = getPropKeys(new TaskBasicCommon(true));
