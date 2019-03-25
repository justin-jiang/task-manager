import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { EventNames } from 'client/common/EventNames';
import { ISingleImageUploaderTS } from 'client/components/SingleImageUploaderTS';
import SingleImageUploaderVue from 'client/components/SingleImageUploaderVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { FeeCalculator } from 'common/FeeCalculator';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { ReceiptState } from 'common/ReceiptState';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskDepositImageUploadParam } from 'common/requestParams/TaskDepositImageUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { TaskView } from 'common/responseResults/TaskView';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';


const compToBeRegistered: any = {
    SingleImageUploaderVue,
};



@Component({
    components: compToBeRegistered,
})
export class DepositDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public visibleProp!: boolean;
    @Prop() public taskProp!: TaskView;
    // #endregion

    // #region -- referred props and methods by page template
    private readonly imageUploaderRefName: string = 'depositUploader';
    private readonly LABEL_NO_RECEIPT: number = ReceiptState.NotRequired;
    private readonly LABEL_RECEIPT: number = ReceiptState.Required;
    private targetTaskView: TaskView = {};
    private receiptRequired: number = this.LABEL_RECEIPT;
    private onlinePayType: number = 0;
    private depositUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UploadTaskDeposit,
    };
    private depositUid: string = '';
    private isDepositImageChanged: boolean = false;
    private get taskName(): string {
        return this.targetTaskView.name as string;
    }
    private get taskReward(): number {
        return this.targetTaskView.reward || 0;
    }
    private get taskAgentFee(): number {
        return FeeCalculator.calcAgentFee(this.taskReward);
    }
    private get taxFee(): number {
        if (this.receiptRequired === this.LABEL_NO_RECEIPT) {
            return 0;
        } else {
            return FeeCalculator.calcReceiptTax(this.taskReward);
        }
    }
    private get taskTotalFee(): number {
        return this.taskReward + this.taskAgentFee + this.taxFee;
    }
    private get isAliPay(): boolean {
        return this.onlinePayType === 1;
    }
    private get isDepositImageReady(): boolean {
        return this.isDepositImageChanged;
    }
    private onSubmit(): void {
        if (!this.isDepositImageChanged) {
            this.$message.warning('请上传支付');
        }
        this.depositUploadParam.optionData = {
            uid: this.targetTaskView.uid,
            publisherReceiptRequired: this.receiptRequired,
        } as TaskDepositImageUploadParam;
        (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).submit();
    }
    private onCancel(): void {
        this.$emit(EventNames.Cancel);
    }
    private onDepositImageChanged(): void {
        this.isDepositImageChanged =
            (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).isChanged();
    }
    private onDepositImageReset(): void {
        this.isDepositImageChanged = false;
    }
    private onDepositUploadSuccess(apiResult: ApiResult) {
        this.isDepositImageChanged = false;
        this.$emit(EventNames.Success, apiResult);
    }
    private onDepositUploadFailure(apiResult: ApiResult): void {
        this.isDepositImageChanged = false;
        this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
    }
    // #endregion

    // #region -- vue life-circle methods
    private mounted(): void {
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('taskProp', { immediate: true })
    private onTaskPropChanged(currentValue: TaskView, previousValue: TaskView) {
        this.targetTaskView = Object.assign({}, currentValue);
        this.receiptRequired = this.LABEL_NO_RECEIPT;
        if (this.$refs[this.imageUploaderRefName] != null) {
            (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).reset();
        }
    }
    // #endregion
}
