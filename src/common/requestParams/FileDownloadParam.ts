import { FileAPIScenario } from 'common/FileAPIScenario';

export class FileDownloadParam {
    public fileId?: string;

    public metadata?: any;
    public scenario?: FileAPIScenario;

    public version?: number;
    constructor(withFullProps?: boolean) {
        if (withFullProps === true) {
            this.fileId = '';
            this.version = -1;
            this.metadata = null;
            this.scenario = FileAPIScenario.None;
        }
    }
}
