import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { TaskFullCommon } from 'common/commonDataObjects/TaskFullCommon';
import { TaskHistoryItem } from 'common/TaskHistoryItem';
export class TaskObject extends TaskFullCommon {
    public histories?: TaskHistoryItem[];
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.histories = [];
        }
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfITaskObject;
    }
}

export const keysOfITaskObject: string[] = getPropKeys(new TaskObject(true));
