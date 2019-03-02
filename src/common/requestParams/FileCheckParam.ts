import { CheckState } from 'common/CheckState';
import { IRequestParam } from 'common/requestParams/IRequestParam';

export class FileCheckParam implements IRequestParam {
    public star?: number;
    public state?: CheckState;
    public score?: number;
    public note?: string;
    constructor(withFullProps: boolean) {
        if (withFullProps) {
            this.star = 0;
            this.state = CheckState.NONE;
            this.score = 0;
            this.note = '';
        }
    }
}


