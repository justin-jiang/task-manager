import { CommonUtils } from 'common/CommonUtils';
import { DBObjectView, IDBObjectView } from './DBObjectView';

interface ITemplateView extends IDBObjectView {
    name?: string;
    note?: string;
    templateFileId?: string;
    version?: number;
}

export class TemplateView extends DBObjectView implements ITemplateView {
    public name?: string;
    public note?: string;
    public templateFileId?: string;
    public version?: number;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps) {
            this.name = '';
            this.note = '';
            this.templateFileId = '';
            this.version = -1;
        }
    }
    protected getKeysOfDBView(): string[] {
        return keysOfITemplateView;
    }
}

export const keysOfITemplateView: string[] = CommonUtils.getPropKeys(new TemplateView(true));
