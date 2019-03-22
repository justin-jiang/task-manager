import { NotificationType } from 'common/NotificationType';
import { TaskState } from 'common/TaskState';
import { UserRole } from 'common/UserRole';
import { UserType } from 'common/UserTypes';
import * as moment from 'moment';

export class ViewTextUtils {
    public static getUserRoleText(role: UserRole): string {
        switch (role) {
            case UserRole.CorpExecutor:
                return '企业雇员';
            case UserRole.PersonalExecutor:
                return '个人雇员';
            case UserRole.CorpPublisher:
                return '企业雇主';
            case UserRole.PersonalPublisher:
                return '个人雇主';
            default:
                return '无效';
        }
    }

    public static getUserTypeSelection(): Array<{ label: string, value: number }> {
        const result: Array<{ label: string, value: number }> = [];
        Object.keys(UserType).forEach((item) => {
            if (isNaN(item as any)) {
                const value = UserType[item as any] as any as number;
                switch (value) {
                    case UserType.Corp:
                        result.push({ label: '企业', value: UserType[item as any] as any as number });
                        break;
                    case UserType.Individual:
                        result.push({ label: '个人', value: UserType[item as any] as any as number });
                        break;
                }

            }
        });
        return result;
    }

    public static getTaskStateText(state: TaskState): string {
        switch (state) {
            case TaskState.Created:
                return '待提交';
            case TaskState.Submitted:
            case TaskState.InfoPassed:
                return '待托管';
            case TaskState.DepositUploaded:
                return '待发布';
            case TaskState.ReadyToApply:
                return '待申请';
            case TaskState.Applying:
                return '待投保';
            case TaskState.MarginUploaded:
                return '待受理';
            case TaskState.Assigned:
                return '待交付';
            case TaskState.ResultUploaded:
                return '待审核';
            case TaskState.ResultAudited:
                return '待验收';
            case TaskState.ResultChecked:
                return '待回访';
            case TaskState.PublisherVisited:
                return '待支付';
            case TaskState.ExecutorPaid:
            case TaskState.ReceiptUploaded:
                return '已完结';
            default:
                return '未知';
        }
    }

    public static getTaskStateTextInProgress(state: TaskState): string {
        switch (state) {
            case TaskState.Created:
                return '创建任务';
            case TaskState.Submitted:
                return '任务信息已提交，等待平台审核任';
            case TaskState.InfoPassed:
                return '任务信息已通过审核，等待提交托管金';
            case TaskState.DepositUploaded:
                return '托管金已提交，等待平台审核';
            case TaskState.ReadyToApply:
                return '任务托管成功，等待雇员申请';
            case TaskState.Applying:
                return '已有雇员申请，等待投保';
            case TaskState.MarginUploaded:
                return '雇员资质审核中';
            case TaskState.Assigned:
                return '等待任务交付';
            case TaskState.ResultUploaded:
                return '任务结果审核中';
            case TaskState.ResultAudited:
                return '等待雇主验收';
            case TaskState.ResultChecked:
                return '雇主回访中';
            case TaskState.PublisherVisited:
                return '雇员佣金支付中';
            case TaskState.ExecutorPaid:
                return '发票入账中';
            case TaskState.ReceiptUploaded:
                return '已完结';
            case TaskState.InfoAuditDenied:
                return '任务内容审核被拒绝';
            case TaskState.DepositAuditDenied:
                return '托管资金审核被拒绝';
            case TaskState.ApplyReleased:
                return '任务申请被释放';
            default:
                return '未知';
        }
    }

    public static getNotficationTitle(type: NotificationType): string {
        let title: string = '消息';
        switch (type) {
            case NotificationType.TaskApply:
                title = '任务申请';
                break;
            case NotificationType.TaskApplyAccepted:
                title = '任务申请通过';
                break;
            case NotificationType.TaskApplyDenied:
                title = '任务申请被拒绝';
                break;
            case NotificationType.TaskAuditAccepted:
                title = '任务申请已通过平台审核并提交给发布者';
                break;
            case NotificationType.TaskAuditDenied:
                title = '没有通过平台审核';
                break;
            case NotificationType.TaskResultAccepted:
                title = '任务结果审核通过';
                break;
            case NotificationType.TaskResultDenied:
                title = '任务结果被拒绝';
                break;
            case NotificationType.FrontIdCheckFailure:
            case NotificationType.BackIdCheckFailure:
                title = '用户身份审查被拒绝';
                break;
            case NotificationType.FrontIdCheckPass:
            case NotificationType.BackIdCheckPass:
                title = '用户身份审查通过';
                break;
            case NotificationType.UserLogoCheckFailure:
                title = '用户头像审查被拒绝';
                break;
            case NotificationType.UserLogoCheckPass:
                title = '用户头像审查通过';
                break;
            case NotificationType.UserQualificationCheckFailure:
                title = '资质文件审核被拒绝';
                break;
            case NotificationType.UserQualificationCheckPass:
                title = '资质文件审核通过';
                break;
        }
        return title;
    }

    public static convertTimeStampToDatetime(timestamp: number): string {
        return (moment as any)(timestamp).format('YYYY-MM-DD HH:mm:ss');
    }
    public static convertTimeStampToDate(timestamp: number): string {
        return (moment as any)(timestamp).format('YYYY-MM-DD');
    }
    public static convertTimeStampToTime(timestamp: number): string {
        return (moment as any)(timestamp).format('HH:mm:ss');
    }
}
