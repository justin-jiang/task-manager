import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { RouterUtils } from 'client/common/RouterUtils';
import SingleFileUploadVue from 'client/components/SingleFileUploadVue.vue';
import TaskDetailInTableVue from 'client/components/TaskDetailInTableVue.vue';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskAuditParam } from 'common/requestParams/TaskAuditParam';
import { TaskResultFileUploadParam } from 'common/requestParams/TaskResultFileUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { UserView } from 'common/responseResults/UserView';
import { TaskState, getTaskStateText } from 'common/TaskState';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
const compToBeRegistered: any = {
    SingleFileUploadVue,
    TaskDetailInTableVue,
};

@Component({
    components: compToBeRegistered,
})
export class AdminTaskTS extends Vue {
    // #region -- props and methods for new published task check tab
    private readonly newTaskToBeCheckTabName: string = 'newTaskToBeCheck';
    private newTaskSearch: string = '';

    private get newTaskObjs(): TaskView[] {
        return this.storeState.taskObjs.filter((item) => {
            return item.state === TaskState.Created;
        });
    }
    private onTaskAuditAccepted(task: TaskView) {
        const confirm = this.$confirm(
            '确认批准此任务发布吗？',
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
                    StoreActionNames.taskAudit,
                    {
                        data: {
                            uid: task.uid,
                            state: TaskState.ReadyToApply,
                        } as TaskAuditParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success('任务发布审核提交成功，任务进入等待申请状态');
                } else {
                    this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                }
            })();
        }).catch(() => {
            // do nothing for cancel
        });
    }
    private onTaskAuditDenied(task: TaskView) {
        const confirm = this.$prompt(
            '确认拒绝此任务发布吗？',
            '提示', {
                confirmButtonText: '确定',
                type: 'warning',
                center: true,
                closeOnClickModal: false,
                inputType: 'textarea',
                inputPlaceholder: '请输入理由',
            });
        confirm.then(({ value }) => {
            (async () => {
                const store = (this.$store as Store<IStoreState>);
                const apiResult: ApiResult = await store.dispatch(
                    StoreActionNames.taskAudit,
                    {
                        data: {
                            uid: task.uid,
                            state: TaskState.AuditDenied,
                            note: value,
                        } as TaskAuditParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success('任务发布已被拒接');
                } else {
                    this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                }
            })();
        }).catch(() => {
            // do nothing for cancel
        });
    }
    // #endregion

    // #region -- props and methods for new task apply tab
    private readonly newApplyToBeCheckTabName: string = 'newTaskApplyTab';
    private newTaskApplySearch: string = '';

    private get newTaskApplyObjs(): TaskView[] {
        if (this.storeState.taskObjs != null) {
            return this.storeState.taskObjs.filter((item) => {
                return item.state === TaskState.Applying;
            });
        } else {
            return [];
        }
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
            (async () => {
                const store = (this.$store as Store<IStoreState>);
                const apiResult: ApiResult = await store.dispatch(
                    StoreActionNames.taskApplyAudit,
                    {
                        data: {
                            uid: task.uid,
                            state: TaskState.ReadyToAssign,
                        } as TaskAuditParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$message.success(`提交成功`);
                } else {
                    this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
                }
            })();
        }).catch(() => {
            // do nothing for cancel
        });
    }
    private onTaskApplyAditDenied(index: number, task: TaskView): void {

    }
    // #endregion

    // #region -- props and methods for Whole Page
    private isInitialized: boolean = false;
    private activeTabName: string = this.newTaskToBeCheckTabName;
    private isSearchReady(): boolean {
        return true;
    }
    private taskStateToText(state: TaskState): string {
        return getTaskStateText(state);
    }
    private timestampToText(timestamp: number): string {
        return CommonUtils.convertTimeStampToText(timestamp);
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
        if (CommonUtils.isExecutor(sessionInfo.roles) && this.isInitialized === false) {
            this.initialize();
        }
    }
    private initialize() {
        (async () => {
            const sessionInfo = this.storeState.sessionInfo;
            this.isInitialized = true;
            const apiResult = await this.store.dispatch(StoreActionNames.taskQuery,
                {
                    notUseLocalData: true,
                } as IStoreActionArgs);
            if (apiResult.code !== ApiResultCode.Success) {
                RouterUtils.goToErrorView(this.$router,
                    this.storeState,
                    `获取任务列表失败：${ApiErrorHandler.getTextByCode(apiResult.code)}`);
            }

        })();
    }

    // #endregion

}
