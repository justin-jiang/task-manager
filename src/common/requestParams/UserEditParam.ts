import { IRequestParam } from 'common/requestParams/IRequestParam';
import { UserState } from 'common/UserState';

export class UserEditParam implements IRequestParam {
    public uid: string;
    public state: UserState;
    public nickName: string;
    constructor() {
        this.uid = '';
        this.state = UserState.NONE;
        this.nickName = '';
    }
}


