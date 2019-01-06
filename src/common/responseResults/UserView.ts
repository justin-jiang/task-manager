import { CommonUtils } from 'common/CommonUtils';
import { UserRole } from 'common/UserRole';
import { UserState } from 'common/UserState';
import { UserType } from 'common/UserTypes';
import { DBObjectView } from './DBObjectView';
import { LogoState } from './LogoState';
import { QualificationState } from './QualificationState';


export class UserView extends DBObjectView {
    public name?: string;
    public nickName?: string;
    public email?: string;
    public logoId?: string;
    public logoState?: LogoState;
    public telephone?: string;
    public roles?: UserRole[];
    public type?: UserType;
    public state?: UserState;
    public qualificationId?: string;
    public qualificationVersion?: number;
    public qualificationState?: QualificationState;
    constructor(withFullProps?: boolean) {
        super(withFullProps);
        if (withFullProps === true) {
            this.name = '';
            this.nickName = '';
            this.email = '';
            this.logoId = '';
            this.logoState = LogoState.Missed;
            this.telephone = '';
            this.roles = [];
            this.state = UserState.None;
            this.type = UserType.None;
            this.qualificationId = '';
            this.qualificationVersion = -1;
            this.qualificationState = QualificationState.Missed;
        }
    }
}

export const keysOfIUserView: string[] = CommonUtils.getPropKeys(new UserView(true));
