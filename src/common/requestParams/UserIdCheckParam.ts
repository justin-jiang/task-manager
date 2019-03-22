import { CheckState } from 'common/CheckState';

export class UserIdCheckParam {
    // user uid
    public uid?: string;

    public idState?: CheckState;
    public idCheckNote?: string;

    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.idCheckNote = '';
            this.idState = CheckState.Missed;
            this.uid = '';
        }
    }
}


