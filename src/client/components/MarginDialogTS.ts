import { ApiErrorHandler } from 'client/common/ApiErrorHandler';
import { ISingleImageUploaderTS } from 'client/components/SingleImageUploaderTS';
import SingleImageUploaderVue from 'client/components/SingleImageUploaderVue.vue';
import { IStoreState } from 'client/VuexOperations/IStoreState';
import { FileAPIScenario } from 'common/FileAPIScenario';
import { FileUploadParam } from 'common/requestParams/FileUploadParam';
import { TaskMarginImageUploadParam } from 'common/requestParams/TaskMarginImageUploadParam';
import { ApiResult } from 'common/responseResults/APIResult';
import { TaskView } from 'common/responseResults/TaskView';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { EventNames } from 'client/common/EventNames';


const compToBeRegistered: any = {
    SingleImageUploaderVue,
};



@Component({
    components: compToBeRegistered,
})
export class MarginDialogTS extends Vue {
    // #region -- component props and methods
    @Prop() public visibleProp!: boolean;
    @Prop() public taskProp!: TaskView;
    // #endregion

    // #region -- referred props and methods by page template
    private readonly marginUploaderRefName: string = 'marginUploader';

    private targetTaskView: TaskView = {};

    private onlinePayType: number = 0;
    private marginUploadParam: FileUploadParam = {
        scenario: FileAPIScenario.UploadTaskMargin,
    };
    private marginUid: string = '';
    private isMarginImageChanged: boolean = false;
    private get taskName(): string {
        return this.targetTaskView.name as string;
    }

    private get proposedMargin(): number {
        return this.targetTaskView.proposedMargin || 0;
    }
    private get isAliPay(): boolean {
        return this.onlinePayType === 1;
    }
    private get isMarginImageReady(): boolean {
        return this.isMarginImageChanged;
    }
    private onSubmit(): void {
        if (!this.isMarginImageChanged) {
            this.$message.warning('请上传支付凭证');
        }
        this.marginUploadParam.optionData = {
            uid: this.targetTaskView.uid,
        } as TaskMarginImageUploadParam;
        (this.$refs[this.marginUploaderRefName] as any as ISingleImageUploaderTS).submit();
    }
    private onCancel(): void {
        this.$emit(EventNames.Cancel);
    }
    private onMarginImageChanged(): void {
        this.isMarginImageChanged = (this.$refs[this.marginUploaderRefName] as any as ISingleImageUploaderTS)
            .isChanged();
    }
    private onMarginImageReset(): void {
        this.isMarginImageChanged = false;
    }
    private onMarginUploadSuccess(apiResult: ApiResult) {
        this.isMarginImageChanged = false;
        this.$emit(EventNames.Success, apiResult);
    }
    private onMarginUploadFailure(apiResult: ApiResult): void {
        this.isMarginImageChanged = false;
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
        if (this.$refs[this.marginUploaderRefName] != null) {
            (this.$refs[this.marginUploaderRefName] as any as ISingleImageUploaderTS).reset();
        }
    }
    // #endregion
}
