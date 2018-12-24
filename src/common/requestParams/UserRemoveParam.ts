import { IRequestParam } from 'common/requestParams/IRequestParam';

export class UserRemoveParam implements IRequestParam {
    public uid: string;

    constructor() {
        this.uid = '';
    }
}


