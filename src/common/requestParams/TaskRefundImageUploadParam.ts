import { RefundScenario } from 'common/RefundScenario';

export class TaskRefundImageUploadParam {
    // task uid
    public uid?: string;
    public scenario?: RefundScenario;
    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.uid = '';
            this.scenario = RefundScenario.None;
        }
    }
}
