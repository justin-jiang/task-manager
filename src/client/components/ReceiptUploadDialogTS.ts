import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { EventNames } from 'client/common/EventNames';
import { ISingleImageUploaderTS } from 'client/components/SingleImageUploaderTS';
import SingleImageUploaderVue from 'client/components/SingleImageUploaderVue.vue';
import { IStoreActionArgs } from 'client/VuexOperations/IStoreActionArgs';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { StoreActionNames } from 'client/VuexOperations/StoreActionNames';
import { CommonUtils } from 'common/CommonUtils';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { ReceiptState } from 'common/ReceiptState';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskExecutorReceiptNotRequiredParam } from 'common/requestParams/TaskExecutorReceiptNotRequiredParam';
import { TaskExecutorReceiptUploadParam } from 'common/requestParams/TaskExecutorReceiptUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { ApiResultCode } from 'common/responseResults/ApiResultCode';
import { TaskView } from 'common/responseResults/TaskView';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';


const compToBeRegistered: any = {
    SingleImageUploaderVue,
};

@Component({
    components: compToBeRegistered,
})
/**
 * used to upload executor receipt or set executor receipt not required
 */
export class ReceiptUploadDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public visibleProp!: boolean;
    @Prop() public taskProp!: TaskView;
    // #endregion

    // #region -- referred props and methods by page template
    private readonly imageUploaderRefName: string = 'imageUploader';
    // the following 2 lables are used by el-radio
    private readonly labelOfNoReceipt: ReceiptState = ReceiptState.NotRequired;
    private readonly labelOfReceipt: ReceiptState = ReceiptState.Required;
    // task data copy whose update will not impact the real data
    private taskPropCopy: TaskView = {};
    // bind to el-radio group
    private executorReceiptRequired: ReceiptState = ReceiptState.NotRequired;

    // request param of receipt file upload
    private uploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UploadExecutorTaskReceipt,
    };

    private uploadOptionParam: TaskExecutorReceiptUploadParam = new TaskExecutorReceiptUploadParam(true);
    private notRequiredOptionParam: TaskExecutorReceiptNotRequiredParam = new TaskExecutorReceiptNotRequiredParam(true);

    private isImageChanged: boolean = false;

    private get isImageReady(): boolean {
        return this.isImageChanged;
    }
    // bind to submit button disabled prop
    private get isReadyToSubmit(): boolean {
        if (this.executorReceiptRequired === ReceiptState.Required) {
            return this.isImageReady;
        } else {
            return !CommonUtils.isNullOrEmpty(this.notRequiredOptionParam.executorReceiptNote);
        }
    }

    private get isReceiptStateNone(): boolean {
        return this.taskPropCopy.executorReceiptRequired == null ||
            this.taskPropCopy.executorReceiptRequired === ReceiptState.None;
    }

    private get isReceiptRequired(): boolean {
        return this.executorReceiptRequired === ReceiptState.Required;
    }

    private onSubmit(): void {
        if (this.executorReceiptRequired === ReceiptState.Required) {
            this.uploadParam.optionData = this.uploadOptionParam;
            (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).submit();
        } else {
            (async () => {
                const apiResult: ApiResult = await this.store.dispatch(
                    StoreActionNames.taskExecutorReceiptNotRequired,
                    {
                        data: this.notRequiredOptionParam,
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
        this.isImageChanged = false;
    }
    private onUploadSuccess(apiResult: ApiResult) {
        this.isImageChanged = false;
        this.$emit(EventNames.Success, apiResult);
    }
    private onUploadFailure(apiResult: ApiResult): void {
        this.isImageChanged = false;
        this.$message.error(`提交失败：${ApiErrorHandler.getTextByCode(apiResult)}`);
        this.$emit(EventNames.Failure, apiResult);
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
        this.taskPropCopy = Object.assign({}, currentValue);
        this.executorReceiptRequired =
            currentValue.executorReceiptRequired || ReceiptState.NotRequired;
        this.notRequiredOptionParam.uid = this.taskPropCopy.uid;
        this.uploadOptionParam.uid = this.taskPropCopy.uid;
        if (this.$refs[this.imageUploaderRefName] != null) {
            (this.$refs[this.imageUploaderRefName] as any as ISingleImageUploaderTS).reset();
        }
    }
    // #endregion
}
