import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { EventNames } from 'client/common/EventNames';
import { ISingleImageUploaderTS } from 'client/components/SingleImageUploaderTS';
import SingleImageUploaderVue from 'client/components/SingleImageUploaderVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskPayToExecutorImageUploadParam } from 'common/requestParams/TaskPayToExecutorImageUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { TaskView } from 'common/responseResults/TaskView';
import { UserView } from 'common/responseResults/UserView';
import { UserType } from 'common/UserTypes';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { ReceiptState } from 'common/ReceiptState';
import { FeeCalculator } from 'common/FeeCalculator';


const compToBeRegistered: any = {
    SingleImageUploaderVue,
};

@Component({
    components: compToBeRegistered,
})
export class PayToExecutorDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public visibleProp!: boolean;
    @Prop() public taskProp!: TaskView;
    @Prop() public targetTaskExecutorProp!: UserView;
    // #endregion

    // #region -- referred props and methods by page template
    private readonly imageUploaderRefName: string = 'imageUploader';
    private readonly NO_RECEIPT: number = 0;
    private targetTaskView: TaskView = {};
    private targetTaskExecutorView: UserView = {};
    private receiptRequired: number = this.NO_RECEIPT;
    private uploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UploadTaskExecutorPay,
    };
    private imageUid: string = '';
    private isImageChanged: boolean = false;
    private get taskName(): string {
        return this.targetTaskView.name as string;
    }
    private get taskReward(): number {
        return this.targetTaskView.reward || 0;
    }
    private get taskAgentFee(): number {
        return FeeCalculator.calcAgentFee(this.taskReward);
    }
    private get taskMargin(): number {
        return this.targetTaskView.proposedMargin || 0;
    }
    private get payableFee(): number {
        return FeeCalculator.calcPaymentToExecutor(this.targetTaskView);
    }

    private get isImageReady(): boolean {
        return this.isImageChanged;
    }
    private get executorName(): string {
        return this.targetTaskExecutorView.realName || '';
    }
    private get bankName(): string {
        return this.targetTaskExecutorView.bankAccountName || '';
    }
    private get bankAccountName(): string {
        return this.targetTaskExecutorView.bankAccountName || '';
    }
    private get bankAccountNumber(): string {
        return this.targetTaskExecutorView.bankAccountNumber || '';
    }
    private get linkBankAccountNumber(): string {
        return this.targetTaskExecutorView.linkBankAccountNumber || '';
    }
    private get contactName(): string {
        if (this.targetTaskExecutorView.type === UserType.Individual) {
            return this.executorName;
        } else {
            return this.targetTaskExecutorView.principalName || '';
        }
    }
    private get contactTelephone(): string {
        return this.targetTaskExecutorView.telephone || '';
    }
    private get contactEmail(): string {
        return this.targetTaskExecutorView.email || '';
    }
    private onSubmit(): void {
        this.uploadParam.optionData = new TaskPayToExecutorImageUploadParam(true);
        this.uploadParam.optionData.uid = this.targetTaskView.uid;
        (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).submit();
    }
    private onCancel(): void {
        this.$emit(EventNames.Cancel);
    }
    private onImageChanged(): void {
        this.isImageChanged = true;
    }
    private onImageReset(): void {
        this.isImageChanged = false;
    }
    private onUploadSuccess(apiResult: ApiResult) {
        this.isImageChanged = false;
        this.$emit(EventNames.Success, apiResult);
    }
    private onUploadFailure(apiResult: ApiResult): void {
        this.isImageChanged = false;
        this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
        this.targetTaskView = this.taskProp || {};
        this.targetTaskExecutorView = this.targetTaskExecutorProp || {};
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('taskProp', { immediate: true })
    private onTaskPropChanged(currentValue: TaskView, previousValue: TaskView) {
        this.targetTaskView = currentValue || {};
        this.receiptRequired = currentValue.executorReceiptRequired || this.NO_RECEIPT;
        if (this.$refs[this.imageUploaderRefName] != null) {
            (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).reset();
        }
    }
    @Watch('targetTaskExecutorProp', { immediate: true })
    private onTargetTaskExecutorChanged(currentValue: UserView, previousValue: UserView) {
        this.targetTaskExecutorView = currentValue || {};
    }
    // #endregion
}
