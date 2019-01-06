import { IRequestParam } from 'common/requestParams/IRequestParam';

export class UserBasicInfoEditParam implements IRequestParam {

    public name?: string;
    public nickName?: string;
    public email?: string;
    public telephone?: string;
}


