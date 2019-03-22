import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { StoreUtils } from 'client/common/StoreUtils';
import { ViewTextUtils } from 'client/common/ViewTextUtils';
import AuditDialogVue from 'client/components/AuditDialogVue.vue';
import AvatarWithNameVue from 'client/components/AvatarWithNameVue.vue';
import { ComponentUtils } from 'client/components/ComponentUtils';
import FileCheckDialogVue from 'client/components/FileCheckDialogVue.vue';
import PayToExecutorDialogVue from 'client/components/PayToExecutorDialogVue.vue';
import PublisherVisitDialogVue from 'client/components/PublisherVisitDialogVue.vue';
import ReceiptUploadDialogVue from 'client/components/ReceiptUploadDialogVue.vue';
import TaskApplyCheckDialogVue from 'client/components/TaskApplyCheckDialogVue.vue';
import TaskDetailInTableVue from 'client/components/TaskDetailInTableVue.vue';
import TaskFormVue from 'client/components/TaskFormVue.vue';
import TaskProgressDialogVue from 'client/components/TaskProgressDialogVue.vue';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { StoreMutationNames } from 'client/VuexOperations/StoreMutationNames';
import { CheckState } from 'common/CheckState';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileCheckParam } from 'common/requestParams/FileCheckParam';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { GeneralAuditParam } from 'common/requestParams/GeneralAuditParam';
import { TaskAuditParam } from 'common/requestParams/TaskAuditParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { UserView } from 'common/responseResults/UserView';
import { TaskState } from 'common/TaskState';
import Viewer from 'viewerjs';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { RefundScenario } from 'common/RefundScenario';
import RefundDialogVue from 'client/components/RefundDialogVue.vue';
const compToBeRegistered: any = {

    AvatarWithNameVue,
    AuditDialogVue,

    FileCheckDialogVue,

    PayToExecutorDialogVue,
    ReceiptUploadDialogVue,
    PublisherVisitDialogVue,

    RefundDialogVue,

    TaskApplyCheckDialogVue,
    TaskDetailInTableVue,
    TaskProgressDialogVue,
    TaskFormVue,

};

@Component({
    components: compToBeRegistered,
})
export class AdminTaskTS extends Vue {
    // #region -- reference by Template
    private readonly taskTableName: string = 'taskTable';
    private readonly switchActiveValue: CheckState = CheckState.Checked;
    private readonly switchInactiveValue: CheckState = CheckState.FailedToCheck;
    private isInitialized: boolean = false;
    private selectedTask: TaskView = {};
    private imageViewer: Viewer | null = null;
    // #endregion

    // #region -- reference by task state radio button group
    private taskStateRadio: TaskState = TaskState.None;
    private readonly allTasksLab: TaskState = TaskState.None;

    private readonly toBeAuditInfoLab: TaskState = TaskState.Submitted;
    private readonly toBeAuditDepositLab: TaskState = TaskState.DepositUploaded;
    private readonly toBeAuditApplyLab: TaskState = TaskState.Applying;
    private readonly toBeAuditResultLab: TaskState = TaskState.ResultUploaded;

    private readonly toBePublisherVistLab: TaskState = TaskState.ResultChecked;

    private readonly toBePaiedLab: TaskState = TaskState.PublisherVisited;

    private readonly completedLab: TaskState = TaskState.ExecutorPaid;

    private get allTasks(): TaskView[] {
        return this.storeState.taskObjs;
    }
    private get allTaskCount(): number {
        return this.allTasks.length;
    }


    private get toBeAuditDeposits(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.DepositUploaded;
        });
    }
    private get toBeAuditDepositsCount(): number {
        return this.toBeAuditDeposits.length;
    }


    private get toBeAuditApplies(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.Applying || item.state === TaskState.MarginUploaded;
        });
    }
    private get toBeAuditApplyCount(): number {
        return this.toBeAuditApplies.length;
    }


    private get toBeAuditResults(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.ResultUploaded;
        });
    }
    private get toBeAuditResultCount(): number {
        return this.toBeAuditResults.length;
    }


    private get toBePublisherVists(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.ResultChecked;
        });
    }
    private get toBePublisherVistCount(): number {
        return this.toBePublisherVists.length;
    }


    private get toBePaiedTasks(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.PublisherVisited;
        });
    }
    private get toBePaiedTasksCount(): number {
        return this.toBePaiedTasks.length;
    }

    private get completedTasks(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === this.completedLab;
        });
    }
    private get completedTasksCount(): number {
        return this.completedTasks.length;
    }
    // #endregion

    // #region -- references by task tables
    private search: string = '';
    private isSearchReady(): boolean {
        return true;
    }
    /**
     * the data used by task table
     */
    private get filteredTaskObjs(): TaskView[] {
        let result: TaskView[] = [];
        switch (this.taskStateRadio) {
            case TaskState.None:
                result = this.allTasks;
                break;
            case TaskState.DepositUploaded:
                result = this.toBeAuditDeposits;
                break;

            case TaskState.Applying:
            case TaskState.MarginUploaded:
                result = this.toBeAuditApplies;
                break;

            case TaskState.ResultUploaded:
                result = this.toBeAuditResults;
                break;

            case TaskState.ResultChecked:
                result = this.toBePublisherVists;
                break;
            case TaskState.PublisherVisited:
                result = this.toBePaiedTasks;
                break;
            case TaskState.ExecutorPaid:
            case TaskState.ReceiptUploaded:
                result = this.completedTasks;
                break;
            default:
                this.$message.error(`任务状态（${this.taskStateRadio}）未支持`);
                break;

        }
        return result.filter(
            (data: TaskView) => !this.search ||
                (data.name as string).toLowerCase().includes(this.search.toLowerCase()));
    }
    private taskStateToText(state: TaskState): string {
        return ViewTextUtils.getTaskStateText(state);
    }
    private timestampToText(timestamp: number): string {
        return ViewTextUtils.convertTimeStampToDatetime(timestamp);
    }
    /**
     * used to determine whether show the edit, submit and progressquery buttons
     * @param index 
     * @param task 
     */
    private isNotSubmitted(index: number, task: TaskView): boolean {
        return task.state === TaskState.None || task.state === TaskState.Created;
    }

    private onRowClick(task: TaskView, column: any): void {
        (this.$refs[this.taskTableName] as any).toggleRowExpansion(task);
    }
    // #endregion

    // #region -- reference for task progress check
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

    // #region -- references by task detail component
    private onTaskDetailCheck(index: number, task: TaskView): void {
        (this.$refs[this.taskTableName] as any).toggleRowExpansion(task);
    }
    // #endregion

    //#region -- reference by task info audit
    private infoAuditDialogVisible: boolean = false;

    private isInfoReadyToBeAudited(index: number, task: TaskView): boolean {
        return task.state === TaskState.DepositUploaded &&
            (task.infoAuditState == null || task.infoAuditState !== CheckState.Checked);
    }
    private onInfoAudit(index: number, task: TaskView): void {
        this.selectedTask = task;
        (this.$refs[this.taskTableName] as any).toggleRowExpansion(task, true);
        this.infoAuditDialogVisible = true;
    }
    private onInfoAuditSubmit(auditResult: GeneralAuditParam): void {
        (async () => {
            const store = (this.$store as Store<IStoreState>);
            const apiResult: ApiResult = await store.dispatch(
                StoreActionNames.taskInfoAudit,
                {
                    data: {
                        uid: this.selectedTask.uid,
                        auditState: auditResult.state,
                        note: auditResult.note,
                    } as TaskAuditParam,
                } as IStoreActionArgs);
            if (apiResult.code === ApiResultCode.Success) {
                this.$message.success('提交成功');
            } else {
                this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })().finally(() => {
            this.infoAuditDialogVisible = false;
        });
    }
    private onInfoAuditCancel(index: number, task: TaskView): void {
        this.selectedTask = {};
        this.infoAuditDialogVisible = false;
    }
    //#endregion

    // #region -- references by fund(deposit and margin) audit dialog

    private fundAuditState: CheckState = CheckState.Checked;

    private fundAuditNote: string = '';

    private fundAuditDialogVisible: boolean = false;

    private get fundAuditDialogTitle(): string {
        if (this.selectedTask.state === TaskState.DepositUploaded) {
            return '托管资金审核';
        } else if (this.selectedTask.state === TaskState.MarginUploaded) {
            return '保证金审核';
        } else {
            return `未知状态（${this.selectedTask.state}）`;
        }
    }

    private get fundImageUrl(): string {
        if (this.selectedTask.state === TaskState.DepositUploaded) {
            return this.selectedTask.depositImageUrl || '';
        } else if (this.selectedTask.state === TaskState.MarginUploaded) {
            return this.selectedTask.marginImageUrl || '';
        } else {
            return '';
        }
    }

    /**
     * control the DepositAudit button visibility
     * @param index 
     * @param task 
     */
    private isDepositReadyToBeAudited(index: number, task: TaskView): boolean {
        return task.state === TaskState.DepositUploaded && task.depositAuditState !== CheckState.Checked;
    }
    /**
     * control the MarginAudit button visibility
     * @param index 
     * @param task 
     */
    private isMarginReadyToBeAudited(index: number, task: TaskView): boolean {
        return task.state === TaskState.MarginUploaded && task.marginAditState !== CheckState.Checked;
    }

    private onDepositAudit(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.getDepositImageUrl();
        this.fundAuditDialogVisible = true;
    }
    private onMarginAudit(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.getMarginImageUrl();
        this.fundAuditDialogVisible = true;
    }
    private onFundAuditSubmit(auditResult: GeneralAuditParam): void {
        (async () => {
            const actionName = this.selectedTask.state ===
                TaskState.DepositUploaded ? StoreActionNames.taskDepositAudit : StoreActionNames.taskMarginAudit;
            const store = (this.$store as Store<IStoreState>);
            const apiResult: ApiResult = await store.dispatch(
                actionName,
                {
                    data: {
                        uid: this.selectedTask.uid,
                        auditState: auditResult.state,
                        note: auditResult.note,
                    } as TaskAuditParam,
                } as IStoreActionArgs);
            if (apiResult.code === ApiResultCode.Success) {
                this.$message.success('提交成功');
            } else {
                this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })().finally(() => {
            this.fundAuditDialogVisible = false;
        });
    }


    private onFundAuditCancel(index: number, task: TaskView): void {
        this.selectedTask = {};
        this.fundAuditDialogVisible = false;
        if (this.imageViewer != null) {
            this.imageViewer.destroy();
            this.imageViewer = null;
        }
    }
    private onFundPreview(): void {
        if (this.imageViewer != null) {
            this.imageViewer.destroy();
        }
        const image = new Image();
        image.src = this.fundImageUrl as string;

        this.imageViewer = new Viewer(image, {
            inline: false,
            movable: true,
            zoomable: true,
            scalable: false,
            zoomRatio: 0,
            minZoomRatio: 0.2,
            maxZoomRatio: 1,
            keyboard: false,
            zIndex: 10000,
            toolbar: {
                next: false,
                prev: false,
                play: false,
                rotateLeft: true,
                rotateRight: true,
                reset: true,
            },

        });
        this.imageViewer.show();
    }
    private onRefund(): void {
        (async () => {
            if (this.selectedTask.state === TaskState.DepositUploaded) {
                this.refundScenario = RefundScenario.DepositRefund;
                this.refundUser = await StoreUtils.$$getUserById(
                    this.store, this.selectedTask.publisherUid || '') || {};
                if (CommonUtils.isNullOrEmpty(this.refundUser.uid)) {
                    this.$message.error(`此任务指定的雇主不存在`);
                    return;
                }
            } else {
                this.refundScenario = RefundScenario.MarginRefund;
                this.refundUser = await StoreUtils.$$getUserById(
                    this.store, this.selectedTask.executorUid || '') || {};
                if (CommonUtils.isNullOrEmpty(this.refundUser.uid)) {
                    this.$message.error(`此任务指定的雇员不存在`);
                    return;
                }
            }
            this.fundAuditDialogVisible = false;
            this.refundAuditDialogVisible = true;
        })();
    }
    // #endregion

    //#region -- reference by refund dialog
    private refundAuditDialogVisible: boolean = false;
    private refundScenario: RefundScenario = RefundScenario.None;
    private refundUser: UserView = {};
    private onRefundSuccess(): void {
        this.$message.success('提交成功');
        this.refundAuditDialogVisible = false;
    }
    private onRefundCancel(): void {
        this.refundAuditDialogVisible = false;
    }
    //#endregion

    //#region -- reference by executor qualification audit
    private executorAuditDialogVisible: boolean = false;
    private executorOfSelectedTask: UserView = {};
    private get executorName(): string {
        return this.executorOfSelectedTask.name || '';
    }
    private get executorLogoUrl(): string {
        return this.executorOfSelectedTask.logoUrl || '';
    }
    private get executorQualificationStar(): number {
        return this.executorOfSelectedTask.qualificationStar || 0;
    }
    private get executorQualificationScore(): number {
        return this.executorOfSelectedTask.qualificationScore || 0;
    }

    private isExecutorReadyToBeAudited(index: number, task: TaskView): boolean {
        return (task.state === TaskState.MarginUploaded) &&
            (task.executorAuditState == null || task.executorAuditState !== CheckState.Checked);
    }

    private onExecutorAudit(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.getExecutorQualification();
        this.executorAuditDialogVisible = true;
    }
    private onExecutorAuditSubmit(auditResult: GeneralAuditParam): void {
        (async () => {
            const store = (this.$store as Store<IStoreState>);
            const apiResult: ApiResult = await store.dispatch(
                StoreActionNames.taskExecutorAudit,
                {
                    data: {
                        uid: this.selectedTask.uid,
                        auditState: auditResult.state,
                        note: auditResult.note,
                    } as TaskAuditParam,
                } as IStoreActionArgs);
            if (apiResult.code === ApiResultCode.Success) {
                this.$message.success('提交成功');
            } else {
                this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })().finally(() => {
            this.executorAuditDialogVisible = false;
        });
    }
    private onExecutorAuditCancel(index: number, task: TaskView): void {
        this.selectedTask = {};
        this.executorAuditDialogVisible = false;
    }
    //#endregion

    // #region -- references by task result audit
    private resultAuditDialogVisible: boolean = false;
    private resultAuditState: CheckState = CheckState.Checked;
    private resultAuditNote: string = '';
    private get isResultAuditDenied(): boolean {
        return this.resultAuditState === CheckState.FailedToCheck;
    }
    private isResultReadyToBeAudited(index: number, task: TaskView): boolean {
        return task.state === TaskState.ResultUploaded;
    }
    private onResultAudit(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.resultAuditDialogVisible = true;
    }
    private onResultDownload(): void {
        ComponentUtils.downloadFile(this,
            {
                scenario: FileAPIScenario.DownloadTaskResultFile,
                fileId: this.selectedTask.resultFileUid,
                version: this.selectedTask.resultFileversion,
            } as FileDownloadParam,
            `${this.selectedTask.name}.zip`);
    }

    private onResultAuditSubmitted(fileCheckParam: FileCheckParam): void {
        (async () => {
            const store = (this.$store as Store<IStoreState>);
            const apiResult: ApiResult = await store.dispatch(
                StoreActionNames.taskResultAuit,
                {
                    data: {
                        uid: this.selectedTask.uid,
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
            this.resultAuditDialogVisible = false;
        });
    }

    private onResultAuditCancelled(): void {
        this.selectedTask = {};
        this.resultAuditDialogVisible = false;
    }
    // #endregion

    // #region -- references by publisher visit dialog
    private publisherVisitDialogVisible: boolean = false;
    private publisherOfSelectedTask: UserView = {};
    private publisherRateStar: number = 0;
    private publisherVisitNote: string = '';

    private isReadyToVisitPublisher(index: number, task: TaskView): boolean {
        return task.state === TaskState.ResultChecked;
    }
    private onPublisherVisit(index: number, task: TaskView): void {
        (async () => {
            this.selectedTask = task;
            this.publisherOfSelectedTask = await StoreUtils.$$getUserById(
                this.store, this.selectedTask.publisherUid as string) || {};
            if (CommonUtils.isNullOrEmpty(this.publisherOfSelectedTask.uid)) {
                this.$message.error(`此任务雇主不存在`);
                return;
            }
            this.publisherVisitDialogVisible = true;
        })();
    }

    private onPublisherVisitSuccess(apiResult: ApiResult): void {
        this.store.commit(StoreMutationNames.taskItemReplace, apiResult.data);
        this.publisherVisitDialogVisible = false;
        this.$message.success(`提交成功`);
    }
    private onPublisherVisitCancel(): void {
        this.publisherVisitDialogVisible = false;
    }
    private onPublisherVisitFailure(apiResult: ApiResult): void {
        this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
        this.publisherVisitDialogVisible = false;
    }
    // #endregion

    // #region -- references by pay_to_executor dialog
    private payToExecutorDialogVisible: boolean = false;

    private isReadyToPayToExecutor(index: number, task: TaskView): boolean {
        return task.state === TaskState.PublisherVisited;
    }
    private onPayToExecutor(index: number, task: TaskView): void {
        (async () => {
            this.selectedTask = task;
            this.executorOfSelectedTask = await StoreUtils.$$getUserById(this.store, task.executorUid || '') || {};
            if (CommonUtils.isNullOrEmpty(this.executorOfSelectedTask.uid)) {
                this.$message.error(`此任务指定的雇员不存在`);
                return;
            }
            this.payToExecutorDialogVisible = true;
        })();
    }

    private onPayToExecutorSuccess(apiResult: ApiResult): void {
        this.$message.success(`提交成功`);
        this.store.commit(StoreMutationNames.taskItemReplace, apiResult.data);
        this.payToExecutorDialogVisible = false;
    }
    private onPayToExecutorCancel(): void {
        this.payToExecutorDialogVisible = false;
    }
    // #endregion

    // #region -- references by receipt upload dialog
    private receiptDialogVisible: boolean = false;

    private isReadyToReceiptUpload(index: number, task: TaskView): boolean {
        return task.state === TaskState.PublisherVisited &&
            task.executorReceiptRequired == null;
    }
    private onReceiptUpload(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.receiptDialogVisible = true;
    }

    private onReceiptUploadSuccess(apiResult: ApiResult): void {
        this.$message.success(`提交成功`);
        this.store.commit(StoreMutationNames.taskItemReplace, apiResult.data);
        this.receiptDialogVisible = false;
    }
    private onReceiptUploadCancel(): void {
        this.receiptDialogVisible = false;
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
        if (this.isInitialized === false) {
            (async () => {
                let apiResult: ApiResult = { code: ApiResultCode.NONE };
                // get Template Objs
                apiResult = await this.store.dispatch(StoreActionNames.templateQuery,
                    {
                        notUseLocalData: true,
                    } as IStoreActionArgs);
                if (apiResult.code !== ApiResultCode.Success) {
                    this.$message.error(`获取模板列表失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
                apiResult = await this.store.dispatch(StoreActionNames.taskQuery,
                    {
                        notUseLocalData: true,
                    } as IStoreActionArgs);
                if (apiResult.code !== ApiResultCode.Success) {
                    this.$message.error(`获取任务列表失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
                apiResult = await this.store.dispatch(StoreActionNames.userQuery,
                    {
                        notUseLocalData: false,
                    } as IStoreActionArgs);
                if (apiResult.code !== ApiResultCode.Success) {
                    this.$message.error(`获取用户列表失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
                this.isInitialized = true;
            })();
        }
    }

    private getDepositImageUrl(): void {
        if (!CommonUtils.isNullOrEmpty(this.selectedTask.depositImageUid) &&
            CommonUtils.isNullOrEmpty(this.selectedTask.depositImageUrl)) {
            (async () => {
                const url = await ComponentUtils.$$getImageUrl(
                    this, this.selectedTask.depositImageUid as string, FileAPIScenario.DownloadTaskDepositImage);
                if (CommonUtils.isNullOrEmpty(url)) {
                    this.$message.error('获取托管资金支付截图失败');
                } else {
                    this.selectedTask = Object.assign({}, this.selectedTask, { depositImageUrl: url } as TaskView);
                }
            })();
        }
    }
    private getMarginImageUrl(): void {
        if (!CommonUtils.isNullOrEmpty(this.selectedTask.marginImageUid) &&
            CommonUtils.isNullOrEmpty(this.selectedTask.marginImageUrl)) {
            (async () => {
                const url = await ComponentUtils.$$getImageUrl(
                    this, this.selectedTask.marginImageUid as string, FileAPIScenario.DownloadTaskMarginImage);
                if (CommonUtils.isNullOrEmpty(url)) {
                    this.$message.error('获取保证金支付截图失败');
                } else {
                    this.selectedTask = Object.assign({}, this.selectedTask, { marginImageUrl: url } as TaskView);
                }
            })();
        }
    }
    private getExecutorQualification(): void {
        if (!CommonUtils.isNullOrEmpty(this.selectedTask.applicantUid)) {
            this.executorOfSelectedTask = StoreUtils.getUserById(
                this.storeState, this.selectedTask.applicantUid as string) || {};
            if (this.executorOfSelectedTask != null) {
                if (this.executorOfSelectedTask.logoUrl == null &&
                    !CommonUtils.isNullOrEmpty(this.executorOfSelectedTask.logoUid)) {
                    (async () => {
                        this.executorOfSelectedTask.executorLogoUrl = await ComponentUtils.$$getImageUrl(
                            this,
                            this.executorOfSelectedTask.logoUid as string,
                            FileAPIScenario.DownloadUserLogo) || '';
                        if (!CommonUtils.isNullOrEmpty(this.executorOfSelectedTask.executorLogoUrl)) {
                            this.store.commit(StoreMutationNames.userItemUpdate, {
                                uid: this.executorOfSelectedTask.uid,
                                logoUrl: this.executorOfSelectedTask.executorLogoUrl,
                            } as UserView);
                        }
                    })();
                }
            }
        }
    }
    // #endregion

}
