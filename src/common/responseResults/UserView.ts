import { getPropKeys } from 'common/commonDataObjects/CommonObject';
import { UserCommon } from 'common/commonDataObjects/UserCommon';


export class UserView extends UserCommon {
    public logoUrl?: string;
    public frontIdUrl?: string;
    public backIdUrl?: string;
    public authLetterUrl?: string;
    public licenseUrl?: string;
    public licenseWithPersonUrl?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps) {
            this.backIdUrl = '';
            this.frontIdUrl = '';
            this.logoUrl = '';
            this.authLetterUrl = '';
            this.licenseUrl = '';
            this.licenseWithPersonUrl = '';

        }
    }
}

export const keysOfIUserView: string[] = getPropKeys(new UserView(true));
