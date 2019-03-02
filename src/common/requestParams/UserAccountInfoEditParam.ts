import { IRequestParam } from 'common/requestParams/IRequestParam';

/**
 * the props of the class don't need the admin audit if they are updated
 */
export class UserAccountInfoEditParam implements IRequestParam {

    public nickName?: string;
    public email?: string;
    public telephone?: string;


    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.email = '';
            this.nickName = '';
            this.telephone = '';
        }
    }
}



