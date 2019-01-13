
export class CommonObject {
    [key: string]: any;
    public uid?: string;
    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.uid = '';
        }
    }
}
