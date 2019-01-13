import { IRequestParam } from 'common/requestParams/IRequestParam';

export class TaskBasicInfoEditParam implements IRequestParam {
    public uid?: string;
    public name?: string;
    public reward?: string;
    public note?: string;
}
