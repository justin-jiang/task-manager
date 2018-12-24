import { IRequestParam } from 'common/requestParams/IRequestParam';

export class TemplateCreateParam implements IRequestParam {
    public name: string;
    public note: string;
    constructor() {
        this.name = '';
        this.note = '';
    }
}
