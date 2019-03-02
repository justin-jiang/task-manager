import { IRequestParam } from 'common/requestParams/IRequestParam';

export class TaskResultCheckParam implements IRequestParam {
    // task uid
    public uid?: string;
    public pass?: boolean;
    public note?: string;
    public satisfiedStar?: number;
}


