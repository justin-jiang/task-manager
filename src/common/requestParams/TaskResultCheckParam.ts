import { IRequestParam } from 'common/requestParams/IRequestParam';
import { FileType } from 'common/FileType';

export class TaskResultCheckParam implements IRequestParam {
    // task uid
    public uid?: string;

    public pass?: boolean;
    public note?: string;
}


