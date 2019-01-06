import { IRequestParam } from 'common/requestParams/IRequestParam';
import { FileType } from 'common/FileType';

export class UserCheckParam implements IRequestParam {
    // user uid
    public uid?: string;
    public type?: FileType;

    public pass?: boolean;
}


