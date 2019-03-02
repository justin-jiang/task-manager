import { IRequestParam } from 'common/requestParams/IRequestParam';
import { UserType } from 'common/UserTypes';

export class TaskCreateParam implements IRequestParam {
    public address?: string;
    public city?: string;
    public companyContact?: string;
    public companyName?: string;
    public contactPhone?: string;
    public contactEmail?: string;
    public deadline?: number;
    public district?: string;
    public executorTypes?: UserType[];
    public minExecutorStar?: number;
    public name?: string;
    public note?: string;
    public proposedMargin?: number;
    public province?: string;
    public reward?: number;
    public templateFileUid?: string;

    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.address = '';
            this.city = '';
            this.companyContact = '';
            this.companyName = '';
            this.contactEmail = '';
            this.contactPhone = '';
            this.deadline = 0;
            this.district = '';
            this.executorTypes = [];
            this.minExecutorStar = 0;
            this.name = '';
            this.note = '';
            this.proposedMargin = 0;
            this.province = '';
            this.reward = 0;
            this.templateFileUid = '';
        }
    }
}
