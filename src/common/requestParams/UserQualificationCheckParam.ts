import { CheckState } from 'common/CheckState';

export class UserQualificationCheckParam {
    // user uid
    public uid?: string;
    public qualificationCheckNote?: string;
    public qualificationState?: CheckState;
    public qualificationStar?: number;
    public qualificationScore?: number;
    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.qualificationCheckNote = '';
            this.qualificationState = CheckState.Missed;
            this.uid = '';
            this.qualificationScore = 0;
            this.qualificationStar = 0;
        }
    }
}


