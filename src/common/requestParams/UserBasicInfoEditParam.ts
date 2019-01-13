import { IRequestParam } from 'common/requestParams/IRequestParam';

export class UserBasicInfoEditParam implements IRequestParam {

    public name?: string;
    public nickName?: string;
    public email?: string;
    public telephone?: string;

    public realName?: string;
    public sex?: number;
    public address?: string;
    public description?: string;
    public identityNumber?: string;

}


