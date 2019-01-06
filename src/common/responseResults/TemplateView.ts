import { CommonUtils } from 'common/CommonUtils';
import { DBObjectView } from './DBObjectView';

export class TemplateView extends DBObjectView {
    public name?: string;
    public note?: string;
    public templateFileUid?: string;
    public version?: number;
    public ownerUid?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps) {
            this.name = '';
            this.note = '';
            this.templateFileUid = '';
            this.version = -1;
            this.ownerUid = '';
        }
    }
}

export const keysOfITemplateView: string[] = CommonUtils.getPropKeys(new TemplateView(true));
