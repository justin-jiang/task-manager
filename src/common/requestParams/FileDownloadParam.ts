import { FileAPIScenario } from 'common/FileAPIScenario';
import { IRequestParam } from './IRequestParam';

export class FileDownloadParam implements IRequestParam {
    public fileId?: string;
    public version?: number;
    public metadata?: any;
    public scenario?: FileAPIScenario;
}
