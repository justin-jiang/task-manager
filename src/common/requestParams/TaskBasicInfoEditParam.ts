import { IRequestParam } from 'common/requestParams/IRequestParam';
import { TaskCreateParam } from './TaskCreateParam';

export class TaskBasicInfoEditParam extends TaskCreateParam implements IRequestParam {
    public uid?: string;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps) {
            this.uid = '';
        }
    }
}
