
export class TemplateEditParam {
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
