import { CheckState } from 'common/CheckState';
import { TaskBasicCommon } from 'common/commonDataObjects/TaskBasicCommon';
export class TaskFullCommon extends TaskBasicCommon {
    public actualMargin?: number;
    public address?: string;
    public adminSatisfiedStar?: number;
    public applicantUid?: string;
    public companyContact?: string;
    public companyName?: string;
    public contactPhone?: string;
    public contactEmail?: string;

    public depositAuditState?: CheckState;
    public depositAuditNote?: string;
    public depositImageUid?: string;
    public depositRefundImageUid?: string;

    public executorAuditState?: number;
    public executorAuditNote?: string;
    public executorReceiptDatetime?: number;
    public executorReceiptImageUid?: string;
    public executorReceiptNote?: string;
    public executorReceiptNumber?: string;
    public executorReceiptRequired?: number;
    public executorUid?: string;

    public infoAuditState?: CheckState;
    public infoAuditNote?: string;

    public marginAditState?: number;
    public marginAuditNote?: string;
    public marginImageUid?: string;
    public marginRefundImageUid?: string;

    public paymentToExecutor?: number;
    public payToExecutorImageUid?: string;
    public publisherUid?: string;
    public publisherReceiptDatetime?: number;
    public publisherReceiptImageUid?: string;
    public publisherReceiptNote?: string;
    public publisherReceiptNumber?: string;
    public publisherReceiptRequired?: number;
    public publisherResultSatisfactionStar?: number;
    public publisherVisitNote?: string;
    public publisherVisitStar?: number;

    public resultTime?: number;
    public resultFileUid?: string;
    public resultFileversion?: number;
    public templateFileUid?: string;

    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.actualMargin = 0;
            this.address = '';
            this.adminSatisfiedStar = 0;
            this.applicantUid = '';

            this.companyContact = '';
            this.companyName = '';
            this.contactEmail = '';
            this.contactPhone = '';

            this.depositAuditNote = '';
            this.depositAuditState = CheckState.NONE;
            this.depositImageUid = '';
            this.depositRefundImageUid = '';

            this.executorAuditState = CheckState.NONE;
            this.executorAuditNote = '';
            this.executorReceiptDatetime = 0;
            this.executorReceiptImageUid = '';
            this.executorReceiptNote = '';
            this.executorReceiptNumber = '';
            this.executorReceiptRequired = 0;
            this.executorUid = '';

            this.infoAuditNote = '';
            this.infoAuditState = CheckState.NONE;

            this.marginAditState = CheckState.NONE;
            this.marginAuditNote = '';
            this.marginImageUid = '';
            this.marginRefundImageUid = '';

            this.paymentToExecutor = 0;
            this.payToExecutorImageUid = '';
            this.publisherReceiptDatetime = 0;
            this.publisherReceiptImageUid = '';
            this.publisherReceiptNote = '';
            this.publisherReceiptNumber = '';
            this.publisherReceiptRequired = 0;
            this.publisherUid = '';
            this.publisherResultSatisfactionStar = 0;
            this.publisherVisitStar = 0;
            this.publisherVisitNote = '';

            this.resultTime = 0;
            this.resultFileUid = '';
            this.resultFileversion = -1;
            this.templateFileUid = '';
        }
    }
}

