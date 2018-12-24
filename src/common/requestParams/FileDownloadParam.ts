import { FileAPIScenario } from 'common/FileAPIScenario';
import { IRequestParam } from './IRequestParam';

export class FileDownloadParam implements IRequestParam {
    public fileId: string;
    public version: number;
    public metaData?: any;
    public scenario: FileAPIScenario;
    constructor() {
        this.fileId = '';
        this.version = -1;
        this.metaData = '';
        this.scenario = FileAPIScenario.NONE;

    }
}
