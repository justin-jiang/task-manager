import { IRequestParam } from 'common/requestParams/IRequestParam';

export class TemplateRemoveParam implements IRequestParam {
    public uid: string;
    public templateFileId: string;
    constructor() {
        this.uid = '';
        this.templateFileId = '';
    }
}
