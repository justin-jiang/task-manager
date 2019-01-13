import { IdentityState } from 'common/responseResults/IdentityState';
import { LogoState } from 'common/responseResults/LogoState';
import { QualificationState } from 'common/responseResults/QualificationState';
import { UserRole } from 'common/UserRole';
import { UserState } from 'common/UserState';
import { UserType } from 'common/UserTypes';
import { CommonObject } from './CommonObject';


export class CommonUser extends CommonObject {
    public name?: string;
    public nickName?: string;
    public email?: string;
    public logoUid?: string;
    public logoState?: LogoState;
    public frontIdUid?: string;
    public frontIdState?: IdentityState;
    public backIdUid?: string;
    public backIdState?: IdentityState;
    public telephone?: string;
    public roles?: UserRole[];
    public type?: UserType;
    public state?: UserState;
    public qualificationUid?: string;
    public qualificationVersion?: number;
    public qualificationState?: QualificationState;
    public realName?: string;
    public sex?: number;
    public address?: string;
    public description?: string;
    public identityNumber?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.backIdState = IdentityState.Missed;
            this.backIdUid = '';
            this.email = '';
            this.frontIdState = IdentityState.Missed;
            this.frontIdUid = '';
            this.logoUid = '';
            this.logoState = LogoState.Missed;
            this.name = '';
            this.nickName = '';
            this.telephone = '';
            this.roles = [];
            this.state = UserState.None;
            this.type = UserType.None;
            this.qualificationUid = '';
            this.qualificationVersion = -1;
            this.qualificationState = QualificationState.Missed;
            this.realName = '';
            this.sex = -1;
            this.address = '';
            this.description = '';
            this.identityNumber = '';
        }
    }
}
