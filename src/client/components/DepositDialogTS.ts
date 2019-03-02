import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { ISingleImageUploaderTS } from 'client/components/SingleImageUploaderTS';
import SingleImageUploaderVue from 'client/components/SingleImageUploaderVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskDepositImageUploadParam } from 'common/requestParams/TaskDepositImageUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { TaskView } from 'common/responseResults/TaskView';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
enum EventNames {
    success = 'success',
    cancelled = 'cancelled',
}


const compToBeRegistered: any = {
    SingleImageUploaderVue,
};



@Component({
    components: compToBeRegistered,
})
export class DepositDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public visibleProp!: boolean;
    @Prop() public targetTaskProp!: TaskView;
    // #endregion

    // #region -- referred props and methods by page template
    private readonly depositUploaderRefName: string = 'depositUploader';
    private readonly NO_RECEIPT: number = 0;
    private readonly NEED_RECEIPT: number = 1;
    private targetTaskView: TaskView = {};
    private receiptRequired: number = 1;
    private onlinePayType: number = 0;
    private depositUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UpdateDeposit,
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
        return Math.round(this.taskReward * 0.1);
    }
    private get taskTotalFee(): number {
        return this.taskReward + this.taskAgentFee;
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
            receiptRequired: this.receiptRequired,
        } as TaskDepositImageUploadParam;
        (this.$refs[this.depositUploaderRefName] as any as ISingleImageUploaderTS).submit();
    }
    private onCancelled(): void {
        this.$emit(EventNames.cancelled);
    }
    private onDepositImageChanged(): void {
        this.isDepositImageChanged = true;
    }
    private onDepositImageReset(): void {
        this.isDepositImageChanged = false;
    }
    private onDepositUploadSuccess(apiResult: ApiResult) {
        this.isDepositImageChanged = false;
        this.$emit(EventNames.success, apiResult);
    }
    private onDepositUploadFailure(apiResult: ApiResult): void {
        this.isDepositImageChanged = false;
        this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
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
    private onTargetTaskChanged(currentValue: TaskView, previousValue: TaskView) {
        this.targetTaskView = currentValue || {};
        this.receiptRequired = this.NO_RECEIPT;
        if (this.$refs[this.depositUploaderRefName] != null) {
            (this.$refs[this.depositUploaderRefName] as any as ISingleImageUploaderTS).reset();
        }
    }
    // #endregion
}
