import { IRequestParam } from 'common/requestParams/IRequestParam';
import { UserRole } from 'common/UserRole';
import { UserType } from 'common/UserTypes';

export class UserCreateParam implements IRequestParam {

    public name?: string;
    public email?: string;
    public password?: string;
    public telephone?: string;
    public roles?: UserRole[];
    public type?: UserType;
}


