/**
 * the props of the class don't need the admin audit if they are updated
 */
export class UserAccountInfoEditParam {
    public email?: string;
    public nickName?: string;
    public telephone?: string;

    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.email = '';
            this.nickName = '';
            this.telephone = '';
        }
    }
}



