import { IRequestParam } from 'common/requestParams/IRequestParam';

export class TaskDepositImageUploadParam implements IRequestParam {
    // task uid
    public uid?: string;
    public receiptRequired?: number;
}
