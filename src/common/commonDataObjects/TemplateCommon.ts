import { CommonObject } from 'common/commonDataObjects/CommonObject';

export class TemplateCommon extends CommonObject {

    public name?: string;
    public version?: number;
    public note?: string;
    public templateFileUid?: string;
    public publisherUid?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.name = '';
            this.note = '';
            this.templateFileUid = '';
            this.version = -1;
            this.publisherUid = '';
        }
    }
}


