export enum TaskState {
    None = 0,
    Created = 1,
    ReadyToApply = 2,
    Applying = 3,
    ReadyToAssign = 4,
    Assigned = 5,
    ResultUploaded = 6,
    ResultDenied = 7,
    Completed = 10,
    Canceled = 11,
    AuditDenied = 12,
    ApplyAuditDenied = 13,
}

export function getTaskStateText(state: TaskState): string {
    switch (state) {
        case TaskState.None:
            return '未设置';
        case TaskState.Created:
            return '已创建';
        case TaskState.ReadyToApply:
            return '等待申请';
        case TaskState.Applying:
            return '申请中';
        case TaskState.ReadyToAssign:
            return '可指派';
        case TaskState.Assigned:
            return '已指派';
        case TaskState.ResultUploaded:
            return '已提交结果';
        case TaskState.ResultDenied:
            return '拒绝结果';
        case TaskState.Completed:
            return '已完成';
        case TaskState.Canceled:
            return '已取消';
        case TaskState.AuditDenied:
            return '拒绝发布';
        default:
            return '未知';
    }
}

