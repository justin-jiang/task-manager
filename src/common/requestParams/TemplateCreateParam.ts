
export class TemplateCreateParam {
    public name?: string;
    public note?: string;
    constructor(withAllProps?: boolean) {
        if (withAllProps) {
            this.name = '';
            this.note = '';
        }
    }
}
