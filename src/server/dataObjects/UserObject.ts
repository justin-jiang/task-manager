import { UserRole } from 'common/UserRole';
import { CommonUtils } from 'common/CommonUtils';
import { DBObject, IDBObject } from './DBObject';
import { UserState } from 'common/UserState';
export interface IUserObject extends IDBObject {
    name: string;
    email: string;
    password: string;
    logoId: string;
    qualificationId: string;
    qualificationVersion: number;
    type: number;
    telephone: string;
    roles: UserRole[];
    lastLogonTime: number;
    state: UserState;
    nickName: string;
}

export class UserObject extends DBObject implements IUserObject {
    [key: string]: any;
    public name: string;
    public email: string;
    public password: string;
    public logoId: string;
    public qualificationId: string;
    public qualificationVersion: number;
    public type: number;
    public telephone: string;
    public roles: UserRole[];
    public lastLogonTime: number;
    public state: UserState;
    public nickName: string;
    constructor() {
        super();
        this.name = '';
        this.email = '';
        this.password = '';
        this.logoId = '';
        this.qualificationId = '';
        this.qualificationVersion = -1;
        this.type = -1;
        this.telephone = '';
        this.roles = [];
        this.lastLogonTime = 0;
        this.state = UserState.NONE;
        this.nickName = '';
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfIUserObject;
    }
}

export const keysOfIUserObject: string[] = CommonUtils.getPropKeys(new UserObject());
