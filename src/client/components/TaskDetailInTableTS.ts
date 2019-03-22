import { StoreUtils } from 'client/common/StoreUtils';
import { ViewTextUtils } from 'client/common/ViewTextUtils';
import { ComponentUtils } from 'client/components/ComponentUtils';
import UserDetailInTableVue from 'client/components/UserDetailInTableVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { CommonUtils } from 'common/CommonUtils';
import { FeeCalculator } from 'common/FeeCalculator';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { ReceiptState } from 'common/ReceiptState';
import { FileDownloadParam } from 'common/requestParams/FileDownloadParam';
import { TaskView } from 'common/responseResults/TaskView';
import { UserView } from 'common/responseResults/UserView';
import { TaskState } from 'common/TaskState';
import { UserType } from 'common/UserTypes';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';

const compToBeRegistered: any = {
    UserDetailInTableVue,
};

@Component({
    components: compToBeRegistered,
})
export class TaskDetailInTableTS extends Vue {
    // #region -- component props and methods
    @Prop() public dataProp!: TaskView;
    // #endregion

    // #region -- reference by template
    private readonly LABEL_RECEIPT: number = ReceiptState.Required;
    private readonly LABEL_NO_RECEIPT: number = ReceiptState.NotRequired;
    private taskPublisher: UserView = {};
    private taskExecutor: UserView = {};
    private targetTask: TaskView = new TaskView(true);
    private averageStar: number = 0;

    private get taskStateToText(): string {
        if (this.dataProp != null) {
            return ViewTextUtils.getTaskStateText(this.dataProp.state as TaskState);
        } else {
            return '';
        }
    }
    private timestampToText(timestamp: number): string {
        return ViewTextUtils.convertTimeStampToDatetime(timestamp);
    }
    private get locationToText(): string {
        return `${this.dataProp.province} ${this.dataProp.city}`;
    }
    private get applicantName(): string {
        return CommonUtils.isNullOrEmpty(this.dataProp.applicantName) ? '暂无' : this.dataProp.applicantName as string;
    }
    private get executorName(): string {
        return CommonUtils.isNullOrEmpty(this.dataProp.executorName) ? '暂无' : this.dataProp.executorName as string;
    }
    private get executorTypes(): string {
        const types: string[] = [];
        if (this.dataProp.executorTypes != null) {
            this.dataProp.executorTypes.forEach((item: UserType) => {
                switch (item) {
                    case UserType.Individual:
                        types.push('个人');
                        break;
                    case UserType.Corp:
                        types.push('企业');
                        break;
                    default:
                        types.push(item.toString());
                }
            });
        }
        return types.join(',');
    }
    private get executorStar(): string {
        return `${this.dataProp.minExecutorStar} 星及以上`;
    }
    private get resultUploadDate(): string {
        if (CommonUtils.isNullOrEmpty(this.dataProp.resultTime)) {
            return '未上传尽调结果';
        } else {
            return ViewTextUtils.convertTimeStampToDate(this.dataProp.resultTime as number);
        }
    }
    private get averageScore(): string {
        return (this.averageStar / 5 * 100).toFixed(1);
    }
    private paymentToExecutor(): number {
        return FeeCalculator.calcPaymentToExecutor(this.targetTask);
    }
    private get isTaskExecutor(): boolean {
        return this.dataProp.executorUid === this.storeState.sessionInfo.uid;
    }

    private get isAdmin(): boolean {
        return CommonUtils.isAdmin(this.storeState.sessionInfo);
    }
    private get isTaskPublisher(): boolean {
        return this.dataProp.publisherUid === this.storeState.sessionInfo.uid;
    }
    private get isTaskResultReady(): boolean {
        return !CommonUtils.isNullOrEmpty(this.dataProp.resultFileUid);
    }
    private get isTaskExecutorReady(): boolean {
        return !CommonUtils.isNullOrEmpty(this.dataProp.applicantUid);
    }
    private getScore(starValue: number): string {
        return (starValue / 5 * 100).toFixed(0);
    }

    private onDownloadTaskTemplate(): void {
        ComponentUtils.downloadFile(this,
            {
                scenario: FileAPIScenario.DownloadTemplateFile,
                fileId: this.dataProp.templateFileUid,
            } as FileDownloadParam,
            `${this.dataProp.name}.zip`);
    }
    private onDownloadResult(): void {
        ComponentUtils.downloadFile(this,
            {
                scenario: FileAPIScenario.DownloadTaskResultFile,
                fileId: this.dataProp.resultFileUid,
                version: this.dataProp.resultFileversion,
            } as FileDownloadParam,
            `${this.dataProp.name}.zip`);
    }
    // #endregion

    // #region Vue life-circle method
    private mounted(): void {
        if (this.dataProp == null) {
            this.dataProp = {};
        }
    }
    // #endregion
    // region -- internal props and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('dataProp', { immediate: true })
    private onTaskChanged(currentValue: TaskView, previousValue: TaskView) {
        const task: TaskView = new TaskView(true);
        this.targetTask = Object.assign(task, currentValue);
        this.averageStar = ((this.targetTask.adminSatisfiedStar as number) +
            (this.targetTask.publisherResultSatisfactionStar as number) +
            (this.targetTask.publisherVisitStar as number)) / 3;
        (async () => {
            this.taskPublisher = await StoreUtils.$$getUserById(this.store, currentValue.publisherUid as string) || {};
            this.taskExecutor = await StoreUtils.$$getUserById(this.store, currentValue.applicantUid as string) || {};
        })();
    }
    // #endregion

}
