import { IRequestParam } from 'common/requestParams/IRequestParam';

export class TaskPublisherVisitParam implements IRequestParam {
    // task uid
    public uid?: string;
    public publisherVisitStar?: number;
    public publisherVisitNote?: string;
    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.uid = '';
            this.publisherVisitStar = 0;
            this.publisherVisitNote = '';
        }
    }
}
