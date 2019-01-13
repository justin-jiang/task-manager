export enum TaskState {
    None = 0,
    ReadyToApply = 1,
    Applying = 2,
    Assigned = 3,
    TaskResultUploaded = 4,
    TaskResultDenied = 5,
    Completed = 10,
    Canceled = 11,

}

export function getTaskStateText(state: TaskState): string {
    switch (state) {
        case TaskState.None:
            return '未设置';
        case TaskState.ReadyToApply:
            return '等待申请';
        case TaskState.Applying:
            return '申请中';
        case TaskState.Assigned:
            return '已指派';
        case TaskState.TaskResultUploaded:
            return '已提交结果';
        case TaskState.Completed:
            return '已完成';
        case TaskState.Canceled:
            return '已取消';
        default:
            return '未知';
    }
}

