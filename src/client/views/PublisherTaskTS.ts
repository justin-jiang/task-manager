import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import { ViewTextUtils } from 'client/common/ViewTextUtils';
import { ComponentUtils } from 'client/components/ComponentUtils';
import DepositDialogVue from 'client/components/DepositDialogVue.vue';
import FileCheckDialogVue from 'client/components/FileCheckDialogVue.vue';
import TaskDetailInTableVue from 'client/components/TaskDetailInTableVue.vue';
import { UsageScenario } from 'client/components/TaskFormTS';
import TaskFormVue from 'client/components/TaskFormVue.vue';
import TaskProgressDialogVue from 'client/components/TaskProgressDialogVue.vue';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileCheckParam } from 'common/requestParams/FileCheckParam';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { TaskApplyCheckParam } from 'common/requestParams/TaskApplyCheckParam';
import { TaskAuditParam } from 'common/requestParams/TaskAuditParam';
import { TaskRemoveParam } from 'common/requestParams/TaskRemoveParam';
import { TaskResultCheckParam } from 'common/requestParams/TaskResultCheckParam';
import { TaskSubmitParam } from 'common/requestParams/TaskSubmitParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { UserView } from 'common/responseResults/UserView';
import { TaskState } from 'common/TaskState';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
export const taskListTabName: string = 'taskListTab';

const compToBeRegistered: any = {
    TaskDetailInTableVue,
    TaskFormVue,
    DepositDialogVue,
    FileCheckDialogVue,
    TaskProgressDialogVue,
};

@Component({
    components: compToBeRegistered,
})
export class PublisherTaskTS extends Vue {

    // #region -- props and methods for Whole Template
    private readonly taskTableName: string = 'taskTable';
    private isInitialized: boolean = false;

    // #endregion

    // #region -- props and methods for task list tab
    private search: string = '';
    private selectedTask: TaskView = {};
    private taskStateRadio: TaskState = TaskState.None;

    private isSearchReady(): boolean {
        return true;
    }
    private taskStateToText(state: TaskState): string {
        return ViewTextUtils.getTaskStateText(state);
    }
    private timestampToText(timestamp: number): string {
        return CommonUtils.convertTimeStampToText(timestamp);
    }

    private get filtredTaskObjs(): TaskView[] {
        let result: TaskView[];
        switch (this.taskStateRadio) {
            case TaskState.Created:
                result = this.toBeSubmittedTasks;
                break;
            case TaskState.InfoPassed:
                result = this.toBeDepositedTasks;
                break;
            case TaskState.ResultAudited:
                result = this.toBePublisherAcceptTasks;
                break;
            case TaskState.ExecutorPaid:
                result = this.completedTasks;
                break;
            default:
                result = this.storeState.taskObjs;
        }
        return result.filter(
            (data: TaskView) => !this.search ||
                (data.name as string).toLowerCase().includes(this.search.toLowerCase())).sort(
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

    /**
     * used to determine whether show the edit, submit and progressquery buttons
     * @param index 
     * @param task 
     */
    private isNotSubmitted(index: number, task: TaskView): boolean {
        return task.state === TaskState.None || task.state === TaskState.Created;
    }

    /**
     * used to determine whether show delete button
     * @param index 
     * @param task 
     */
    private isNotDeposited(index: number, task: TaskView): boolean {
        return task.state === TaskState.None ||
            task.state === TaskState.Created ||
            task.state === TaskState.Submitted;
    }
    /**
     * used to determine whether show deposit button
     */
    private isToBeDeposited(index: number, task: TaskView) {
        return task.state === TaskState.InfoPassed;
    }

    private isTaskResultUploaded(task: TaskView): boolean {
        return task.state === TaskState.ResultUploaded;
    }

    /**
     * on task submit button is clicked
     * @param index 
     * @param task 
     */
    private onSubmit(index: number, task: TaskView): void {
        (async () => {
            const apiResult: ApiResult = await this.store.dispatch(
                StoreActionNames.taskSubmit, {
                    data: { uid: task.uid } as TaskSubmitParam,
                } as IStoreActionArgs);
            if (apiResult.code === ApiResultCode.Success) {
                this.$message.success('提交成功');
            } else {
                this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })();
    }

    private onTaskDelete(index: number, task: TaskView): void {
        const confirm = this.$confirm(
            '确认要删除此任务吗？',
            '提示', {
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            (async () => {
                const apiResult: ApiResult = await this.store.dispatch(
                    StoreActionNames.taskRemove,
                    {
                        data: {
                            uid: task.uid,
                        } as TaskRemoveParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success(`任务删除成功`);
                } else {
                    this.$message.error(`任务删除失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }
    // #endregion

    // #region -- Task Radio buttons references in Task List Tab
    private readonly allTasksLab: TaskState = TaskState.None;
    private get allTasks(): TaskView[] {
        return this.storeState.taskObjs;
    }
    private get allTaskCount(): number {
        return this.allTasks.length;
    }
    private readonly toBeSubmittedTasksLab: TaskState = TaskState.Created;
    private get toBeSubmittedTasks(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.Created;
        });
    }
    private get toBeSubmittedTasksCount(): number {
        return this.toBeSubmittedTasks.length;
    }
    private readonly toBeDepositedTasksLab: TaskState = TaskState.InfoPassed;
    private get toBeDepositedTasks(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.InfoPassed;
        });
    }
    private get toBeDepositedTasksCount(): number {
        return this.toBeDepositedTasks.length;
    }

    private readonly toBePublisherAcceptTasksLab: TaskState = TaskState.ResultAudited;
    private get toBePublisherAcceptTasks(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.ResultAudited;
        });
    }
    private get toBePublisherAcceptTasksCount(): number {
        return this.toBePublisherAcceptTasks.length;
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

    // #region -- reference by task result check dialog
    private taskResultCheckDialogVisible: boolean = false;
    private isTaskResultPassed(index: number, task: TaskView): boolean {
        return task.state === TaskState.ResultAudited;
    }
    private onTaskResultCheck(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.taskResultCheckDialogVisible = true;
    }
    private onTaskResultDownload(): void {
        ComponentUtils.downloadFile(this,
            {
                scenario: FileAPIScenario.DownloadTaskResultFile,
                fileId: this.selectedTask.resultFileUid,
                version: this.selectedTask.resultFileversion,
            } as FileDownloadParam,
            `${this.selectedTask.name}.zip`);
    }
    private onTaskResultCheckSubmit(fileCheckParam: FileCheckParam): void {
        (async () => {
            const store = (this.$store as Store<IStoreState>);
            const apiResult: ApiResult = await store.dispatch(
                StoreActionNames.taskResultCheck,
                {
                    data: {
                        uid: (this.selectedTask as TaskView).uid,
                        auditState: fileCheckParam.state,
                        satisfiedStar: fileCheckParam.star,
                        note: fileCheckParam.note,
                    } as TaskAuditParam,
                } as IStoreActionArgs);
            if (apiResult.code === ApiResultCode.Success) {
                this.$message.success(`提交成功`);
            } else {
                this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })().finally(() => {
            this.taskResultCheckDialogVisible = false;
        });
    }
    private onTaskResultCheckCancelled(): void {
        this.selectedTask = {};
        this.taskResultCheckDialogVisible = false;
    }
    // #endregion

    // #region -- reference by deposit dialog
    private depositDialogVisible: boolean = false;
    private onDeposit(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.depositDialogVisible = true;
    }
    private onDepositCancelled(): void {
        this.selectedTask = {};
        this.depositDialogVisible = false;
    }
    private onDepositSuccess(apiResult: ApiResult): void {
        this.depositDialogVisible = false;
        this.selectedTask = {};
        this.store.commit(StoreMutationNames.taskItemReplace, apiResult.data);
        this.$message.success('提交成功');
    }
    // #endregion

    // #region -- reference by task create or edit dialog
    private taskCreateOrEditDialogVisible: boolean = false;
    private taskCreateOrEditDialogTitle: string = '';
    private usageSenario: UsageScenario = UsageScenario.NONE;
    private onTaskCreate(): void {
        this.selectedTask = {};
        this.usageSenario = UsageScenario.Create;
        this.taskCreateOrEditDialogVisible = true;
    }
    private onTaskEdit(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.usageSenario = UsageScenario.Edit;
        this.taskCreateOrEditDialogVisible = true;
    }
    private onTaskCreateOrEditSuccess(): void {
        this.selectedTask = {};
        this.taskCreateOrEditDialogVisible = false;
    }
    private onTaskCreateOrEditCancelled(): void {
        this.selectedTask = {};
        this.taskCreateOrEditDialogVisible = false;
    }
    // #endregion

    // #region references by progress query dialog
    private taskProgressDialogVisible: boolean = false;
    private onTaskProgressCheck(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.taskProgressDialogVisible = true;
    }
    private onTaskProgressDialogClosed(): void {
        this.selectedTask = {};
        this.taskProgressDialogVisible = false;
    }
    // #endregion

    // #region references by task detail dialog
    private onTaskDetailCheck(index: number, task: TaskView): void {
        (this.$refs[this.taskTableName] as any).toggleRowExpansion(task);
    }
    // #endregion

    // #region -- vue life-circle methods and events
    private mounted(): void {
        this.initialize();
    }
    @Watch('$store.state.sessionInfo', { immediate: true })
    private onSessionInfoChanged(currentValue: UserView, previousValue: UserView) {
        this.initialize();
    }

    // #endregion

    // #region internal prop and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    private initialize() {
        const sessionInfo = this.storeState.sessionInfo;
        if (CommonUtils.isReadyPublisher(sessionInfo)) {
            this.isInitialized = true;
            (async () => {
                // only publisher can see the page
                let apiResult: ApiResult = { code: ApiResultCode.Success };
                // #region -- init for task creation
                // get Template Objs
                apiResult = await this.store.dispatch(StoreActionNames.templateQuery,
                    {
                        notUseLocalData: true,
                    } as IStoreActionArgs);
                if (apiResult.code !== ApiResultCode.Success) {
                    RouterUtils.goToErrorView(this.$router,
                        this.storeState,
                        `获取模板列表失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                    return;
                }
                // #endregion

                // #region -- init for task edit
                apiResult = await this.store.dispatch(StoreActionNames.taskQuery,
                    {
                        notUseLocalData: true,
                    } as IStoreActionArgs);
                if (apiResult.code !== ApiResultCode.Success) {
                    RouterUtils.goToErrorView(this.$router,
                        this.storeState,
                        `获取模任务列表失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                    return;
                }
                // #endregion
            })();
        }
    }
    // #endregion

    // #region -- to be removed
    private onTaskApplyAccepted(index: number, task: TaskView): void {
        const confirm = this.$confirm(
            '确认要接受执行人的申请吗？',
            '提示', {
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            (async () => {
                const apiResult: ApiResult = await this.store.dispatch(
                    StoreActionNames.taskApplyCheck,
                    {
                        data: {
                            uid: task.uid,
                            pass: true,
                        } as TaskApplyCheckParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success(`任务申请接受成功`);
                } else {
                    this.$message.error(`任务申请接受失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }

    private onTaskResultDenied(index: number, task: TaskView): void {
        const confirm = this.$prompt(
            `确认要拒绝此用户的任务结果吗？`,
            '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
                inputType: 'textarea',
                inputPlaceholder: '请输入理由',
                inputPattern: /.+/,
                inputErrorMessage: '请填写拒绝理由',
            });
        confirm.then(({ value }) => {
            (async () => {
                const store = (this.$store as Store<IStoreState>);
                const apiResult: ApiResult = await store.dispatch(
                    StoreActionNames.taskResultCheck,
                    {
                        data: {
                            uid: task.uid,
                            pass: false,
                            note: value,
                        } as TaskResultCheckParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success(`提交成功`);
                } else {
                    this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            })().finally(() => {
                this.taskResultCheckDialogVisible = false;
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }
    private onTaskApplyDenied(index: number, task: TaskView): void {
        const confirm = this.$prompt(
            '请输入拒绝的理由',
            '提示', {
                type: 'warning',
                center: true,
                closeOnClickModal: false,
                inputType: 'textarea',
            });
        confirm.then(({ value }) => {
            (async () => {
                const apiResult: ApiResult = await this.store.dispatch(
                    StoreActionNames.taskApplyCheck,
                    {
                        data: {
                            uid: task.uid,
                            pass: false,
                            note: value,
                        } as TaskApplyCheckParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success(`任务申请拒绝成功`);
                } else {
                    this.$message.error(`任务申请拒绝失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }
    // #endregion

}
