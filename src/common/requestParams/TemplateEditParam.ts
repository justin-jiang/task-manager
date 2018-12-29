import { IRequestParam } from 'common/requestParams/IRequestParam';

export class TemplateEditParam implements IRequestParam {
    public uid?: string;
    public name?: string;
    public note?: string;
    constructor() {
    }
}
