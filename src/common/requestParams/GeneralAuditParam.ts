import { CheckState } from 'common/CheckState';
import { IRequestParam } from 'common/requestParams/IRequestParam';

export class GeneralAuditParam implements IRequestParam {
    public state: CheckState = CheckState.Checked;
    public note: string = '';
    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.state = CheckState.Checked;
            this.note = '';
        }
    }
}


