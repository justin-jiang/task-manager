import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { EventNames } from 'client/common/EventNames';
import { ISingleImageUploaderTS } from 'client/components/SingleImageUploaderTS';
import SingleImageUploaderVue from 'client/components/SingleImageUploaderVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { FeeCalculator } from 'common/FeeCalculator';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { RefundScenario } from 'common/RefundScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskPayToExecutorImageUploadParam } from 'common/requestParams/TaskPayToExecutorImageUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { TaskView } from 'common/responseResults/TaskView';
import { UserView } from 'common/responseResults/UserView';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { TaskRefundImageUploadParam } from 'common/requestParams/TaskRefundImageUploadParam';
import { CommonUtils } from 'common/CommonUtils';

const compToBeRegistered: any = {
    SingleImageUploaderVue,
};

@Component({
    components: compToBeRegistered,
})
export class RefundDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public visibleProp!: boolean;
    @Prop() public taskProp!: TaskView;
    @Prop() public userProp!: UserView;
    @Prop() public refundScenarioProp!: RefundScenario;
    // #endregion

    // #region -- referred props and methods by page template
    private readonly imageUploaderRefName: string = 'imageUploader';


    private uploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UploadTaskRefund,
    };
    private imageUid: string = '';
    private isImageChanged: boolean = false;
    private get title(): string {
        if (this.refundScenarioProp === RefundScenario.DepositRefund) {
            return '托管金退款';
        } else {
            return '保证金退款';
        }
    }
    private get taskName(): string {
        return this.taskProp.name as string;
    }

    private get refundSum(): number {
        if (this.refundScenarioProp === RefundScenario.DepositRefund) {
            return FeeCalculator.calcPublisherDeposit(this.taskProp);
        } else {
            return this.taskProp.proposedMargin as number;
        }
    }

    private get isImageReady(): boolean {
        return this.isImageChanged;
    }
    private get userName(): string {
        if (this.refundScenarioProp === RefundScenario.DepositRefund) {
            return `雇主名称：${this.userProp.realName}`;
        } else {
            return `雇员名称：${this.userProp.realName}`;
        }

    }
    private get bankName(): string {
        return this.userProp.bankAccountName || '';
    }
    private get bankAccountName(): string {
        return this.userProp.bankAccountName || '';
    }
    private get bankAccountNumber(): string {
        return this.userProp.bankAccountNumber || '';
    }
    private get linkBankAccountNumber(): string {
        return this.userProp.linkBankAccountNumber || '';
    }
    private get contactName(): string {
        if (CommonUtils.isExecutor(this.userProp)) {
            return this.userProp.realName || '';
        } else {
            return this.userProp.principalName || '';
        }
    }
    private get contactTelephone(): string {
        return this.userProp.telephone || '';
    }
    private get contactEmail(): string {
        return this.userProp.email || '';
    }
    private onSubmit(): void {
        const reqOptionParam: TaskRefundImageUploadParam = new TaskRefundImageUploadParam();
        reqOptionParam.uid = this.taskProp.uid;
        reqOptionParam.scenario = this.refundScenarioProp;
        this.uploadParam.optionData = reqOptionParam;
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

    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('taskProp', { immediate: true })
    private onTaskPropChanged(currentValue: TaskView, previousValue: TaskView) {
        if (this.$refs[this.imageUploaderRefName] != null) {
            (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).reset();
        }
    }
    // #endregion
}
