import { IRequestParam } from 'common/requestParams/IRequestParam';

export class TemplateFileEditParam implements IRequestParam {
    public uid: string;
    public version: number;
    constructor() {
        this.uid = '';
        this.version = -1;
    }
}
