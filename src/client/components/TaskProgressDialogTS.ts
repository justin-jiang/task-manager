import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { ViewTextUtils } from 'client/common/ViewTextUtils';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { TaskHistoryQueryParam } from 'common/requestParams/TaskHistoryQueryParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { TaskHistoryItem } from 'common/TaskHistoryItem';
import { TaskState } from 'common/TaskState';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
enum EventNames {
    Closed = 'closed',
}

const compToBeRegistered: any = {
};



@Component({
    components: compToBeRegistered,
})
export class TaskProgressDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public visibleProp!: boolean;
    @Prop() public targetTaskProp!: TaskView;
    // #endregion

    // #region -- referred props and methods by page template
    private standardTaskSteps: TaskHistoryItem[] = [
        {
            state: TaskState.Created,
            createTime: 0,
            description: '',
        },
        {
            state: TaskState.Submitted,
            createTime: 0,
            description: '',
        },
        {
            state: TaskState.InfoPassed,
            createTime: 0,
            description: '',
        },
        {
            state: TaskState.Deposited,
            createTime: 0,
            description: '',
        },
        {
            state: TaskState.ReadyToApply,
            createTime: 0,
            description: '',
        },
        {
            state: TaskState.Applying,
            createTime: 0,
            description: '',
        },
        {
            state: TaskState.ReadyToAuditApply,
            createTime: 0,
            description: '',
        },
        {
            state: TaskState.Assigned,
            createTime: 0,
            description: '',
        },
        {
            state: TaskState.ResultUploaded,
            createTime: 0,
            description: '',
        },
        {
            state: TaskState.ResultAudited,
            createTime: 0,
            description: '',
        },
        {
            state: TaskState.ResultChecked,
            createTime: 0,
            description: '',
        },
        {
            state: TaskState.PublisherVisited,
            createTime: 0,
            description: '',
        },
        {
            state: TaskState.ExecutorPaid,
            createTime: 0,
            description: '',
        },
    ];
    private taskStepStatus: TaskHistoryItem[] = [];
    private activeStepIndex: number = 0;
    private targetTaskView: TaskView = {};

    private get progressDialogTitle(): string {
        if (CommonUtils.isNullOrEmpty(this.targetTaskView.uid)) {
            return '';
        } else {
            return `进度查询：${this.targetTaskView.name}`;
        }
    }
    private getProgressTitle(step: TaskHistoryItem): string {

        if (step.createTime === 0) {
            return ViewTextUtils.getTaskStateTextInProgress(step.state as TaskState);
        } else {
            return `${ViewTextUtils.getTaskStateTextInProgress(step.state as TaskState)} 
            -- 
            ${CommonUtils.convertTimeStampToText(step.createTime as number)} `;
        }
    }
    private getProgressStatus(step: TaskHistoryItem): string {
        if (step.createTime as number > 0) {
            if (step.state as TaskState > 100) {
                return 'error';
            } else {
                return 'success';
            }
        } else {
            return 'wait';
        }
    }
    private getProgressDescription(step: TaskHistoryItem): string {
        return step.description || '';
    }
    private onClosed(): void {
        this.$emit(EventNames.Closed);
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        this.targetTaskView = this.targetTaskProp || {};
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('targetTaskProp', { immediate: true })
    private onUserUidChanged(currentValue: TaskView, previousValue: TaskView) {
        this.targetTaskView = currentValue;
        this.initialize();
    }
    private initialize(): void {
        this.taskStepStatus = [];
        if (!CommonUtils.isNullOrEmpty(this.targetTaskView.uid)) {
            (async () => {
                let apiResult: ApiResult = { code: ApiResultCode.Success };
                apiResult = await this.store.dispatch(StoreActionNames.taskHistoryQuery,
                    {
                        data: { uid: this.targetTaskView.uid } as TaskHistoryQueryParam,
                    } as IStoreActionArgs);
                if (apiResult.code !== ApiResultCode.Success) {
                    this.$message.error(`获取任务进度失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                    return;
                }
                // get the completed steps till now
                this.taskStepStatus = (apiResult.data as TaskHistoryItem[]);
                this.activeStepIndex = this.taskStepStatus.length;
                // add the remained steps
                const remainedStartStepIndex: number = this.standardTaskSteps.findIndex((everyItem) => {
                    if (this.targetTaskView.state === everyItem.state) {
                        return true;
                    } else {
                        return false;
                    }
                });
                if (remainedStartStepIndex >= 0 && remainedStartStepIndex < this.standardTaskSteps.length - 1) {
                    const uncompletedSteps: TaskHistoryItem[] = this.standardTaskSteps.slice(
                        remainedStartStepIndex + 1);
                    uncompletedSteps.forEach((item) => {
                        item.uid = CommonUtils.getUUIDForMongoDB();
                        this.taskStepStatus.push(item);
                    });

                }

            })();
        }
    }
    // #endregion
}
