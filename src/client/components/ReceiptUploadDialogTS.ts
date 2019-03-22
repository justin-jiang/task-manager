import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { EventNames } from 'client/common/EventNames';
import { ISingleImageUploaderTS } from 'client/components/SingleImageUploaderTS';
import SingleImageUploaderVue from 'client/components/SingleImageUploaderVue.vue';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { ReceiptState } from 'common/ReceiptState';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskExecutorReceiptUploadParam } from 'common/requestParams/TaskExecutorReceiptUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { CommonUtils } from 'common/CommonUtils';


const compToBeRegistered: any = {
    SingleImageUploaderVue,
};

@Component({
    components: compToBeRegistered,
})
export class ReceiptUploadDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public visibleProp!: boolean;
    @Prop() public taskProp!: TaskView;
    // #endregion

    // #region -- referred props and methods by page template
    private readonly imageUploaderRefName: string = 'imageUploader';
    private readonly NO_RECEIPT: number = 0;
    private targetTaskView: TaskView = {};
    private uploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UploadExecutorTaskReceipt,
    };
    private uploadOptionParam: TaskExecutorReceiptUploadParam = new TaskExecutorReceiptUploadParam(true);
    private imageUid: string = '';
    private isImageChanged: boolean = false;
    private get taskName(): string {
        return this.targetTaskView.name as string;
    }
    private get taskReward(): number {
        return this.targetTaskView.reward || 0;
    }
    private get taskAgentFee(): number {
        return Math.round(this.taskReward * 0.1);
    }
    private get taskMargin(): number {
        return this.targetTaskView.proposedMargin || 0;
    }
    private get payableFee(): number {
        return this.taskReward - this.taskAgentFee + this.taskMargin;
    }

    private get isImageReady(): boolean {
        return this.isImageChanged;
    }

    private get isReadyToSubmit(): boolean {
        if (this.uploadOptionParam.executorReceiptRequired) {
            return this.isImageReady;
        } else {
            return !CommonUtils.isNullOrEmpty(this.uploadOptionParam.executorReceiptNote);
        }
    }

    private onSubmit(): void {
        this.uploadParam.optionData = this.uploadOptionParam;
        this.uploadParam.optionData.uid = this.targetTaskView.uid;
        if (this.uploadOptionParam.executorReceiptRequired) {
            (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).submit();
        } else {
            (async () => {
                const apiResult: ApiResult = await this.store.dispatch(
                    StoreActionNames.taskReceiptDeny,
                    {
                        data: {
                            uid: this.taskProp.uid,
                            receiptNote: this.uploadOptionParam.executorReceiptNote,
                            receiptRequired: ReceiptState.NotRequired,
                        } as TaskExecutorReceiptUploadParam,
                    } as IStoreActionArgs);
                if (apiResult.code === ApiResultCode.Success) {
                    this.$emit(EventNames.Success, apiResult);
                } else {
                    this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
                }
            })();
        }
    }
    private onCancel(): void {
        this.$emit(EventNames.Cancel);
    }
    private onImageChanged(): void {
        this.isImageChanged = (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).isChanged();
    }
    private onImageReset(): void {
        this.isImageChanged = (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).isChanged();
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
    }
    // #endregion

    // #region -- internal variables and methods
    private readonly store = (this.$store as Store<IStoreState>);
    private readonly storeState = (this.$store.state as IStoreState);
    @Watch('taskProp', { immediate: true })
    private onTaskPropChanged(currentValue: TaskView, previousValue: TaskView) {
        this.targetTaskView = currentValue || {};
        this.uploadOptionParam.executorReceiptRequired =
            currentValue.executorReceiptRequired || ReceiptState.NotRequired;
        if (this.$refs[this.imageUploaderRefName] != null) {
            (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).reset();
        }
    }
    // #endregion
}
