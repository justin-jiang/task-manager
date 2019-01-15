import { CheckState } from 'common/CheckState';
import { UserRole } from 'common/UserRole';
import { UserState } from 'common/UserState';
import { UserType } from 'common/UserTypes';
import { CommonObject } from './CommonObject';


export class CommonUser extends CommonObject {
    public name?: string;
    public nickName?: string;
    public email?: string;
    public logoUid?: string;
    public logoState?: CheckState;
    public frontIdUid?: string;
    public frontIdState?: CheckState;
    public backIdUid?: string;
    public backIdState?: CheckState;
    public telephone?: string;
    public roles?: UserRole[];
    public type?: UserType;
    public state?: UserState;
    public qualificationUid?: string;
    public qualificationVersion?: number;
    public qualificationState?: CheckState;
    public realName?: string;
    public sex?: number;
    public address?: string;
    public description?: string;
    public identityNumber?: string;

    public province?: string;
    public city?: string;
    public district?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.backIdState = CheckState.Missed;
            this.backIdUid = '';
            this.email = '';
            this.frontIdState = CheckState.Missed;
            this.frontIdUid = '';
            this.logoUid = '';
            this.logoState = CheckState.Missed;
            this.name = '';
            this.nickName = '';
            this.telephone = '';
            this.roles = [];
            this.state = UserState.None;
            this.type = UserType.None;
            this.qualificationUid = '';
            this.qualificationVersion = -1;
            this.qualificationState = CheckState.Missed;
            this.realName = '';
            this.sex = -1;
            this.address = '';
            this.description = '';
            this.identityNumber = '';
            this.province = '';
            this.city = '';
            this.district = '';
        }
    }
}
