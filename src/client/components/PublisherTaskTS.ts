import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { TaskApplyAcceptParam } from 'common/requestParams/TaskApplyAcceptParam';
import { TaskApplyDenyParam } from 'common/requestParams/TaskApplyDenyParam';
import { TaskCreateParam } from 'common/requestParams/TaskCreateParam';
import { TaskEditParam } from 'common/requestParams/TaskEditParam';
import { TaskRemoveParam } from 'common/requestParams/TaskRemoveParam';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { TemplateView } from 'common/responseResults/TemplateView';
import { UserView } from 'common/responseResults/UserView';
import { TaskState, getTaskStateText } from 'common/TaskState';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { UserState } from 'common/UserState';
import { UserRole } from 'common/UserRole';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
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
                    const apiResult: APIResult = await this.store.dispatch(
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
    private readonly taskListTabName: string = 'taskListTab';
    private readonly editCollapseName: string = 'taskEditCollapse';
    private readonly formEditRefName = 'taskEditForm';
    private formEditDatas: TaskEditParam = new TaskEditParam();
    private readonly activeCollapseNames: string[] = [];
    private search: string = '';
    private selectedTaskIndex: number | undefined;
    private isSearchReady(): boolean {
        return true;
    }
    private taskStateToText(state: TaskState): string {
        return getTaskStateText(state);
    }
    private getTaskObjs(): TaskView[] {
        return this.storeState.taskObjs;
    }
    private isTaskApplying(task: TaskView) {
        return task.state === TaskState.Applying;
    }
    private isBasicInfoUpdated(): boolean {
        if (this.selectedTaskIndex == null) {
            return false;
        }
        const selectedObj: TaskView = this.getTaskObjs()[this.selectedTaskIndex];
        if (selectedObj.name !== this.formEditDatas.name ||
            selectedObj.reward !== this.formEditDatas.reward ||
            selectedObj.note !== this.formEditDatas.note) {
            return true;
        }
        return false;
    }
    private onCollapseChange(): void {
        if (this.selectedTaskIndex == null) {
            this.activeCollapseNames.splice(0, this.activeCollapseNames.length);
            this.$message.warning('请先选择要编辑的任务');
        }
    }
    private onTaskSelect(index: number, task: TaskView) {
        this.selectedTaskIndex = index;
        this.syncTaskEditForm();
        if (this.activeCollapseNames.length === 0) {
            this.activeCollapseNames.push(this.editCollapseName);
        }
    }
    private onTaskApplyAccept(index: number, task: TaskView) {
        const confirm = this.$confirm(
            '确认要接受执行人的申请吗？',
            '提示', {
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            (async () => {
                const apiResult: APIResult = await this.store.dispatch(
                    StoreActionNames.taskApplyAccept,
                    {
                        data: {
                            uid: task.uid,
                        } as TaskApplyAcceptParam,
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
    private onTaskApplyDeny(index: number, task: TaskView) {
        const confirm = this.$confirm(
            '确认要拒绝执行人的申请吗？',
            '提示', {
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            (async () => {
                const apiResult: APIResult = await this.store.dispatch(
                    StoreActionNames.taskApplyDeny,
                    {
                        data: {
                            uid: task.uid,
                        } as TaskApplyDenyParam,
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
    private onTaskDelete(index: number, task: TaskView) {
        const confirm = this.$confirm(
            '确认要删除此任务吗？',
            '提示', {
                type: 'warning',
                center: true,
                closeOnClickModal: false,
            });
        confirm.then(() => {
            (async () => {
                const apiResult: APIResult = await this.store.dispatch(
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

    // #endregion

    // #region -- props and methods for Whole Template
    private activeIndex: string = '';
    private readonly taskIndex: string = 'taskMenuItem';
    private readonly userInfoIndex: string = 'userInfoMenuItem';
    private readonly notificationIndex: string = '';

    private activeTabName: string = this.taskCreationTabName;
    private isSubmitting: boolean = false;
    private isLoading: boolean = true;

    // make sure initialize method only trigger one time
    private initializeTriggered: boolean = false;
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
        if (this.initializeTriggered === false) {
            this.initialize();
        }
    }
    @Watch('$store.state.sessionInfo', { immediate: true, deep: true })
    private onSessionInfoChanged(currentValue: UserView, previousValue: UserView) {
        const sessionInfo = currentValue;
        if (sessionInfo != null &&
            sessionInfo.roles != null &&
            this.initializeTriggered === false) {
            this.initialize();
        }
    }

    // #endregion

    // #region internal prop and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    private syncTaskEditForm(): void {
        const newData: TaskEditParam = {};
        if (this.selectedTaskIndex == null) {
            newData.uid = '';
            newData.name = '';
            newData.note = '';
        } else {
            const selectedObj: TaskView = this.getTaskObjs()[this.selectedTaskIndex];
            newData.uid = selectedObj.uid;
            newData.reward = selectedObj.reward;
            newData.name = selectedObj.name;
            newData.note = selectedObj.note;

        }
        this.formEditDatas = newData;
    }
    private initialize() {
        this.initializeTriggered = true;
        const sessionInfo = this.storeState.sessionInfo;
        if (sessionInfo != null && sessionInfo.roles != null) {
            (async () => {
                // only publisher can see the page
                if (CommonUtils.isPublisher(sessionInfo.roles)) {
                    if (!CommonUtils.isUserReady(sessionInfo)) {
                        RouterUtils.goToUserRegisterView(this.$router, UserRole.CorpPublisher);
                        return;
                    }
                    let apiResult: APIResult = { code: ApiResultCode.Success };
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
                    this.isLoading = false;
                } else {
                    RouterUtils.goToUserHomePage(this.$router, sessionInfo.roles);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router,
                    this.storeState,
                    msgConnectionIssue,
                    ex);
            });
        }
    }
    // #endregion

}
