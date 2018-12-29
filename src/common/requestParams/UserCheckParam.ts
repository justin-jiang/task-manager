import { IRequestParam } from 'common/requestParams/IRequestParam';

export class UserCheckParam implements IRequestParam {
    // user uid
    public uid?: string;

    public pass?: boolean;
}


