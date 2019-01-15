import { IRequestParam } from 'common/requestParams/IRequestParam';

export class TaskCreateParam implements IRequestParam {
    public name?: string;
    public reward?: string;
    public templateFileUid?: string;
    public note?: string;
    public province?: string;
    public city?: string;
    public district?: string;
    public address?: string;
    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.address = '';
            this.city = '';
            this.district = '';
            this.name = '';
            this.note = '';
            this.province = '';
            this.reward = '';
            this.templateFileUid = '';
        }
    }
}
