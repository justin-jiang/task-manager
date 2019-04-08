import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { EventNames } from 'client/common/EventNames';
import { ISingleImageUploaderTS } from 'client/components/SingleImageUploaderTS';
import SingleImageUploaderVue from 'client/components/SingleImageUploaderVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { FeeCalculator } from 'common/FeeCalculator';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { ReceiptState } from 'common/ReceiptState';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskPayToExecutorImageUploadParam } from 'common/requestParams/TaskPayToExecutorImageUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { TaskView } from 'common/responseResults/TaskView';
import { UserView } from 'common/responseResults/UserView';
import { UserType } from 'common/UserTypes';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';


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
    @Prop() public taskExecutorProp!: UserView;
    // #endregion

    // #region -- referred props and methods by page template
    private readonly imageUploaderRefName: string = 'imageUploader';
    private readonly labelOfNoReceipt: number = ReceiptState.NotRequired;
    private readonly labelOfReceipt: number = ReceiptState.Required;
    private taskPropCopy: TaskView = {};
    private taskExecutorPropCopy: UserView = {};
    private receiptRequired: number = this.labelOfNoReceipt;
    private uploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UploadTaskExecutorPay,
    };
    private imageUid: string = '';
    private isImageChanged: boolean = false;
    private get taskName(): string {
        return this.taskPropCopy.name as string;
    }
    private get taskReward(): number {
        return this.taskPropCopy.reward || 0;
    }
    private get taskAgentFee(): number {
        return FeeCalculator.calcAgentFee(this.taskReward);
    }
    private get taskMargin(): number {
        return this.taskPropCopy.proposedMargin || 0;
    }
    private get payableFee(): number {
        return FeeCalculator.calcPaymentToExecutor(
            this.taskPropCopy.reward as number,
            this.taskPropCopy.proposedMargin as number,
            this.receiptRequired as ReceiptState);
    }

    private get isImageReady(): boolean {
        return this.isImageChanged;
    }
    private get executorName(): string {
        return this.taskExecutorPropCopy.realName || '';
    }
    private get bankName(): string {
        return this.taskExecutorPropCopy.bankAccountName || '';
    }
    private get bankAccountName(): string {
        return this.taskExecutorPropCopy.bankAccountName || '';
    }
    private get bankAccountNumber(): string {
        return this.taskExecutorPropCopy.bankAccountNumber || '';
    }
    private get linkBankAccountNumber(): string {
        return this.taskExecutorPropCopy.linkBankAccountNumber || '';
    }
    private get contactName(): string {
        if (this.taskExecutorPropCopy.type === UserType.Individual) {
            return this.executorName;
        } else {
            return this.taskExecutorPropCopy.principalName || '';
        }
    }
    private get contactTelephone(): string {
        return this.taskExecutorPropCopy.telephone || '';
    }
    private get contactEmail(): string {
        return this.taskExecutorPropCopy.email || '';
    }
    private get isReceiptStatNone(): boolean {
        return this.taskPropCopy.executorReceiptRequired == null ||
            this.taskPropCopy.executorReceiptRequired === ReceiptState.None;
    }
    private onSubmit(): void {
        const reqOptionParam = new TaskPayToExecutorImageUploadParam();
        reqOptionParam.uid = this.taskPropCopy.uid;
        reqOptionParam.executorReceiptRequired = this.receiptRequired;
        this.uploadParam.optionData = reqOptionParam;
        (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).submit();
    }
    private onCancel(): void {
        this.$emit(EventNames.Cancel);
    }
    private onImageChanged(): void {
        this.isImageChanged = (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).isChanged();
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
        this.taskPropCopy = this.taskProp || {};
        this.taskExecutorPropCopy = this.taskExecutorProp || {};
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('taskProp', { immediate: true })
    private onTaskPropChanged(currentValue: TaskView, previousValue: TaskView) {
        this.taskPropCopy = Object.assign({}, currentValue);
        this.receiptRequired = currentValue.executorReceiptRequired || this.labelOfNoReceipt;
        if (this.$refs[this.imageUploaderRefName] != null) {
            (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).reset();
        }
    }
    @Watch('taskExecutorProp', { immediate: true })
    private onTargetTaskExecutorChanged(currentValue: UserView, previousValue: UserView) {
        this.taskExecutorPropCopy = Object.assign({}, currentValue);
    }
    // #endregion
}
