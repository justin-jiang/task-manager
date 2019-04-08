
export class TaskPublisherVisitParam {
    /**
     * NOTE: keep the prop same consistant with TaskObject, because server
     * will read the available props from param according the matched props with the ones in TaskObject
     */
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
