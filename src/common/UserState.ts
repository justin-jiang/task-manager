import { UserView } from './responseResults/UserView';
import { LogoState } from './responseResults/LogoState';
import { QualificationState } from './responseResults/QualificationState';

export enum UserState {
    None = 0,
    Enabled = 1,
    Disabled = 2,
}

export function getUserStateText(userView: UserView): string {
    const states: string[] = [];
    if (userView.logoState === LogoState.Missed) {
        states.push('头像缺失');
    } else if (userView.logoState === LogoState.FailedToCheck) {
        states.push('头像审核失败');
    } else if (userView.logoState === LogoState.ToBeChecked) {
        states.push('头像待审核');
    }
    if (userView.qualificationState === QualificationState.Missed) {
        states.push('资质文件缺失');
    } else if (userView.qualificationState === QualificationState.FailedToCheck) {
        states.push('资质文件审核失败');
    } else if (userView.qualificationState === QualificationState.ToBeChecked) {
        states.push('资质文件待审核');
    }

    if (states.length === 0) {
        switch (userView.state) {
            case UserState.None:
                return '未设置';
            case UserState.Enabled:
                return '启用';
            case UserState.Disabled:
                return '禁用';
            default:
                return '错误状态';
        }
    } else {
        return states.join(',');
    }
}
