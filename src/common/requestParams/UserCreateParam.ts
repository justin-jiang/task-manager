import { IRequestParam } from 'common/requestParams/IRequestParam';
import { UserRole } from 'common/UserRole';

export class UserCreateParam implements IRequestParam {

    public name?: string;
    public email?: string;
    public password?: string;
    public telephone?: string;
    public roles?: UserRole[];
}


