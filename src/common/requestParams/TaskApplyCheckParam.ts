import { IRequestParam } from 'common/requestParams/IRequestParam';

export class TaskApplyCheckParam implements IRequestParam {
    // task uid
    public uid?: string;
    public pass?: boolean;
    public note?: string;
}
