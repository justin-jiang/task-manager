import { IRequestParam } from 'common/requestParams/IRequestParam';
/**
 * the props of the class NEED the admin audit if they are updated
 */
export class UserBasicInfoEditParam implements IRequestParam {
    public realName?: string;
    public sex?: number;
    public address?: string;
    public description?: string;
    public identityNumber?: string;

    public province?: string;
    public city?: string;
    public district?: string;
    public principalName?: string;
    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.address = '';
            this.city = '';
            this.description = '';
            this.district = '';
            this.identityNumber = '';
            this.principalName = '';
            this.province = '';
            this.realName = '';
            this.sex = -1;
        }
    }
}



