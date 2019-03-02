import { IRequestParam } from 'common/requestParams/IRequestParam';

export class TemplateEditParam implements IRequestParam {
    public uid?: string;
    public name?: string;
    public note?: string;
    constructor(withAllProps?: boolean) {
        if (withAllProps) {
            this.uid = '';
            this.name = '';
            this.note = '';
        }
    }
}
