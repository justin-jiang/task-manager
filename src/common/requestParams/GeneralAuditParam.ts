import { CheckState } from 'common/CheckState';

export class GeneralAuditParam {
    public state: CheckState = CheckState.Checked;
    // note if it is denied
    public note: string = '';
    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.state = CheckState.Checked;
            this.note = '';
        }
    }
}


