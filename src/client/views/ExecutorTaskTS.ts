import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { RouterUtils } from 'client/common/RouterUtils';
import { ViewTextUtils } from 'client/common/ViewTextUtils';
import MarginDialogVue from 'client/components/MarginDialogVue.vue';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import TaskDetailInTableVue from 'client/components/TaskDetailInTableVue.vue';
import TaskProgressDialogVue from 'client/components/TaskProgressDialogVue.vue';
import TaskResultUploadDialogVue from 'client/components/TaskResultUploadDialogVue.vue';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { locations } from 'common/Locations';
import { TaskApplyParam } from 'common/requestParams/TaskApplyParam';
import { TaskApplyRemoveParam } from 'common/requestParams/TaskApplyRemoveParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { UserView } from 'common/responseResults/UserView';
import { TaskState } from 'common/TaskState';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
const compToBeRegistered: any = {
    SingleFileUploadVue,
    TaskDetailInTableVue,
    MarginDialogVue,
    TaskProgressDialogVue,
    TaskResultUploadDialogVue,
};

@Component({
    components: compToBeRegistered,
})
export class ExecutorTaskTS extends Vue {
    // #region -- reference by template
    private readonly readyToApplyTaskTabName: string = 'readyToApplyTaskTab';
    private isInitialized: boolean = false;
    private activeTabName: string = this.readyToApplyTaskTabName;
    // #endregion

    // #region -- references by query and sort conditions of ready-to-apply task
    private provinceFilter: string[] = [];
    private publishTimeFilter: number | null = null;
    private startRewardFilter: number = 0;
    private endRewardFilter: number = Number.MAX_VALUE;
    private rewardFilter: number | null = null;
    private publishTimeSortField: number = 0;
    private deadlineSortField: number = 1;
    private rewardSortField: number = 2;
    private depositSortField: number = 3;
    private sortFieldRadio: number = this.publishTimeSortField;

    private get provinces(): string[] {
        const provinces: string[] = [];
        for (const item of locations) {
            provinces.push(item.name);
        }
        return provinces;
    }
    private get publishTimes(): Array<{ label: string, value: number }> {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const withinThreeDays = startOfDay - 3 * 24 * 3600 * 1000;
        const withinSevenDays = startOfDay - 7 * 24 * 3600 * 1000;
        const withinOneMonth = startOfDay - 30 * 24 * 3600 * 1000;

        return [
            { label: '今日', value: startOfDay },
            { label: '3日以内', value: withinThreeDays },
            { label: '一周以内', value: withinSevenDays },
            { label: '一月以内', value: withinOneMonth },
        ];
    }
    private get rewards(): Array<{ label: string, value: number }> {
        return [
            { label: '1000以下', value: 0 },
            { label: '1000-5000', value: 1 },
            { label: '5000-10000', value: 2 },
            { label: '10000-50000', value: 3 },
            { label: '50000以上', value: 4 },
        ];
    }
    private onRewardChanged(value: number): void {
        switch (value) {
            case 0:
                this.endRewardFilter = 1000;
                break;
            case 1:
                this.startRewardFilter = 1000;
                this.endRewardFilter = 5000;
                break;
            case 2:
                this.startRewardFilter = 5000;
                this.endRewardFilter = 10000;
                break;
            case 3:
                this.startRewardFilter = 10000;
                this.endRewardFilter = 50000;
                break;
            case 4:
                this.startRewardFilter = 50000;
                this.endRewardFilter = Number.MAX_VALUE;
                break;

        }
    }
    private onRewardCleared(value: number): void {
        this.startRewardFilter = 0;
        this.endRewardFilter = Number.MAX_VALUE;
    }
    private onTaskSearchSubmit(): void {

    }
    // #endregion

    // #region -- reference by ready-to-apply task List
    private get readyToApplyTaskObjs(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            let isMatched: boolean = true;
            if (item.state !== TaskState.ReadyToApply) {
                isMatched = false;
            }
            if (this.provinceFilter.length > 0 && !this.provinceFilter.includes(item.province as string)) {
                isMatched = false;
            }
            if (!CommonUtils.isNullOrEmpty(this.publishTimeFilter) &&
                !CommonUtils.isNullOrEmpty(item.publishTime) &&
                (item.publishTime as number) < (this.publishTimeFilter as number)) {
                isMatched = false;
            }
            if (this.startRewardFilter > (item.reward as number) || this.endRewardFilter < (item.reward as number)) {
                isMatched = false;
            }
            return isMatched;
        }).sort((a: TaskView, b: TaskView) => {
            let valueOfA: number = 0;
            let valueOfB: number = 0;
            switch (this.sortFieldRadio) {
                case this.publishTimeSortField:
                    valueOfA = a.publishTime as number || 0;
                    valueOfB = b.publishTime as number || 0;
                    break;
                case this.deadlineSortField:
                    valueOfA = a.deadline as number || 0;
                    valueOfB = b.deadline as number || 0;
                    break;
                case this.rewardSortField:
                    valueOfA = a.reward as number || 0;
                    valueOfB = b.reward as number || 0;
                    break;
            }
            return valueOfB - valueOfA;
        });
    }
    private deadlineToText(timestamp: number): string {
        return ViewTextUtils.convertTimeStampToDate(timestamp);
    }
    private onTaskApply(task: TaskView) {
        const confirm = this.$confirm(
            '确认要申请此任务吗？',
            '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            (async () => {
                const store = (this.$store as Store<IStoreState>);
                const apiResult: ApiResult = await store.dispatch(
                    StoreActionNames.taskApply,
                    {
                        data: {
                            uid: task.uid,
                        } as TaskApplyParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success('提交成功');
                } else {
                    this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            })();
        }).catch(() => {
            // do nothing for cancel
        });
    }
    // #endregion


    // #region -- referenced by Task Radio buttons for applied Task List
    private readonly allTasksLab: TaskState = TaskState.None;
    private get allTasks(): TaskView[] {
        return this.storeState.taskObjs;
    }
    private get allTaskCount(): number {
        return this.allTasks.length;
    }

    private readonly toBeInsuredTasksLab: TaskState = TaskState.Applying;
    private get toBeInsuredTasks(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.Applying;
        });
    }
    private get toBeInsuredTasksCount(): number {
        return this.toBeInsuredTasks.length;
    }

    private readonly toBeSubmitResultTasksLab: TaskState = TaskState.Assigned;
    private get toBeSubmitResultTasks(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.Assigned;
        });
    }
    private get toBeSubmitResultTasksCount(): number {
        return this.toBeSubmitResultTasks.length;
    }

    private readonly completedTasksLab: TaskState = TaskState.ExecutorPaid;
    private get completedTasks(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.ExecutorPaid;
        });
    }
    private get completedTasksCount(): number {
        return this.completedTasks.length;
    }
    // #endregion


    // #region -- referenced applied Task Table
    private readonly appliedTaskTableName: string = 'appliedTaskTable';
    private readonly appliedTaskTabName: string = 'appliedTaskTab';

    private marginDialogVisible: boolean = false;
    private taskResultDialogVisible: boolean = false;
    private taskProgressDialogVisible: boolean = false;
    private appliedTaskSearch: string = '';


    private selectedTask: TaskView = {};

    private taskStateRadio: TaskState = TaskState.None;

    private get filteredappliedTaskObjs(): TaskView[] {
        let result: TaskView[];
        switch (this.taskStateRadio) {
            case TaskState.Applying:
                result = this.toBeInsuredTasks;
                break;
            case TaskState.Assigned:
                result = this.toBeSubmitResultTasks;
                break;
            case TaskState.ExecutorPaid:
                result = this.completedTasks;
                break;
            default:
                result = this.storeState.taskObjs.filter((item) => {
                    return (item.state as TaskState) > TaskState.ReadyToApply;
                });
        }
        return result.filter(
            (data: TaskView) => !this.appliedTaskSearch ||
                (data.name as string).toLowerCase().includes(this.appliedTaskSearch.toLowerCase())).sort(
                    (a: TaskView, b: TaskView) => {
                        if (a.createTime == null) {
                            // a is behind of b
                            return 1;
                        }
                        if (b.createTime == null) {
                            // a is ahead of b
                            return -1;
                        }
                        // if a.createTime is bigger than b.createTime, a is ahead of b
                        return b.createTime - a.createTime;
                    });
    }
    private isSearchReady(): boolean {
        return true;
    }

    private taskStateToText(state: TaskState): string {
        return ViewTextUtils.getTaskStateText(state);
    }
    private timestampToText(timestamp: number): string {
        return ViewTextUtils.convertTimeStampToDatetime(timestamp);
    }
    private isTaskApplying(index: number, task: TaskView): boolean {
        return task.state === TaskState.Applying;
    }
    private isTaskAssigned(index: number, task: TaskView): boolean {
        return task.state === TaskState.Assigned;
    }
    private onRowClick(task: TaskView, column: any): void {
        (this.$refs[this.appliedTaskTableName] as any).toggleRowExpansion(task);
    }
    private onSelectTaskResultUpload(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.taskResultDialogVisible = true;
    }
    private onApplyingReleased(index: number, task: TaskView): void {
        const confirm = this.$confirm(
            '确认要释放此任务吗？',
            '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            (async () => {
                const store = (this.$store as Store<IStoreState>);
                const apiResult: ApiResult = await store.dispatch(
                    StoreActionNames.taskApplyRemove,
                    {
                        data: {
                            uid: task.uid,
                        } as TaskApplyRemoveParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success(`提交成功`);
                } else {
                    this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            })();
        }).catch(() => {
            // do nothing for cancel
        });
    }

    private onTaskResultCancel(): void {
        this.taskResultDialogVisible = false;
    }
    private onTaskResultUploadSuccess(apiResult: ApiResult): void {
        this.$message.success('任务结果文件上传成功');
        this.store.commit(StoreMutationNames.taskItemReplace, apiResult.data);
        this.taskResultDialogVisible = false;
    }

    private onMarginUpload(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.marginDialogVisible = true;
    }
    private onMarginUploadCancelled(): void {
        this.marginDialogVisible = false;
    }
    private onMarginUploadSuccess(apiResult: ApiResult): void {
        this.$message.success('保证金凭证上传成功');
        this.store.commit(StoreMutationNames.taskItemReplace, apiResult.data);
        this.marginDialogVisible = false;
    }

    private onTaskProgressCheck(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.taskProgressDialogVisible = true;
    }
    private onTaskProgressDialogClosed(): void {
        this.selectedTask = {};
        this.taskProgressDialogVisible = false;
    }

    private onTaskDetailCheck(index: number, task: TaskView): void {
        (this.$refs[this.appliedTaskTableName] as any).toggleRowExpansion(task);
    }
    // #endregion


    // #region -- vue life-circle methods
    private mounted(): void {
        this.initialize();
    }

    // #endregion

    // #region internal prop and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);

    @Watch('$store.state.sessionInfo', { immediate: true })
    private onSessionInfoChanged(currentValue: UserView, previousValue: UserView) {
        const sessionInfo = currentValue;
        this.initialize();

    }
    private initialize() {
        const sessionInfo = this.storeState.sessionInfo;
        if (CommonUtils.isReadyExecutor(sessionInfo) && this.isInitialized === false) {
            (async () => {
                this.isInitialized = true;
                const apiResult = await this.store.dispatch(StoreActionNames.taskQuery,
                    {
                        notUseLocalData: true,
                    } as IStoreActionArgs);
                if (apiResult.code !== ApiResultCode.Success) {
                    RouterUtils.goToErrorView(this.$router,
                        this.storeState,
                        `获取任务列表失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                    return;
                }
            })();
        }
    }

    // #endregion

}
