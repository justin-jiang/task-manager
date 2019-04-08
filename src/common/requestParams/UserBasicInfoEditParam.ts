/**
 * the props of the class NEED the admin audit if they are updated
 */
export class UserBasicInfoEditParam {
    public address?: string;

    public bankAccountName?: string;
    public bankAccountNumber?: string;
    public bankName?: string;

    public city?: string;

    public district?: string;
    public description?: string;

    public linkBankAccountNumber?: string;

    public identityNumber?: string;

    public principalIDNumber?: string;
    public principalName?: string;
    public province?: string;

    public realName?: string;

    public sex?: number;
    constructor(withFullProps?: boolean) {
        if (withFullProps) {
            this.address = '';
            this.bankAccountName = '';
            this.bankAccountNumber = '';
            this.bankName = '';
            this.city = '';
            this.description = '';
            this.district = '';
            this.identityNumber = '';
            this.linkBankAccountNumber = '';
            this.principalIDNumber = '';
            this.principalName = '';
            this.province = '';
            this.realName = '';
            this.sex = -1;
        }
    }
}



