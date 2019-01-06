import { CommonUtils } from 'common/CommonUtils';
import { LogoState } from 'common/responseResults/LogoState';
import { QualificationState } from 'common/responseResults/QualificationState';
import { UserRole } from 'common/UserRole';
import { UserState } from 'common/UserState';
import { DBObject } from './DBObject';
export class UserObject extends DBObject {
    [key: string]: any;
    public name?: string;
    public email?: string;
    public password?: string;
    public logoId?: string;
    public logoState?: LogoState;
    public qualificationId?: string;
    public qualificationVersion?: number;
    public qualificationState?: QualificationState;
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
            this.logoState = LogoState.Missed;
            this.name = '';
            this.nickName = '';
            this.password = '';

            this.qualificationId = '';
            this.qualificationVersion = -1;
            this.qualificationState = QualificationState.Missed;
            this.roles = [];
            this.state = UserState.None;
            this.telephone = '';
            this.type = -1;
        }
    }

    protected getKeysOfDBObject(): string[] {
        return keysOfIUserObject;
    }
}

export const keysOfIUserObject: string[] = CommonUtils.getPropKeys(new UserObject(true));
