import { IRequestParam } from './IRequestParam';

export class FileRemoveParam implements IRequestParam {
    public fileId: string;
    public version: number;

    constructor() {
        this.fileId = '';
        this.version = -1;
    }
}
