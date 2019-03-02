import { IRequestParam } from 'common/requestParams/IRequestParam';

export class TaskApplyRemoveParam implements IRequestParam {
    // task uid
    public uid?: string;
    public note?: string;
}
