import { IRequestParam } from 'common/requestParams/IRequestParam';


export class SessionCreateParam implements IRequestParam {
    [key: string]: string;
    public name: string;
    public password: string;
    constructor(name?: string, password?: string) {
        this.name = name || '';
        this.password = password || '';
    }

}
