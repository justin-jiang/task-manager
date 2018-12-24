import { CommonUtils } from 'common/CommonUtils';
import { UserRole } from 'common/UserRole';
import { DBObjectView, IDBObjectView } from './DBObjectView';
import { UserType } from 'common/UserTypes';
import { UserState } from 'common/UserState';

export interface IUserView extends IDBObjectView {
    name: string;
    email: string;

    logoId: string;

    telephone: string;
    roles: UserRole[];
    type: UserType;
    state: UserState;
    qualificationId: string;
}

export class UserView extends DBObjectView implements IUserView {
    public name: string;
    public email: string;

    public logoId: string;

    public telephone: string;
    public roles: UserRole[];
    public type: UserType;
    public state: UserState;
    public qualificationId: string;
    constructor() {
        super();
        this.name = '';
        this.email = '';
        this.logoId = '';
        this.telephone = '';
        this.roles = [];
        this.state = UserState.NONE;
        this.type = UserType.None;
        this.qualificationId = '';
    }
    protected getKeysOfDBView(): string[] {
        return keysOfIUserView;
    }
}

export const keysOfIUserView: string[] = CommonUtils.getPropKeys(new UserView());
