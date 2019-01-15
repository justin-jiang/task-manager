import { IRequestParam } from 'common/requestParams/IRequestParam';

export class UserBasicInfoEditParam implements IRequestParam {

    public name?: string;
    public nickName?: string;
    public email?: string;
    public telephone?: string;

    public realName?: string;
    public sex?: number;
    public address?: string;
    public description?: string;
    public identityNumber?: string;

    public province?: string;
    public city?: string;
    public district?: string;
    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.address = '';
            this.city = '';
            this.description = '';
            this.district = '';
            this.email = '';
            this.identityNumber = '';
            this.name = '';
            this.nickName = '';
            this.province = '';
            this.realName = '';
            this.sex = -1;
            this.telephone = '';
        }
    }
}



