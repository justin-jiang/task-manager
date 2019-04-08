import { IRequestParam } from 'common/requestParams/IRequestParam';

export class UserPasswordEditParam implements IRequestParam {
    public oldPassword?: string;

    public newPassword?: string;
}


