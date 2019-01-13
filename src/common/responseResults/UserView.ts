import { CommonUser } from 'common/commonDataObjects/CommonUser';
import { CommonUtils } from 'common/CommonUtils';


export class UserView extends CommonUser {
    public logoUrl?: string;
    public frondIdUrl?: string;
    public backIdUrl?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps) {
            this.backIdUrl = '';
            this.frondIdUrl = '';
            this.logoUrl = '';
        }
    }
}

export const keysOfIUserView: string[] = CommonUtils.getPropKeys(new UserView(true));
