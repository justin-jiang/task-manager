import { TaskBasicCommon } from 'common/commonDataObjects/TaskBasicCommon';
export class TaskFullCommon extends TaskBasicCommon {
    public address?: string;
    public adminSatisfiedStar?: number;
    public applicantUid?: string;
    public companyContact?: string;
    public companyName?: string;
    public contactPhone?: string;
    public contactEmail?: string;
    // the fund from publisher
    public depositImageUid?: string;
    public executorUid?: string;
    // the fund from executor
    public marginImageUid?: string;
    public publisherUid?: string;
    public publisherResultSatisfactionStar?: number;
    public publisherVisitNote?: string;
    public publisherVisitStar?: number;
    public receiptRequired?: number;
    public resultTime?: number;
    public resultFileUid?: string;
    public resultFileversion?: number;
    public templateFileUid?: string;

    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.address = '';
            this.adminSatisfiedStar = 0;
            this.applicantUid = '';
            this.companyContact = '';
            this.companyName = '';
            this.contactEmail = '';
            this.contactPhone = '';
            this.depositImageUid = '';
            this.executorUid = '';
            this.marginImageUid = '';
            this.publisherUid = '';
            this.publisherResultSatisfactionStar = 0;
            this.publisherVisitStar = 0;
            this.publisherVisitNote = '';
            this.receiptRequired = 0;
            this.resultTime = 0;
            this.resultFileUid = '';
            this.resultFileversion = -1;
            this.templateFileUid = '';
        }
    }
}

