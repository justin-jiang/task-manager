import { UserRole } from '../CommonTypes';

export interface IUserView {
    [key: string]: any;
    uid: string;
    name: string;
    email: string;

    logoId: string;

    telephone: string;
    roles: UserRole[];

}

export const keysOfObject: string[] = Object.keys(getBlankIUserView());
export function getBlankIUserView(): IUserView {
    const inst: IUserView = {
        name: '',
        email: '',
        password: '',
        logoId: '',
        telephone: '',
        roles: [],
        uid: '',
    };
    return inst;
}
