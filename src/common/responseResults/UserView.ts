import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { CommonUser } from 'common/commonDataObjects/CommonUser';


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

export const keysOfIUserView: string[] = getPropKeys(new UserView(true));
