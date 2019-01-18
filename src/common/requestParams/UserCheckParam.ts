import { IRequestParam } from 'common/requestParams/IRequestParam';
import { CheckState } from 'common/CheckState';

export class UserCheckParam implements IRequestParam {
    // user uid
    public uid?: string;
    public noteForLogo?: string;
    public logoState?: CheckState;
    public noteForFrontId?: string;
    public frontIdState?: CheckState;
    public noteForBackId?: string;
    public backIdState?: CheckState;
    public qualificationCheckNote?: string;
    public qualitificationState?: CheckState;
    public idState?: CheckState;
    public idCheckNote?: string;
}


