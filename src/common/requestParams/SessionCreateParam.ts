import { IRequestParam } from 'common/requestParams/IRequestParam';

export class SessionCreateParam implements IRequestParam {
    public name?: string;
    public password?: string;

}
