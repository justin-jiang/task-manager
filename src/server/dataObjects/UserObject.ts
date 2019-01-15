import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { CommonUser } from 'common/commonDataObjects/CommonUser';
export class UserObject extends CommonUser {
    public publishedTaskCount?: number;
    public executedTaskCount?: number;
    public executorStar?: number;
    public publisherStar?: number;

    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps) {
            this.publishedTaskCount = 0;
            this.executedTaskCount = 0;
            this.executorStar = 0;
            this.publisherStar = 0;
        }
    }
}

export const keysOfIUserObject: string[] = getPropKeys(new UserObject(true));
