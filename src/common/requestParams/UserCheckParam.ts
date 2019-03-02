import { CheckState } from 'common/CheckState';
import { IRequestParam } from 'common/requestParams/IRequestParam';

export class UserCheckParam implements IRequestParam {
    // user uid
    public uid?: string;
    public qualificationCheckNote?: string;
    public qualificationState?: CheckState;
    public idState?: CheckState;
    public idCheckNote?: string;
    public qualificationStar?: number;
    public qualificationScore?: number;
    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.idCheckNote = '';
            this.idState = CheckState.Missed;
            this.qualificationCheckNote = '';
            this.qualificationState = CheckState.Missed;
            this.uid = '';
            this.qualificationScore = 0;
            this.qualificationStar = 0;
        }
    }
}


