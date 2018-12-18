import { UserRole } from '../CommonTypes';

export interface IUserPostParam {
    [key: string]: string | UserRole[] | undefined;
    name: string;
    email: string;
    password: string;
    telephone: string;
    logoId: string;
    roles: UserRole[];
}
