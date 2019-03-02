import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { RouterUtils } from 'client/common/RouterUtils';
import { StoreUtils } from 'client/common/StoreUtils';
import { ViewTextUtils } from 'client/common/ViewTextUtils';
import AuditDialogVue from 'client/components/AuditDialogVue.vue';
import AvatarWithNameVue from 'client/components/AvatarWithNameVue.vue';
import { ComponentUtils } from 'client/components/ComponentUtils';
import FileCheckDialogVue from 'client/components/FileCheckDialogVue.vue';
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
import { TaskPublisherVisitParam } from 'common/requestParams/TaskPublisherVisitParam';
const compToBeRegistered: any = {
    TaskProgressDialogVue,
    TaskFormVue,
    AvatarWithNameVue,
    AuditDialogVue,
    FileCheckDialogVue,
    TaskDetailInTableVue,
};

@Component({
    components: compToBeRegistered,
})
export class AdminTaskTS extends Vue {
    // #region -- props and methods for Whole Page
    private readonly taskTableName: string = 'taskTable';
    private readonly switchActiveValue: CheckState = CheckState.Checked;
    private readonly switchInactiveValue: CheckState = CheckState.FailedToCheck;
    private isInitialized: boolean = false;
    private search: string = '';
    private selectedTask: TaskView = {};

    private isSearchReady(): boolean {
        return true;
    }
    private get filtredTaskObjs(): TaskView[] {
        let result: TaskView[];
        switch (this.taskStateRadio) {
            case TaskState.Submitted:
                result = this.toBeAuditInfos;
                break;
            case TaskState.Deposited:
                result = this.toBeAuditDeposits;
                break;

            case TaskState.ReadyToAuditApply:
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
                result = this.completedTasks;
                break;
            default:
                result = this.storeState.taskObjs;
        }
        return result.filter(
            (data: TaskView) => !this.search ||
                (data.name as string).toLowerCase().includes(this.search.toLowerCase()));
    }
    private taskStateToText(state: TaskState): string {
        return ViewTextUtils.getTaskStateText(state);
    }
    private timestampToText(timestamp: number): string {
        return CommonUtils.convertTimeStampToText(timestamp);
    }
    /**
     * used to determine whether show the edit, submit and progressquery buttons
     * @param index 
     * @param task 
     */
    private isNotSubmitted(index: number, task: TaskView): boolean {
        return task.state === TaskState.None || task.state === TaskState.Created;
    }
    // #endregion

    // #region -- reference by task state radio button group
    private taskStateRadio: TaskState = TaskState.None;
    private readonly allTasksLab: TaskState = TaskState.None;

    private readonly toBeAuditInfoLab: TaskState = TaskState.Submitted;
    private readonly toBeAuditDepositLab: TaskState = TaskState.Deposited;
    private readonly toBeAuditApplyLab: TaskState = TaskState.ReadyToAuditApply;
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

    private get toBeAuditInfos(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.Submitted;
        });
    }
    private get toBeAuditInfoCount(): number {
        return this.toBeAuditInfos.length;
    }

    private get toBeAuditDeposits(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.Deposited;
        });
    }
    private get toBeAuditDepositsCount(): number {
        return this.toBeAuditDeposits.length;
    }


    private get toBeAuditApplies(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.ReadyToAuditApply;
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
            return item.state === TaskState.ExecutorPaid;
        });
    }
    private get completedTasksCount(): number {
        return this.completedTasks.length;
    }
    // #endregion

    // #region -- props and methods for new task apply tab
    private readonly newApplyToBeCheckTabName: string = 'newTaskApplyTab';
    private newTaskApplySearch: string = '';

    private get newTaskApplyObjs(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.Applying;
        });
    }
    private onTaskApplyAditAccepted(index: number, task: TaskView): void {
        const confirm = this.$confirm(
            `确认批准此用户的申请吗？`,
            '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            this.taskApplyAudit({
                uid: task.uid,
                state: TaskState.ReadyToAuditApply,
            } as TaskAuditParam);
        }).catch(() => {
            // do nothing for cancel
        });
    }
    private onTaskApplyAditDenied(index: number, task: TaskView): void {
        const confirm = this.$prompt(
            '确认拒绝此任务申请吗？',
            '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
                inputType: 'textarea',
                inputPlaceholder: '请输入理由',
            });
        confirm.then(({ value }) => {
            this.taskApplyAudit({
                uid: task.uid,
                state: TaskState.ApplyAuditDenied,
                note: value,
            } as TaskAuditParam);
        }).catch(() => {
            // do nothing for cancel
        });
    }

    private taskApplyAudit(reqParam: TaskAuditParam): void {
        (async () => {
            const store = (this.$store as Store<IStoreState>);
            const apiResult: ApiResult = await store.dispatch(
                StoreActionNames.taskApplyAudit,
                {
                    data: reqParam,
                } as IStoreActionArgs);
            if (apiResult.code === ApiResultCode.Success) {
                this.$message.success(`提交成功`);
            } else {
                this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })();
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
    private taskDetailDialogVisible: boolean = false;
    private onTaskDetailCheck(index: number, task: TaskView): void {
        (this.$refs[this.taskTableName] as any).toggleRowExpansion(task);
    }
    private onTaskDetailDialogClosed(): void {
        this.selectedTask = {};
        this.taskDetailDialogVisible = false;
    }
    // #endregion

    // #region -- references by task info and fund(deposit and margin) audit dialog

    private fundPageImageViewer: Viewer | null = null;
    private infoAuditState: CheckState = CheckState.Checked;
    private fundAuditState: CheckState = CheckState.Checked;
    private infoAuditNote: string = '';
    private fundAuditNote: string = '';
    private infoAuditDialogVisible: boolean = false;
    private fundAuditDialogVisible: boolean = false;

    private get fundAuditDialogTitle(): string {
        if (this.selectedTask.state === TaskState.Submitted) {
            return '托管资金审核';
        } else if (this.selectedTask.state === TaskState.ReadyToAuditApply) {
            return '保证金审核';
        } else {
            return '';
        }
    }

    private get fundImageUrl(): string {
        if (this.selectedTask.state === TaskState.Deposited) {
            return this.selectedTask.depositImageUrl || '';
        } else if (this.selectedTask.state === TaskState.ReadyToAuditApply) {
            return this.selectedTask.marginImageUrl || '';
        } else {
            return '';
        }

    }

    private get isInfoAuditReadySubmit(): boolean {
        return this.infoAuditState === CheckState.Checked ||
            (this.infoAuditState === CheckState.FailedToCheck && !CommonUtils.isNullOrEmpty(this.infoAuditNote));
    }
    private get isDepositAuditReadySubmit(): boolean {
        return this.fundAuditState === CheckState.Checked ||
            (this.fundAuditState === CheckState.FailedToCheck && !CommonUtils.isNullOrEmpty(this.fundAuditNote));
    }
    private get isInfoAuditDenied(): boolean {
        return this.infoAuditState === CheckState.FailedToCheck;
    }
    private get isDepositAuditDenied(): boolean {
        return this.fundAuditState === CheckState.FailedToCheck;
    }
    private isInfoReadyToBeAudited(index: number, task: TaskView): boolean {
        return task.state === TaskState.Submitted;
    }
    private isDepositReadyToBeAudited(index: number, task: TaskView): boolean {
        return task.state === TaskState.Deposited;
    }
    private isMarginReadyToBeAudited(index: number, task: TaskView): boolean {
        return task.state === TaskState.ReadyToAuditApply;
    }

    private onInfoAudit(index: number, task: TaskView): void {
        this.selectedTask = task;
        (this.$refs[this.taskTableName] as any).toggleRowExpansion(task, true);
        this.infoAuditDialogVisible = true;
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
    private onInfoAuditSubmitted(auditResult: GeneralAuditParam): void {
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
    private onInfoAuditCancelled(index: number, task: TaskView): void {
        this.selectedTask = {};
        this.infoAuditDialogVisible = false;
    }
    private onDepositAuditSubmitted(auditResult: GeneralAuditParam): void {
        (async () => {
            const actionName = this.selectedTask.state ===
                TaskState.Submitted ? StoreActionNames.taskDepositAudit : StoreActionNames.taskApplyAudit;
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
    private onDepositAuditCancelled(index: number, task: TaskView): void {
        this.selectedTask = {};
        this.fundAuditDialogVisible = false;
        if (this.fundPageImageViewer != null) {
            this.fundPageImageViewer.destroy();
            this.fundPageImageViewer = null;
        }
    }
    private onDepositPreview(): void {
        if (this.fundPageImageViewer != null) {
            this.fundPageImageViewer.destroy();
        }
        const image = new Image();
        image.src = this.fundImageUrl as string;

        this.fundPageImageViewer = new Viewer(image, {
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
        this.fundPageImageViewer.show();
    }
    // #endregion

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

    // #region -- references by executor qualification audit
    private executorAuditDialogVisible: boolean = false;
    private executorAuditState: CheckState = CheckState.Checked;
    private executorAuditNote: string = '';
    private executorLogoUrl: string = '';
    private executorName: string = '';
    private executorQualificationStar: number = 0;
    private executorQualificationScore: number = 0;
    private get isExecutorAuditDenied(): boolean {
        return this.executorAuditState === CheckState.FailedToCheck;
    }
    private get isExecutorAuditReadySubmit(): boolean {
        return this.executorAuditState === CheckState.Checked ||
            (this.executorAuditState === CheckState.FailedToCheck &&
                !CommonUtils.isNullOrEmpty(this.executorAuditNote));
    }
    private isExecutorReadyToBeAudited(index: number, task: TaskView): boolean {
        return task.state === TaskState.ReadyToAuditApply;
    }
    private onExecutorAudit(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.getExecutorQualification();
        this.executorAuditDialogVisible = true;
    }

    private onExecutorAuditSubmitted(): void {
        this.executorAuditDialogVisible = false;
    }

    private onExecutorAuditCancelled(): void {
        this.selectedTask = {};
        this.executorAuditDialogVisible = false;
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
            let apiResult: ApiResult = { code: ApiResultCode.NONE };
            // get Template Objs
            apiResult = await this.store.dispatch(StoreActionNames.userQuery,
                {
                    notUseLocalData: false,
                } as IStoreActionArgs);
            if (apiResult.code !== ApiResultCode.Success) {
                this.$message.error(`获取用户列表失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                return;
            }
            this.publisherOfSelectedTask = (apiResult.data as UserView[]).find((item) => {
                return item.uid === this.selectedTask.publisherUid;
            }) || {};
            if (CommonUtils.isNullOrEmpty(this.publisherOfSelectedTask.uid)) {
                this.$message.error(`任务雇主不存在`);
                return;
            }
            this.publisherVisitDialogVisible = true;
        })();
    }

    private onPublisherVisitSubmitted(): void {
        (async () => {
            const store = (this.$store as Store<IStoreState>);
            const apiResult: ApiResult = await store.dispatch(
                StoreActionNames.taskPublisherVisit,
                {
                    data: {
                        uid: this.selectedTask.uid,
                        publisherVisitStar: this.publisherRateStar,
                        publisherVisitNote: this.publisherVisitNote,
                    } as TaskPublisherVisitParam,
                } as IStoreActionArgs);
            if (apiResult.code === ApiResultCode.Success) {
                this.$message.success(`提交成功`);
            } else {
                this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
            }
        })().finally(() => {
            this.publisherVisitDialogVisible = false;
        });
    }
    private onPublisherVisitCancelled(): void {
        this.publisherVisitDialogVisible = false;
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
                    RouterUtils.goToErrorView(this.$router,
                        this.storeState,
                        `获取模板列表失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                    return;
                }
                apiResult = await this.store.dispatch(StoreActionNames.taskQuery,
                    {
                        notUseLocalData: true,
                    } as IStoreActionArgs);
                if (apiResult.code !== ApiResultCode.Success) {
                    RouterUtils.goToErrorView(this.$router,
                        this.storeState,
                        `获取任务列表失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                    return;
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
            const executor = StoreUtils.getUserById(this.storeState, this.selectedTask.applicantUid as string);
            if (executor != null) {
                if (executor.logoUrl == null) {
                    (async () => {
                        this.executorLogoUrl = await ComponentUtils.$$getImageUrl(
                            this, executor.logoUid as string, FileAPIScenario.DownloadUserLogo) || '';
                        if (!CommonUtils.isNullOrEmpty(this.executorLogoUrl)) {
                            this.store.commit(StoreMutationNames.userItemUpdate, {
                                uid: executor.uid,
                                logoUrl: this.executorLogoUrl,
                            } as UserView);
                        }
                    })();
                } else {
                    this.executorLogoUrl = executor.logoUrl;
                }
                this.executorQualificationScore = executor.qualificationScore || 0;
                this.executorQualificationStar = executor.qualificationStar || 0;
            }
        }
    }
    // #endregion

}
