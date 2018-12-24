import { FileAPIScenario } from 'common/FileAPIScenario';
import { IRequestParam } from 'common/requestParams/IRequestParam';
import { TemplateFileEditParam } from 'common/requestParams/TemplateFileEditParam';

export class FileEditParam implements IRequestParam {
    public metaData?: TemplateFileEditParam  | string;
    public scenario: FileAPIScenario;
    constructor() {
        this.scenario = FileAPIScenario.NONE;
    }
}
