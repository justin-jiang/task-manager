import { IRequestParam } from 'common/requestParams/IRequestParam';

export class TaskCreateParam implements IRequestParam {
    public name?: string;
    public reward?: string;
    public templateFileId?: string;
    public note?: string;
}
