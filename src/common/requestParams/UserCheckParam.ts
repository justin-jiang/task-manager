import { IRequestParam } from 'common/requestParams/IRequestParam';
import { IdentityState } from 'common/responseResults/IdentityState';
import { LogoState } from 'common/responseResults/LogoState';
import { QualificationState } from 'common/responseResults/QualificationState';

export class UserCheckParam implements IRequestParam {
    // user uid
    public uid?: string;
    public noteForLogo?: string;
    public logoState?: LogoState;
    public noteForFrontId?: string;
    public frontIdState?: IdentityState;
    public noteForBackId?: string;
    public backIdState?: IdentityState;
    public noteForQualification?: string;
    public qualitificationState?: QualificationState;
}


