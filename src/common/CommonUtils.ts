import { CheckState } from 'common/CheckState';
import { UserCommon } from 'common/commonDataObjects/UserCommon';
import { TaskState } from 'common/TaskState';
import { UserRole } from 'common/UserRole';
import { UserType } from 'common/UserTypes';
import * as uuidv4 from 'uuid/v4';
import { TaskView } from 'common/responseResults/TaskView';
export class CommonUtils {
    //#region -- general methods
    public static getUUIDForMongoDB(): string {
        return `M-${(uuidv4 as any)().replace(/-/g, '')}`;
    }

    public static isNullOrEmpty(value: any): boolean {
        if (value == null) {
            return true;
        }
        if (typeof value.trim === 'function' && value.trim() === '') {
            return true;
        }
        return false;
    }
    public static isPrimitiveString(value: any): boolean {
        if (typeof value === 'string') {
            return true;
        } else {
            return false;
        }
    }

    public static getRandomString(length: number): string {
        const passwordChars: string[] = [];
        const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const specialChars = '!@#$%^&';
        const randomSpecialChar: string = specialChars.charAt(Math.floor(Math.random() * specialChars.length));
        for (let i = 0; i < length; i++) {
            passwordChars.push(possibleChars.charAt(Math.floor(Math.random() * possibleChars.length)));
        }

        passwordChars.splice(Math.floor(Math.random() * length), 0, randomSpecialChar);
        return passwordChars.join('');
    }
    //#endregion

    //#region -- task related
    public static getStepTitleByTaskState(expectedState: TaskState, actualState?: TaskState): string {
        switch (expectedState) {
            case TaskState.Submitted:
                return '雇主提交任务';
            case TaskState.DepositUploaded:
                return '雇主完成资金托管';
            case TaskState.ReadyToApply:
                if (actualState == null) {
                    return '平台完成任务审核';
                } else if (expectedState === actualState) {
                    return '平台完成任务审核，任务发布“通过”';
                } else {
                    return '平台完成任务审核，任务发布“拒绝”';
                }
            case TaskState.Applying:
                return '雇员完成任务申请';
            case TaskState.MarginUploaded:
                return '雇员完成保证金缴纳';
            case TaskState.Assigned:
                if (actualState == null) {
                    return '平台方完成任务申请审核';
                } else if (expectedState === actualState) {
                    return '平台方完成任务申请审核，任务委托“通过”';
                } else {
                    return '平台方完成任务申请审核，任务发布“被拒绝”';
                }
            case TaskState.ResultUploaded:
                return '雇员完成尽职调查内容，提交尽调结果';
            case TaskState.ResultAudited:
                if (actualState == null) {
                    return '平台方完成尽调结果审核';
                } else if (expectedState === actualState) {
                    return '平台方完成尽调结果审核，初验“通过”';
                } else {
                    return '平台方完成尽调结果审核，初验“被拒绝”';
                }
            case TaskState.ResultChecked:
                if (actualState == null) {
                    return '雇主完成尽调结果审核';
                } else if (expectedState === actualState) {
                    return '雇主完成尽调结果审核，终验“通过”';
                } else {
                    return '雇主完成尽调结果审核，终验“被拒绝”';
                }
            case TaskState.PublisherVisited:
                return '平台方完成尽调任务回访';
            case TaskState.ExecutorPaid:
                return '平台方完成任务支付，任务完结';

            case TaskState.Created:
                return '雇主创建任务';
            case TaskState.ApplyReleased:
                return '雇员释放任务';
            case TaskState.InfoAuditDenied:
                return '任务信息平台审核：失败';
            case TaskState.DepositAuditDenied:
                return '任务托管资金平台审核：失败';
            case TaskState.DepositRefund:
                return '托管金退款';
            case TaskState.ExecutorAuditDenied:
                return '任务雇员资质平台审核：失败';
            case TaskState.MarginAuditDenied:
                return '任务保证金平台审核：失败';
            case TaskState.MarginRefund:
                return '保证金退款';
            case TaskState.ResultAuditDenied:
                return '任务尽调结果平台审核：失败';
            case TaskState.ResultCheckDenied:
                return '任务尽调结果雇主验收：失败';
            default:
                return '未知步骤';
        }
    }

    public static isTaskCompleted(task: TaskView): boolean {
        return task.state === TaskState.ExecutorPaid;
    }
    //#endregion

    //#region -- user related
    public static isPublisher(user: UserCommon): boolean {
        if (user == null) {
            return false;
        }
        const roles = user.roles;
        if (roles == null || roles.length === 0) {
            return false;
        }
        return this.isPublisherRole(roles);
    }
    public static isPublisherRole(roles: UserRole[]): boolean {
        if (roles == null || roles.length === 0) {
            return false;
        }
        return roles.includes(UserRole.PersonalPublisher) || roles.includes(UserRole.CorpPublisher);
    }
    public static isExecutor(user: UserCommon): boolean {
        if (user == null) {
            return false;
        }
        const roles = user.roles;
        if (roles == null || roles.length === 0) {
            return false;
        }
        return this.isExecutorRole(roles);
    }
    public static isExecutorRole(roles: UserRole[]): boolean {
        if (roles == null || roles.length === 0) {
            return false;
        }
        return roles.includes(UserRole.PersonalExecutor) || roles.includes(UserRole.CorpExecutor);
    }
    public static isAdmin(user: UserCommon): boolean {
        if (user == null) {
            return false;
        }
        const roles = user.roles;
        if (roles == null || roles.length === 0) {
            return false;
        }
        return roles.includes(UserRole.Admin);
    }

    public static isUserReady(user: UserCommon): boolean {
        if (user == null) {
            return false;
        }
        if (this.isAdmin(user)) {
            return true;
        }
        if (!this.isAllRequiredIdsUploaded(user)) {
            return false;
        }
        return user.idState === CheckState.Checked &&
            user.qualificationState === CheckState.Checked;
    }

    public static isReadyExecutor(user: UserCommon): boolean {
        return user != null && this.isExecutor(user) && this.isUserReady(user);
    }

    public static isReadyPublisher(user: UserCommon): boolean {
        return user != null && this.isPublisher(user) && this.isUserReady(user);
    }

    public static isAllRequiredIdsUploaded(userView: UserCommon): boolean {
        if (userView.type === UserType.Individual) {
            return !CommonUtils.isNullOrEmpty(userView.backIdUid) &&
                !CommonUtils.isNullOrEmpty(userView.frontIdUid);
        } else {
            return !CommonUtils.isNullOrEmpty(userView.backIdUid) &&
                !CommonUtils.isNullOrEmpty(userView.frontIdUid) &&
                !CommonUtils.isNullOrEmpty(userView.licenseUid) &&
                !CommonUtils.isNullOrEmpty(userView.licenseWithPersonUid);
        }
    }
    //#endregion
}
