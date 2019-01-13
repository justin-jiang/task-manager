import { CommonUtils } from 'common/CommonUtils';
import { TaskActionType } from 'common/TaskActionType';
import { DBObject } from './DBObject';

export class TaskCheckRecordObject extends DBObject {
    [key: string]: any;
    public taskUid?: string;
    public operatorUid?: string;
    public actionType?: TaskActionType;
    public optionData?: any;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.actionType = TaskActionType.None;
            this.operatorUid = '';
            this.optionData = '';
            this.taskUid = '';
        }
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfIDBObject;
    }
}
export const keysOfIDBObject: string[] = CommonUtils.getPropKeys(new TaskCheckRecordObject(true));
