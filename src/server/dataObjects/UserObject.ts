import { UserRole } from 'common/UserRole';
import { CommonUtils } from 'common/CommonUtils';
import { DBObject, IDBObject } from './DBObject';
import { UserState } from 'common/UserState';
interface IUserObject extends IDBObject {
    name?: string;
    email?: string;
    password?: string;
    logoId?: string;
    qualificationId?: string;
    qualificationVersion?: number;
    type?: number;
    telephone?: string;
    roles?: UserRole[];
    lastLogonTime?: number;
    state?: UserState;
    nickName?: string;
}

export class UserObject extends DBObject implements IUserObject {
    [key: string]: any;
    public name?: string;
    public email?: string;
    public password?: string;
    public logoId?: string;
    public qualificationId?: string;
    public qualificationVersion?: number;
    public type?: number;
    public telephone?: string;
    public roles?: UserRole[];
    public lastLogonTime?: number;
    public state?: UserState;
    public nickName?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.email = '';
            this.lastLogonTime = 0;
            this.logoId = '';
            this.name = '';
            this.nickName = '';
            this.password = '';

            this.qualificationId = '';
            this.qualificationVersion = -1;
            this.roles = [];
            this.state = UserState.NONE;
            this.telephone = '';
            this.type = -1;
        }
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfIUserObject;
    }
}

export const keysOfIUserObject: string[] = CommonUtils.getPropKeys(new UserObject(true));
