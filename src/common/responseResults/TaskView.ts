import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { TaskFullCommon } from 'common/commonDataObjects/TaskFullCommon';

export class TaskView extends TaskFullCommon {
    public applicantName?: string;
    // the url of depositImageUid
    public depositImageUrl?: string;
    public executorName?: string;
    // the url of marginImageUid
    public marginImageUrl?: string;
    public publisherName?: string;

    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps) {
            this.depositImageUrl = '';
            this.marginImageUrl = '';
        }
    }
}


export const keysOfTaskView: string[] = getPropKeys(new TaskView(true));
