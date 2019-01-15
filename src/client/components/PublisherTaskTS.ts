import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { msgConnectionIssue } from 'client/common/Constants';
import { RouteQuery } from 'client/common/RouteQuery';
import { RouterUtils } from 'client/common/RouterUtils';
import { ComponentUtils } from 'client/components/ComponentUtils';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { TaskApplyCheckParam } from 'common/requestParams/TaskApplyCheckParam';
import { TaskBasicInfoEditParam } from 'common/requestParams/TaskBasicInfoEditParam';
import { TaskCreateParam } from 'common/requestParams/TaskCreateParam';
import { TaskRemoveParam } from 'common/requestParams/TaskRemoveParam';
import { TaskResultCheckParam } from 'common/requestParams/TaskResultCheckParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { TemplateView } from 'common/responseResults/TemplateView';
import { UserView } from 'common/responseResults/UserView';
import { getTaskStateText, TaskState } from 'common/TaskState';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { locations } from 'common/locations';
export const taskListTabName: string = 'taskListTab';
export const editCollapseName: string = 'taskEditCollapse';
const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class PublisherTaskTS extends Vue {
    // #region -- props and methods for task creation tab
    private readonly taskCreationTabName: string = 'taskCreationTab';
    private readonly taskCreationFormRefName: string = 'taskCreationForm';
    private taskCreationFormDatas: TaskCreateParam = {};
    private templateIdOfTaskCreation: string = '';

    private selectedTemplateUid: string = '';

    private get provinces(): string[] {
        const provinces: string[] = [];
        for (const item of locations) {
            provinces.push(item.name);
        }
        return provinces;
    }

    private get cities(): string[] {
        const cities: string[] = [];
        for (const pItem of locations) {
            if (this.taskCreationFormDatas.province === pItem.name) {
                for (const cItem of pItem.cities) {
                    cities.push(cItem.name);
                }
                break;
            }
        }
        return cities;
    }

    private get districts(): string[] {
        const districts: string[] = [];
        for (const pItem of locations) {
            if (this.taskCreationFormDatas.province === pItem.name) {
                for (const cItem of pItem.cities) {
                    if (cItem.name === this.taskCreationFormDatas.city) {
                        for (const dItem of cItem.districts) {
                            districts.push(dItem.name);
                        }
                        break;
                    }
                }
                break;
            }
        }
        return districts;
    }

    private getTemplateObjs(): TemplateView[] {
        return this.storeState.templateObjs;
    }

    private onTemplateChangeForTaskCreation(templateUid: string): void {
        this.selectedTemplateUid = templateUid;
    }

    private submitTaskCreationForm(): void {
        if (CommonUtils.isNullOrEmpty(this.selectedTemplateUid)) {
            this.$message.warning('请先选择任务模板');
            return;
        }
        (this.$refs[this.taskCreationFormRefName] as any).validate((valid: boolean) => {
            (async () => {
                if (valid) {
                    this.isSubmitting = true;
                    this.taskCreationFormDatas.templateFileUid = this.selectedTemplateUid;
                    const apiResult: ApiResult = await this.store.dispatch(
                        StoreActionNames.taskCreation, {
                            data: this.taskCreationFormDatas,
                        } as IStoreActionArgs);
                    if (apiResult.code === ApiResultCode.Success) {
                        this.$message.success('任务创建成功');
                        this.activeTabName = this.taskListTabName;
                        this.resetTaskCreationForm();
                    } else {
                        this.$message.error(`创建任务失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                    }
                } else {
                    this.$message({
                        message: '提交前，请检测表单是否填写正确',
                        type: 'warning',
                    });
                    return false;
                }
            })().catch((ex) => {
                this.$message.error('链接失败，请检查网络连接是否正常');
                LoggerManager.error(ex);
            }).finally(() => {
                this.isSubmitting = false;
            });
        });

    }

    private resetTaskCreationForm(): void {
        (this.$refs[this.taskCreationFormRefName] as any).resetFields();
    }
    // #endregion

    // #region -- props and methods for task list tab
    private readonly taskListTabName: string = taskListTabName;
    private readonly editCollapseName: string = editCollapseName;
    private readonly formEditRefName = 'taskEditForm';
    private formEditDatas: TaskBasicInfoEditParam = new TaskBasicInfoEditParam();
    private readonly activeCollapseNames: string[] = [];
    private search: string = '';
    private selectedTask: TaskView | undefined;
    private taskResultCheckDialogVisible: boolean = false;
    private isSearchReady(): boolean {
        return true;
    }
    private taskStateToText(state: TaskState): string {
        return getTaskStateText(state);
    }
    private timestampToText(timestamp: number): string {
        return CommonUtils.convertTimeStampToText(timestamp);
    }
    private applicantName(name: string): string {
        return CommonUtils.isNullOrEmpty(name) ? '暂无' : name;
    }
    private executorName(name: string): string {
        return CommonUtils.isNullOrEmpty(name) ? '暂无' : name;
    }
    private locationToText(task: TaskView): string {
        return `${task.province} ${task.city}`;
    }
    private getTaskObjs(): TaskView[] {
        return this.storeState.taskObjs;
    }
    private isTaskApplying(task: TaskView) {
        return task.state === TaskState.Applying;
    }
    private isTaskResultUploaded(index: number, task: TaskView): boolean {
        return task.state === TaskState.ResultUploaded;
    }
    private isBasicInfoUpdated(): boolean {
        if (this.selectedTask == null) {
            return false;
        }

        if (this.selectedTask.name !== this.formEditDatas.name ||
            this.selectedTask.reward !== this.formEditDatas.reward ||
            this.selectedTask.note !== this.formEditDatas.note) {
            return true;
        } else {
            return false;
        }

    }
    private onCollapseChange(): void {
        if (this.selectedTask == null) {
            this.activeCollapseNames.splice(0, this.activeCollapseNames.length);
            this.$message.warning('请先选择要编辑的任务');
        }
    }
    private onTaskSelect(index: number, task: TaskView): void {
        this.selectedTask = task;
        this.syncTaskEditForm();
        if (this.activeCollapseNames.length === 0) {
            this.activeCollapseNames.push(this.editCollapseName);
        }
    }
    private onTaskApplyAccept(index: number, task: TaskView): void {
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
                    this.$message.error(`任务申请接受失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }
    private onTaskApplyDeny(index: number, task: TaskView): void {
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
                    this.$message.error(`任务申请拒绝失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            });
        }).catch(() => {
            // do nothing for cancel
        });
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
                    this.$message.error(`任务删除失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }
    private onTaskResultCheck(index: number, task: TaskView): void {
        this.taskResultCheckDialogVisible = true;
    }
    private onTaskResultDownload(): void {
        ComponentUtils.downloadFile(this,
            {
                scenario: FileAPIScenario.DownloadTaskResultFile,
                fileId: (this.selectedTask as TaskView).resultFileUid,
                version: (this.selectedTask as TaskView).resultFileversion,
            } as FileDownloadParam,
            `${(this.selectedTask as TaskView).name}.zip`);
    }

    private onTaskResultCheckAccepted(): void {
        this.taskResultCheck(this.selectedTask as TaskView, true, '');
    }
    private onTaskResultCheckDenied(): void {
        this.taskResultCheck(this.selectedTask as TaskView, false, '');
    }
    private onTaskResultCheckCancel(): void {
        this.taskResultCheckDialogVisible = false;
    }
    // #endregion

    // #region -- props and methods for Whole Template
    private activeIndex: string = '';
    private readonly taskIndex: string = 'taskMenuItem';
    private readonly userInfoIndex: string = 'userInfoMenuItem';
    private readonly notificationIndex: string = '';

    private activeTabName: string = '';
    private isSubmitting: boolean = false;
    private isInitialized: boolean = false;

    // make sure initialize method only trigger one time
    private readonly formRules: any = {
        name: [
            { required: true, message: '请输入模板名称', trigger: 'blur' },
            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
        ],
        reward: [
            { required: true, message: '请输入模板名称', trigger: 'blur' },
            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
        ],
    };
    // #endregion

    // #region -- vue life-circle methods and events
    private mounted(): void {
        this.initialize();
    }
    @Watch('$store.state.sessionInfo', { immediate: true })
    private onSessionInfoChanged(currentValue: UserView, previousValue: UserView) {
        const sessionInfo = currentValue;
        if (CommonUtils.isPublisher(sessionInfo.roles) && this.isInitialized === false) {
            this.initialize();
        }
    }

    // #endregion

    // #region internal prop and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    private syncTaskEditForm(): void {
        const newData: TaskBasicInfoEditParam = {};
        if (this.selectedTask == null) {
            newData.uid = '';
            newData.name = '';
            newData.note = '';
        } else {
            newData.uid = this.selectedTask.uid;
            newData.reward = this.selectedTask.reward;
            newData.name = this.selectedTask.name;
            newData.note = this.selectedTask.note;

        }
        this.formEditDatas = newData;
    }
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
                        `获取模板列表失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
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
                        `获取模任务列表失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                    return;
                }
                // #endregion
                if (!CommonUtils.isNullOrEmpty((this.$route.query as RouteQuery).tabName)) {
                    this.activeTabName = (this.$route.query as RouteQuery).tabName as string;
                } else {
                    this.activeTabName = this.taskCreationTabName;
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router,
                    this.storeState,
                    msgConnectionIssue,
                    ex);
            });
        } else {
            LoggerManager.warn('publisher not ready', sessionInfo);
        }
    }

    private taskResultCheck(task: TaskView, pass: boolean, note: string) {
        const actionName: string = pass ? '通过' : '拒绝';

        const confirm = this.$confirm(
            `确认要${actionName}此用户的审核吗？`,
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
                    StoreActionNames.taskResultCheck,
                    {
                        data: {
                            uid: task.uid,
                            pass,
                            note,
                        } as TaskResultCheckParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success(`${actionName}任务结果审核提交成功`);
                } else {
                    this.$message.error(`${actionName}任务结果审核提交失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            }).finally(() => {
                this.taskResultCheckDialogVisible = false;
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }
    // #endregion

}
