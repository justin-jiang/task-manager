import { msgConnectionIssue } from 'client/common/Constants';
import { RouterUtils } from 'client/common/RouterUtils';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import { LoggerManager } from 'client/LoggerManager';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskApplyParam } from 'common/requestParams/TaskApplyParam';
import { TaskResultFileUploadParam } from 'common/requestParams/TaskResultFileUploadParam';
import { APIResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { UserView } from 'common/responseResults/UserView';
import { TaskState, getTaskStateText } from 'common/TaskState';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { UserState } from 'common/UserState';
import { UserRole } from 'common/UserRole';
import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
const compToBeRegistered: any = {
    SingleFileUploadVue,
};

@Component({
    components: compToBeRegistered,
})
export class ExecutorTaskTS extends Vue {
    // #region -- props and methods for ready-to-apply task tab
    private readonly readyToApplyTaskTabName: string = 'readyToApplyTaskTab';
    private readyToApplyTaskSearch: string = '';

    private readyToApplyTaskObjs(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.ReadyToApply;
        });
    }
    private onTaskApply(index: number, task: TaskView) {
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
                const apiResult: APIResult = await store.dispatch(
                    StoreActionNames.taskApply,
                    {
                        data: {
                            uid: task.uid,
                        } as TaskApplyParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success('任务申请提交成功，等待发布人批准');
                } else {
                    this.$message.error(`任务申请提交失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                }
            })().catch((ex) => {
                RouterUtils.goToErrorView(this.$router, this.storeState, msgConnectionIssue, ex);
            });
        }).catch(() => {
            // do nothing for cancel
        });
    }
    // #endregion

    // #region -- props and methods for appling/ied task list tab
    private readonly appliedTaskTabName: string = 'appliedTaskTab';
    private readonly editCollapseName: string = 'editCollapseName';
    private appliedTaskSearch: string = '';
    private taskResultFileTypes: string[] = ['application/zip'];
    private taskResultFileSizeMLimit: number = 100;
    private filePostParam: FileUploadParam = {};
    private selectedTaskIndex: number | undefined;
    private readonly activeCollapseNames: string[] = [];

    private appliedTaskObjs(): TaskView[] {
        if (this.storeState.taskObjs != null) {
            return this.storeState.taskObjs.filter((item) => {
                return item.state !== TaskState.ReadyToApply;
            });
        } else {
            return [];
        }
    }
    private isTaskApplied(index: number, task: TaskView): boolean {
        return task.state === TaskState.Assigned;
    }
    private onSelectTaskResultUpload(index: number, task: TaskView): void {
        this.selectedTaskIndex = index;
        if (this.activeCollapseNames.length === 0) {
            this.activeCollapseNames.push(this.editCollapseName);
        }
        this.filePostParam.metadata = new TaskResultFileUploadParam();
        this.filePostParam.metadata.uid = task.uid;
    }
    private onCollapseChange(): void {
        if (this.selectedTaskIndex == null) {
            this.activeCollapseNames.splice(0, this.activeCollapseNames.length);
            this.$message.warning('请先选择要提交结果的任务');
        }
    }
    private onTaskResultUploadSuccess() {
        this.$message.success('任务结果文件上传成功');
    }

    // #endregion

    // #region -- props and methods for Whole Page
    private activeTabName: string = this.readyToApplyTaskTabName;
    private isLoading: boolean = true;
    private isSearchReady(): boolean {
        return true;
    }
    private taskStateToText(state: TaskState): string {
        return getTaskStateText(state);
    }
    // #endregion

    // #region -- vue life-circle methods
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
    private initialize() {
        this.filePostParam.scenario = FileAPIScenario.UpdateTaskResultFile;
        const sessionInfo = this.storeState.sessionInfo;
        if (sessionInfo != null && sessionInfo.roles != null && this.isLoading) {
            (async () => {
                // only executor can see the page
                if (CommonUtils.isExecutor(sessionInfo.roles)) {

                    if (!CommonUtils.isUserReady(sessionInfo)) {
                        RouterUtils.goToUserRegisterView(this.$router, UserRole.CorpExecutor);
                        return;
                    }
                    let apiResult: APIResult = { code: ApiResultCode.Success };
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
                    apiResult = await this.store.dispatch(StoreActionNames.taskQuery,
                        {
                            notUseLocalData: true,
                        } as IStoreActionArgs);
                    if (apiResult.code !== ApiResultCode.Success) {
                        RouterUtils.goToErrorView(this.$router,
                            this.storeState,
                            `获取任务列表失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                        return;
                    }
                    if (apiResult.code === ApiResultCode.Success) {
                        this.isLoading = false;
                    }
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
