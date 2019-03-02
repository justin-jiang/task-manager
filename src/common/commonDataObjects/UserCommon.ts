import { CheckState } from 'common/CheckState';
import { UserRole } from 'common/UserRole';
import { UserState } from 'common/UserState';
import { UserType } from 'common/UserTypes';
import { CommonObject } from './CommonObject';


export class UserCommon extends CommonObject {
    public name?: string;
    public nickName?: string;
    public email?: string;
    public logoUid?: string;
    public logoState?: CheckState;
    public frontIdUid?: string;
    public frontIdState?: CheckState;
    public backIdUid?: string;
    public backIdState?: CheckState;
    public licenseUid?: string;
    public licenseState?: CheckState;
    public licenseWithPersonUid?: string;
    public licenseWidthPersonState?: CheckState;
    public authLetterUid?: string;
    public authLetterState?: CheckState;
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
    public idState?: CheckState;
    public idCheckNote?: string;
    public qualificationCheckNote?: string;
    public principalName?: string;
    public principalIDNumber?: string;

    public publishedTaskCount?: number;
    public executedTaskCount?: number;
    public executorStar?: number;
    public publisherStar?: number;
    public qualificationStar?: number;
    public qualificationScore?: number;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.address = '';
            this.authLetterState = CheckState.Missed;
            this.authLetterUid = '';
            this.backIdState = CheckState.Missed;
            this.backIdUid = '';
            this.city = '';
            this.description = '';
            this.district = '';
            this.email = '';
            this.executedTaskCount = 0;
            this.executorStar = 0;
            this.frontIdState = CheckState.Missed;
            this.frontIdUid = '';
            this.idCheckNote = '';
            this.idState = CheckState.Missed;
            this.identityNumber = '';
            this.licenseState = CheckState.Missed;
            this.licenseUid = '';
            this.licenseWithPersonUid = '';
            this.licenseWidthPersonState = CheckState.Missed;
            this.logoUid = '';
            this.logoState = CheckState.Missed;
            this.name = '';
            this.nickName = '';
            this.principalName = '';
            this.principalIDNumber = '';
            this.province = '';
            this.publishedTaskCount = 0;
            this.publisherStar = 0;
            this.qualificationUid = '';
            this.qualificationVersion = -1;
            this.qualificationState = CheckState.Missed;
            this.qualificationCheckNote = '';
            this.qualificationStar = 0;
            this.qualificationScore = 0;
            this.realName = '';
            this.roles = [];
            this.sex = -1;
            this.state = UserState.None;
            this.telephone = '';
            this.type = UserType.None;
        }
    }
}
