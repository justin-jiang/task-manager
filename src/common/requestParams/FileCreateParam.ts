import { FileAPIScenario } from 'common/FileAPIScenario';
import { IRequestParam } from 'common/requestParams/IRequestParam';
import { TemplateCreateParam } from './TemplateCreateParam';
import { UserCreateParam } from './UserCreateParam';

export class FileCreateParam implements IRequestParam {
    // NOTE: this value should be JSON stringify before submit
    // otherwize it will be wrongly serialized by file uploader
    public metaData?: TemplateCreateParam | UserCreateParam | string;
    public scenario: FileAPIScenario;
    constructor() {
        this.scenario = FileAPIScenario.NONE;
    }
}
