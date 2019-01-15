import { FileAPIScenario } from 'common/FileAPIScenario';
import { IRequestParam } from 'common/requestParams/IRequestParam';
import { TemplateCreateParam } from 'common/requestParams/TemplateCreateParam';
import { TemplateFileEditParam } from 'common/requestParams/TemplateFileEditParam';
import { UserCreateParam } from 'common/requestParams/UserCreateParam';
import { TaskResultFileUploadParam } from './TaskResultFileUploadParam';

export class FileUploadParam implements IRequestParam {
    // NOTE: this value should be JSON stringify before submit
    // otherwize it will be wrongly serialized by file uploader
    public optionData?: TemplateCreateParam |
        UserCreateParam |
        TemplateFileEditParam |
        TaskResultFileUploadParam |
        string;
    public scenario?: FileAPIScenario;
    public blob?: any;
    public fileName?: string;
}
