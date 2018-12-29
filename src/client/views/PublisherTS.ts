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
import { TaskState } from 'common/TaskState';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { UserState } from 'common/UserState';
import { UserRole } from 'common/UserRole';
const compToBeRegistered: any = {
};

@Component({
    components: compToBeRegistered,
})
export class PublisherTS extends Vue {
    // #region -- props and methods for task creation tab
    private readonly taskCreationTabName: string = 'taskCreationTab';
    private readonly taskCreationFormRefName: string = 'taskCreationForm';
    private taskCreationFormDatas: TaskCreateParam = {};
    private templateIdOfTaskCreation: string = '';

    private templateObjs: TemplateView[] = [];

    private selectedTemplateId: string = '';

    private onTemplateChangeForTaskCreation(templateId: string): void {
        this.selectedTemplateId = templateId;
    }

    private submitTaskCreationForm(): void {
        if (CommonUtils.isNullOrEmpty(this.selectedTemplateId)) {
            this.$message.warning('请先选择任务模板');
            return;
        }
        (this.$refs[this.taskCreationFormRefName] as any).validate((valid: boolean) => {
            (async () => {
                if (valid) {
                    this.isSubmitting = true;
                    this.taskCreationFormDatas.templateFileId = this.selectedTemplateId;
                    const apiResult: APIResult = await this.store.dispatch(
                        StoreActionNames.taskCreation, {
                            data: this.taskCreationFormDatas,
                        } as IStoreActionArgs);
                    if (apiResult.code === ApiResultCode.Success) {
                        this.$message.success('任务创建成功');
                    } else {
                        this.$message.error(`创建任务失败，错误代码：${apiResult.code}`);
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

    private getTaskObjs(): TaskView[] {
        return this.storeState.taskObjs;
    };
    private search: string = '';
    private selectedTaskIndex: number | undefined;

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
                const result: APIResult = await this.store.dispatch(
                    StoreActionNames.taskApplyAccept,
                    {
                        data: {
                            uid: task.uid,
                        } as TaskApplyAcceptParam,
                    } as IStoreActionArgs);
                if (result.code === ApiResultCode.Success) {
                    this.$message.success(`任务申请接受成功`);
                } else {
                    this.$message.error(`任务申请接受失败，错误代码：${result.code}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router);
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
                const result: APIResult = await this.store.dispatch(
                    StoreActionNames.taskApplyDeny,
                    {
                        data: {
                            uid: task.uid,
                        } as TaskApplyDenyParam,
                    } as IStoreActionArgs);
                if (result.code === ApiResultCode.Success) {
                    this.$message.success(`任务申请拒绝成功`);
                } else {
                    this.$message.error(`任务申请拒绝失败，错误代码：${result.code}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router);
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
                const result: APIResult = await this.store.dispatch(
                    StoreActionNames.taskRemove,
                    {
                        data: {
                            uid: task.uid,
                        } as TaskRemoveParam,
                    } as IStoreActionArgs);
                if (result.code === ApiResultCode.Success) {
                    this.$message.success(`任务删除成功`);
                } else {
                    this.$message.error(`任务删除失败，错误代码：${result.code}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router);
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }

    // #endregion

    // #region -- props and methods for Whole Template
    private activeTabName: string = this.taskCreationTabName;
    private isSubmitting: boolean = false;
    private isLoading: boolean = true;

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
    @Watch('$store.state.sessionInfo', { immediate: true, deep: true })
    private onSessionInfoChanged(currentValue: UserView, previousValue: UserView) {
        const sessionInfo = currentValue;
        if (sessionInfo != null && sessionInfo.roles != null && this.isLoading) {
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
        const sessionInfo = this.storeState.sessionInfo;
        if (sessionInfo != null && sessionInfo.roles != null && this.isLoading) {
            (async () => {
                // only publisher can see the page
                if (CommonUtils.isPublisher(sessionInfo.roles)) {
                    if (sessionInfo.state !== UserState.Ready) {
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
                    if (apiResult.code === ApiResultCode.Success) {
                        this.templateObjs = this.storeState.templateObjs as TemplateView[];
                    } else {
                        this.$message.error(`获取模板列表失败，错误代码：${apiResult.code}`);
                        RouterUtils.goToErrorView(this.$router);
                        return;
                    }
                    // #endregion

                    // #region -- init for task edit
                    apiResult = await this.store.dispatch(StoreActionNames.taskQuery,
                        {
                            notUseLocalData: true,
                        } as IStoreActionArgs);
                    if (apiResult.code !== ApiResultCode.Success) {
                        this.$message.error(`获取模任务列表失败，错误代码：${apiResult.code}`);
                        RouterUtils.goToErrorView(this.$router);
                        return;
                    }
                    // #endregion
                    this.isLoading = false;
                } else {
                    RouterUtils.goToUserHomePage(this.$router, sessionInfo.roles);
                }
            })().catch((ex) => {
                this.$message.error(msgConnectionIssue);
                LoggerManager.error(ex);
            });
        }
    }
    // #endregion

}
